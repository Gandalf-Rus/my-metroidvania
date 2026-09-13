import Phaser from 'phaser';
import { GameScene } from './GameScene.ts';
import { ROOMS, type RoomConfig } from '../config/rooms.ts';
import { PixelText } from '../entities/PixelText.ts';

export class UIScene extends Phaser.Scene {
  private dashBadgeText!: PixelText;
  private debugText!: PixelText;
  private debugBg!: Phaser.GameObjects.Rectangle;
  private debugPanelVisible: boolean = false;
  private gameScene?: GameScene;

  constructor() {
    super('UIScene');
  }

  public create(): void {
    this.gameScene = this.scene.get('GameScene') as GameScene;

    // Top HUD Bar: Abilities & Silksong Controls
    this.createAbilityHUD();

    // Controls Legend Bar at bottom
    this.createControlsLegend();

    // Debug Panel (F1 to toggle)
    this.createDebugPanel();

    // Listen for events from GameScene
    if (this.gameScene) {
      this.gameScene.events.on('dash-unlocked', () => {
        this.onDashUnlocked();
      });

      this.gameScene.events.on('room-changed', (room: RoomConfig) => {
        this.showRoomTitleBanner(room);
      });

      // Show initial room title on start
      this.time.delayedCall(400, () => {
        this.showRoomTitleBanner(ROOMS.room_1_cavern);
      });
    }

    // Toggle debug with F1
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-F1', () => {
        this.debugPanelVisible = !this.debugPanelVisible;
        this.debugText.setVisible(this.debugPanelVisible);
        this.debugBg.setVisible(this.debugPanelVisible);
      });
    }
  }

  public update(): void {
    if (!this.gameScene) return;

    const player = this.gameScene.getPlayer();
    if (!player) return;

    const stats = player.getStats();

    // Calculate dynamic Dash Status
    let dashStatus = 'LOCKED';
    let dashColor = '#64748b';

    if (stats.hasDash) {
      if (stats.isDashing) {
        dashStatus = 'DASHING';
        dashColor = '#facc15';
      } else if (stats.dashCooldownTimer > 0) {
        dashStatus = 'COOLDOWN';
        dashColor = '#fb923c';
      } else if (!stats.isGrounded && !stats.canAirDash) {
        dashStatus = 'SPENT';
        dashColor = '#94a3b8';
      } else {
        dashStatus = 'READY';
        dashColor = '#22d3ee';
      }
    }

    this.dashBadgeText.setText(`DASH: ${dashStatus}`);
    this.dashBadgeText.setColor(dashColor);

    // Update Debug Telemetry
    if (this.debugPanelVisible) {
      const fps = Math.round(this.game.loop.actualFps);
      this.debugText.setText(
        `FPS: ${fps}\n` +
        `Vel: [${stats.velocityX}, ${stats.velocityY}]\n` +
        `Grounded: ${stats.isGrounded ? 'YES' : 'NO'}\n` +
        `Coyote: ${stats.coyoteTimer}ms\n` +
        `JumpBuf: ${stats.jumpBufferTimer}ms\n` +
        `WallSlide: ${stats.isWallSliding ? 'YES' : 'NO'}\n` +
        `AirDash: ${stats.canAirDash ? 'AVAIL' : 'SPENT'}\n` +
        `Dash: ${dashStatus}`
      );
      this.debugBg.setSize(
        Math.max(this.debugText.width + 10, 134),
        this.debugText.height + 8
      );
    }
  }

  private createAbilityHUD(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.85);
    bg.fillRoundedRect(6, 6, 236, 20, 2);
    bg.lineStyle(1, 0x334155, 0.7);
    bg.strokeRoundedRect(6, 6, 236, 20, 2);

    // Needle Attack & Wall Jump badges (left-aligned, integer-aligned)
    const abilityText = new PixelText(this, 14, 11, 'NEEDLE [X] | WALL [Z]', {
      fontSize: '8px',
      color: '#4ade80',
    });
    abilityText.setOrigin(0, 0);
    abilityText.setAlpha(0.85);

    // Dynamic Dash Badge (right-aligned, integer-aligned)
    this.dashBadgeText = new PixelText(this, 146, 11, 'DASH: LOCKED', {
      fontSize: '8px',
      color: '#64748b',
    });
    this.dashBadgeText.setOrigin(0, 0);
    this.dashBadgeText.setAlpha(0.85);
  }

  private createControlsLegend(): void {
    const legendBg = this.add.graphics();
    legendBg.fillStyle(0x0f172a, 0.75);
    legendBg.fillRoundedRect(6, 252, 468, 14, 2);

    const legendText = new PixelText(
      this,
      0,
      0,
      '[Z] JUMP | [X] NEEDLE (DOWN+X: POGO) | [C] DASH | [A/D / ARROWS] MOVE | [F1] HUD',
      {
        fontSize: '8px',
        color: '#94a3b8',
      }
    );
    legendText.setOrigin(0, 0);
    const startX = Math.round(6 + (468 - legendText.width) / 2);
    const startY = Math.round(252 + (14 - legendText.height) / 2);
    legendText.setPosition(startX, startY);
    legendText.setAlpha(0.8);
  }

  private createDebugPanel(): void {
    this.debugBg = this.add.rectangle(340, 6, 134, 96, 0x0f172a, 0.82);
    this.debugBg.setOrigin(0, 0);
    this.debugBg.setStrokeStyle(1, 0x334155, 0.7);
    this.debugBg.setVisible(false);

    this.debugText = new PixelText(this, 345, 10, '', {
      fontSize: '8px',
      color: '#93c5fd',
      lineSpacing: 2,
    });
    this.debugText.setAlpha(0.85);
    this.debugText.setVisible(false);
  }

  private onDashUnlocked(): void {
    // Show compact animated banner with Silksong Dash key
    const banner = this.add.container(240, -40);

    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x0891b2, 0.95);
    bannerBg.fillRoundedRect(-140, -12, 280, 24, 2);
    bannerBg.lineStyle(1, 0xffffff, 1);
    bannerBg.strokeRoundedRect(-140, -12, 280, 24, 2);

    const bannerText = new PixelText(this, 0, 0, 'DASH UNLOCKED! PRESS [C]', {
      fontSize: '8px',
      color: '#ffffff',
    });
    bannerText.setPosition(Math.round(-bannerText.width / 2), Math.round(-bannerText.height / 2));
    bannerText.setOrigin(0, 0);

    banner.add([bannerBg, bannerText]);

    this.tweens.add({
      targets: banner,
      y: 40,
      duration: 400,
      ease: 'Back.easeOut',
      hold: 2400,
      yoyo: true,
      onComplete: () => {
        banner.destroy();
      },
    });
  }

  private showRoomTitleBanner(room: RoomConfig): void {
    const banner = this.add.container(240, 48);

    const titleText = new PixelText(
      this,
      0,
      0,
      room.name.toUpperCase(),
      {
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#f8fafc',
        letterSpacing: 1,
      },
      85
    );
    titleText.setPosition(Math.round(-titleText.width / 2), -10);
    titleText.setOrigin(0, 0);

    const subtitleText = new PixelText(
      this,
      0,
      0,
      `[ ${room.subtitle.toUpperCase()} ]`,
      {
        fontSize: '8px',
        color: '#94a3b8',
        letterSpacing: 1,
      }
    );
    subtitleText.setPosition(Math.round(-subtitleText.width / 2), 6);
    subtitleText.setOrigin(0, 0);

    banner.add([titleText, subtitleText]);
    banner.setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      y: 52,
      duration: 500,
      ease: 'Sine.easeOut',
      hold: 1800,
      yoyo: true,
      onComplete: () => {
        banner.destroy();
      },
    });
  }
}
