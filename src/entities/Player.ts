import Phaser from 'phaser';
import { PHYSICS_CONFIG } from '../config/physicsConfig.ts';

export interface PlayerStats {
  hasDash: boolean;
  hasWallJump: boolean;
  hasDoubleJump: boolean;
  isGrounded: boolean;
  isWallSliding: boolean;
  isDashing: boolean;
  canAirDash: boolean;
  dashCooldownTimer: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  facingRight: boolean;
  velocityX: number;
  velocityY: number;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;

  // Abilities
  public hasDash: boolean = false;
  public hasWallJump: boolean = true;
  public hasDoubleJump: boolean = false;

  // Movement timers & states
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private wallJumpLockTimer: number = 0;
  private dashTimer: number = 0;
  private dashCooldownTimer: number = 0;
  private attackCooldownTimer: number = 0;
  private downSlashTimer: number = 0;
  private spikeInvulnerableTimer: number = 0;
  private pogoStallTimer: number = 0;

  private isDashing: boolean = false;
  private isDownSlashing: boolean = false;
  private canAirDash: boolean = true;
  private isWallSliding: boolean = false;
  private wasGrounded: boolean = false;
  private facingRight: boolean = true;
  private ghostTimer: number = 0;
  private isControlLocked: boolean = false;

  // Silksong / Hollow Knight Input mapping
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyZ!: Phaser.Input.Keyboard.Key; // Silksong Jump
  private keyX!: Phaser.Input.Keyboard.Key; // Silksong Attack
  private keyC!: Phaser.Input.Keyboard.Key; // Silksong Dash
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup tight physics hitbox: 12x22 inside 16x24 sprite
    this.body.setSize(12, 22);
    this.body.setOffset(2, 2);
    this.body.setCollideWorldBounds(true);
    this.body.setMaxVelocity(PHYSICS_CONFIG.dashSpeed * 1.2, 700);

    this.setupInput();
  }

  private setupInput(): void {
    if (!this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Silksong Layout: Z (Jump), X (Attack), C (Dash)
    this.keyZ = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyC = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    // Common Secondary / Backup Bindings
    this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  public update(_time: number, delta: number): void {
    const dt = delta; // ms

    const isGrounded = this.body.blocked.down || this.body.touching.down;
    const isTouchingLeft = this.body.blocked.left || this.body.touching.left;
    const isTouchingRight = this.body.blocked.right || this.body.touching.right;

    // Reset air abilities upon touching ground or wall
    if (isGrounded) {
      this.coyoteTimer = PHYSICS_CONFIG.coyoteTimeMs;
      this.canAirDash = true;

      if (!this.wasGrounded) {
        // Landing dust
        this.scene.events.emit('player-landed', this.x, this.y + 11);
      }
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }
    this.wasGrounded = isGrounded;

    if (isTouchingLeft || isTouchingRight) {
      this.canAirDash = true;
    }

    // Cooldown and timers
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - dt);
    }
    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);
    }
    if (this.downSlashTimer > 0) {
      this.downSlashTimer = Math.max(0, this.downSlashTimer - dt);
      if (this.downSlashTimer <= 0) {
        this.isDownSlashing = false;
      }
    }
    if (this.spikeInvulnerableTimer > 0) {
      this.spikeInvulnerableTimer = Math.max(0, this.spikeInvulnerableTimer - dt);
    }
    if (this.pogoStallTimer > 0) {
      this.pogoStallTimer = Math.max(0, this.pogoStallTimer - dt);
    }
    if (this.wallJumpLockTimer > 0) {
      this.wallJumpLockTimer -= dt;
    }

    // Process Dash State
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.spawnDashGhost(dt);

      if (this.dashTimer <= 0) {
        this.stopDash();
      } else {
        return; // Complete lock during dash
      }
    }

    // Freeze inputs during room transitions or scene cuts
    if (this.isControlLocked) {
      this.updateAnimations(isGrounded);
      return;
    }

    // Silksong Input Checks
    const leftPressed = this.cursors.left.isDown || this.keyA.isDown;
    const rightPressed = this.cursors.right.isDown || this.keyD.isDown;
    const downPressed = this.cursors.down.isDown || this.keyS.isDown;

    // Jump: [Z] or [Space] or [W] or [Up]
    const jumpJustPressed =
      Phaser.Input.Keyboard.JustDown(this.keyZ) ||
      Phaser.Input.Keyboard.JustDown(this.keySpace) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keyW);

    const jumpReleased =
      Phaser.Input.Keyboard.JustUp(this.keyZ) ||
      Phaser.Input.Keyboard.JustUp(this.keySpace) ||
      Phaser.Input.Keyboard.JustUp(this.cursors.up) ||
      Phaser.Input.Keyboard.JustUp(this.keyW);

    // Dash: [C] or [Shift]
    const dashJustPressed =
      Phaser.Input.Keyboard.JustDown(this.keyC) ||
      Phaser.Input.Keyboard.JustDown(this.keyShift);

    // Attack: [X]
    const attackJustPressed = Phaser.Input.Keyboard.JustDown(this.keyX);

    // Fast-fall when holding down in air (only when already falling and after pogo stall window)
    if (!isGrounded && downPressed && this.body.velocity.y > 60 && this.pogoStallTimer <= 0) {
      this.body.setVelocityY(Math.min(this.body.velocity.y + 350 * (dt / 1000), 460));
    }

    // Attack action (Needle slash / down-slash)
    if (attackJustPressed && this.attackCooldownTimer <= 0) {
      this.performAttack(!isGrounded && downPressed);
    }

    // Jump Buffering
    if (jumpJustPressed) {
      this.jumpBufferTimer = PHYSICS_CONFIG.jumpBufferMs;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // Dash Trigger
    if (dashJustPressed && this.hasDash && this.dashCooldownTimer <= 0 && this.canAirDash) {
      this.startDash();
      return;
    }

    // Wall Sliding Check & Anti-Snag handling
    this.isWallSliding = false;
    const pressingIntoWall = (isTouchingLeft && leftPressed) || (isTouchingRight && rightPressed);

    if (!isGrounded && this.hasWallJump) {
      if (pressingIntoWall) {
        if (this.body.velocity.y > 0) {
          // Falling down wall -> wall slide
          this.isWallSliding = true;
          this.body.setVelocityY(Math.min(this.body.velocity.y, PHYSICS_CONFIG.wallSlideSpeed));
        }
      }
    }

    // Jump Execution (Normal, Coyote, or Wall Jump)
    if (this.jumpBufferTimer > 0) {
      if (this.isWallSliding || (!isGrounded && (isTouchingLeft || isTouchingRight))) {
        // Wall Jump!
        this.executeWallJump(isTouchingLeft ? 1 : -1);
        this.jumpBufferTimer = 0;
      } else if (this.coyoteTimer > 0) {
        // Grounded Jump (or Coyote Jump)
        this.executeJump();
        this.jumpBufferTimer = 0;
      }
    }

    // Variable Jump Height: early release dampens upward velocity
    if (jumpReleased && this.body.velocity.y < 0) {
      this.body.setVelocityY(this.body.velocity.y * PHYSICS_CONFIG.variableJumpCut);
    }

    // Horizontal Movement & Wall-Snag Prevention
    if (this.wallJumpLockTimer <= 0) {
      if (leftPressed) {
        this.facingRight = false;
        this.setFlipX(true);
        // If pressing into wall in air, prevent penetration sticking
        if (!isGrounded && isTouchingLeft) {
          this.body.setVelocityX(0);
        } else {
          this.body.setVelocityX(-PHYSICS_CONFIG.moveSpeed);
        }
      } else if (rightPressed) {
        this.facingRight = true;
        this.setFlipX(false);
        // If pressing into wall in air, prevent penetration sticking
        if (!isGrounded && isTouchingRight) {
          this.body.setVelocityX(0);
        } else {
          this.body.setVelocityX(PHYSICS_CONFIG.moveSpeed);
        }
      } else {
        this.body.setVelocityX(0);
      }
    }

    // Animation & Visual State
    this.updateAnimations(isGrounded);
  }

  private executeJump(): void {
    this.body.setVelocityY(PHYSICS_CONFIG.jumpVelocity);
    this.coyoteTimer = 0;
    this.scene.events.emit('player-jumped', this.x, this.y + 11);
  }

  private executeWallJump(direction: number): void {
    this.body.setVelocityX(direction * PHYSICS_CONFIG.wallJumpVelocityX);
    this.body.setVelocityY(PHYSICS_CONFIG.wallJumpVelocityY);
    this.wallJumpLockTimer = PHYSICS_CONFIG.wallJumpInputLockMs;
    this.facingRight = direction > 0;
    this.setFlipX(!this.facingRight);
    this.scene.events.emit('player-wall-jumped', this.x, this.y);
  }

  private startDash(): void {
    this.isDashing = true;
    this.dashTimer = PHYSICS_CONFIG.dashDurationMs;
    this.dashCooldownTimer = PHYSICS_CONFIG.dashCooldownMs;
    this.canAirDash = false;

    // Zero out gravity during dash
    this.body.setAllowGravity(false);
    const dashDir = this.facingRight ? 1 : -1;
    this.body.setVelocity(dashDir * PHYSICS_CONFIG.dashSpeed, 0);

    this.play('player-dash', true);
    this.scene.events.emit('player-dash-used', this.x, this.y, this.facingRight);
  }

  private stopDash(): void {
    this.isDashing = false;
    this.body.setAllowGravity(true);
    this.body.setVelocityX(this.facingRight ? PHYSICS_CONFIG.moveSpeed : -PHYSICS_CONFIG.moveSpeed);
  }

  private spawnDashGhost(dt: number): void {
    this.ghostTimer += dt;
    if (this.ghostTimer >= 35) {
      this.ghostTimer = 0;
      const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key, this.frame.name);
      ghost.setFlipX(this.flipX);
      ghost.setTint(0x00ffff);
      ghost.setAlpha(0.6);

      this.scene.tweens.add({
        targets: ghost,
        alpha: 0,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 200,
        onComplete: () => ghost.destroy(),
      });
    }
  }

  private performAttack(isDownSlash: boolean): void {
    if (isDownSlash) {
      this.isDownSlashing = true;
      this.downSlashTimer = 180; // Active pogo collision window
      this.attackCooldownTimer = PHYSICS_CONFIG.attackCooldownMs; // ms

      // Downward needle slash (Hornet's downward pogo arc)
      const slash = this.scene.add.sprite(this.x, this.y + 10, 'slash_down');
      slash.setOrigin(0.5, 0);

      this.scene.tweens.add({
        targets: slash,
        alpha: { from: 1, to: 0 },
        scaleX: { from: 0.8, to: 1.2 },
        scaleY: { from: 0.7, to: 1.25 },
        duration: 140,
        ease: 'Cubic.easeOut',
        onComplete: () => slash.destroy(),
      });

      this.scene.events.emit('player-attack', {
        x: this.x,
        y: this.y + 19,
        width: 44,
        height: 24,
        isDownSlash: true,
      });
    } else {
      this.attackCooldownTimer = PHYSICS_CONFIG.attackCooldownMs;

      // Horizontal needle strike (Hornet's forward needle & silk crescent)
      const dir = this.facingRight ? 1 : -1;
      const slash = this.scene.add.sprite(this.x + dir * 20, this.y - 1, 'slash_side');
      slash.setFlipX(!this.facingRight);
      slash.setOrigin(0.5, 0.5);

      this.scene.tweens.add({
        targets: slash,
        alpha: { from: 1, to: 0 },
        scaleX: { from: 0.7, to: 1.25 },
        scaleY: { from: 0.85, to: 1.15 },
        duration: 135,
        ease: 'Cubic.easeOut',
        onComplete: () => slash.destroy(),
      });

      this.scene.events.emit('player-attack', {
        x: this.x + dir * 20,
        y: this.y,
        width: 44,
        height: 22,
        isDownSlash: false,
      });
    }
  }

  public executePogo(): void {
    // Silksong needle bounce: subtle, controlled, rhythmic recoil (~1-1.2 tiles high)
    this.body.setVelocityY(PHYSICS_CONFIG.pogoVelocityY);
    this.coyoteTimer = 0;
    this.canAirDash = true; // Pogo resets dash in air!

    // Multi-pogo reliability resets:
    this.isDownSlashing = false;
    this.downSlashTimer = 0;
    this.attackCooldownTimer = 60; // Ready on descent for next rhythmic bounce
    this.spikeInvulnerableTimer = 130; // Grace period (ms) so upward launch doesn't clip spike
    this.pogoStallTimer = 90; // Prevent immediate fast-fall from pulling player straight down

    // Pogo sparkle
    this.scene.events.emit('player-pogo', this.x, this.y + 12);
  }

  public getIsDownSlashing(): boolean {
    return this.isDownSlashing;
  }

  public isInvulnerableToSpikes(): boolean {
    return this.spikeInvulnerableTimer > 0;
  }

  public getDownSlashBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 22, this.y + 8, 44, 24);
  }

  private updateAnimations(isGrounded: boolean): void {
    if (this.isDashing) {
      this.play('player-dash', true);
      return;
    }

    if (this.isWallSliding) {
      this.play('player-slide', true);
      return;
    }

    if (!isGrounded) {
      if (this.body.velocity.y < 0) {
        this.play('player-jump', true);
      } else {
        this.play('player-fall', true);
      }
      return;
    }

    if (Math.abs(this.body.velocity.x) > 10) {
      this.play('player-run', true);
    } else {
      this.play('player-idle', true);
    }
  }

  public getStats(): PlayerStats {
    return {
      hasDash: this.hasDash,
      hasWallJump: this.hasWallJump,
      hasDoubleJump: this.hasDoubleJump,
      isGrounded: this.body.blocked.down || this.body.touching.down,
      isWallSliding: this.isWallSliding,
      isDashing: this.isDashing,
      canAirDash: this.canAirDash,
      dashCooldownTimer: Math.max(0, Math.round(this.dashCooldownTimer)),
      coyoteTimer: Math.round(this.coyoteTimer),
      jumpBufferTimer: Math.round(this.jumpBufferTimer),
      facingRight: this.facingRight,
      velocityX: Math.round(this.body.velocity.x),
      velocityY: Math.round(this.body.velocity.y),
    };
  }

  public setControlLocked(locked: boolean): void {
    this.isControlLocked = locked;
    if (locked) {
      this.body.setVelocity(0, 0);
      this.play('player-idle', true);
    }
  }

  public getIsControlLocked(): boolean {
    return this.isControlLocked;
  }
}
