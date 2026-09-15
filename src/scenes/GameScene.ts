import Phaser from 'phaser';
import { Player } from '../entities/Player.ts';
import { Pickup } from '../entities/Pickup.ts';
import { RoomManager } from '../systems/RoomManager.ts';
import { ROOMS, type RoomConfig } from '../config/rooms.ts';
import { PixelText } from '../entities/PixelText.ts';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private dashOrb?: Pickup;
  private dustParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private snowParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private roomManager!: RoomManager;

  // Safe ground tracking (Hollow Knight hazard resurrection)
  private lastSafePosition: { x: number; y: number } = { x: 80, y: 660 };
  private safeGroundTimer: number = 0;
  private standingPlatform: Phaser.GameObjects.Rectangle | null = null;
  private isHazardRespawning: boolean = false;

  constructor() {
    super('GameScene');
  }

  public create(): void {
    const worldWidth = 4480;
    const worldHeight = 800;

    // Set world physics bounds across the multi-room map
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Create background scenery & parallax pillars
    this.createBackground(worldWidth, worldHeight);

    // Create Platforms and Level Geometry
    this.platforms = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.buildLevelGeometry();

    // Spawn Player in Room 1 (Entrance Cavern)
    const initialRoom = ROOMS.room_1_cavern;
    this.player = new Player(this, initialRoom.spawnPoint.x, initialRoom.spawnPoint.y);
    const initTileX = Math.floor(initialRoom.spawnPoint.x / 16) * 16 + 8;
    this.lastSafePosition = { x: initTileX, y: initialRoom.spawnPoint.y };

    // Collisions
    this.physics.add.collider(
      this.player,
      this.platforms,
      (_p, platform) => this.handlePlayerPlatformCollision(platform)
    );
    this.physics.add.overlap(this.player, this.spikes, () => this.handleSpikeHazard());

    // Initialize RoomManager (handles camera clamping, central-third tracking, and fade transitions)
    this.roomManager = new RoomManager(this, this.player, 'room_1_cavern');
    this.roomManager.init();

    // When room changes, set doorway spawn as the new room's initial safe tile position
    this.events.on('room-changed', (room?: RoomConfig) => {
      const snapX = Math.floor(this.player.x / 16) * 16 + 8;
      this.lastSafePosition = { x: snapX, y: Math.round(this.player.y) };
      this.standingPlatform = null;
      this.safeGroundTimer = 0;

      if (room?.zone === 'Frostpeak Reach') {
        this.snowParticles.start();
      } else {
        this.snowParticles.stop();
      }
    });

    // Spawn Dash Orb Pickup at the top of Room 2 (Crystal Shaft)
    this.dashOrb = new Pickup(this, 1280, 150, 'orb_dash', 'dash');
    this.physics.add.overlap(this.player, this.dashOrb, () => this.collectDashOrb());

    // Particle Emitter for Dust
    this.dustParticles = this.add.particles(0, 0, 'particle_dust', {
      lifespan: 250,
      speed: { min: 20, max: 60 },
      scale: { start: 1, end: 0 },
      emitting: false,
    });

    // Continuous drifting snowfall in Winter Zone (x: 2560 to 4480)
    this.snowParticles = this.add.particles(0, 0, 'particle_snow', {
      x: { min: 2560, max: 4480 },
      y: -10,
      lifespan: 3600,
      speedX: { min: -35, max: -10 },
      speedY: { min: 45, max: 95 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 0.75, end: 0.1 },
      quantity: 1,
      frequency: 100,
      emitting: false,
    });

    // Event listeners from Player
    this.setupPlayerEvents();

    // Signpost Labels in the World
    this.createSignposts();
  }

  public update(time: number, delta: number): void {
    this.player.update(time, delta);
    this.roomManager.update(time, delta);

    // Continuous check during active down-slash for robust multi-pogo
    if (this.player.getIsDownSlashing()) {
      this.checkPogoCollision();
    }

    // Fall out of world safeguard (bottom of world is 800)
    if (this.player.y > 780 && !this.roomManager.getIsTransitioning() && !this.isHazardRespawning) {
      this.triggerHazardResurrection();
    }

    // Track last safe standing platform
    this.updateSafeGroundTracking(delta);
  }

  private checkPogoCollision(): boolean {
    const slashBounds = this.player.getDownSlashBounds();
    let pogoTriggered = false;

    for (const child of this.spikes.getChildren()) {
      const spike = child as Phaser.Physics.Arcade.Sprite;
      const spikeBounds = spike.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(slashBounds, spikeBounds)) {
        pogoTriggered = true;
        break;
      }
    }

    if (pogoTriggered) {
      this.player.executePogo();
      return true;
    }
    return false;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getRoomManager(): RoomManager {
    return this.roomManager;
  }

  public getLastSafePosition(): { x: number; y: number } {
    return this.lastSafePosition;
  }

  public getSnowParticles(): Phaser.GameObjects.Particles.ParticleEmitter {
    return this.snowParticles;
  }

  private createBackground(width: number, height: number): void {
    const bgGraphics = this.add.graphics();

    // Zone 1: Forgotten Caverns backdrop (0 to 2560)
    bgGraphics.fillGradientStyle(0x0a0c14, 0x0a0c14, 0x141829, 0x141829, 1);
    bgGraphics.fillRect(0, 0, 2560, height);

    // Zone 2: Frostpeak Reach (Winter Zone) backdrop (2560 to width) - deep glacial indigo/frost
    bgGraphics.fillGradientStyle(0x02162e, 0x02162e, 0x0c2747, 0x082f49, 1);
    bgGraphics.fillRect(2560, 0, width - 2560, height);

    // Distant pillars across both zones
    for (let x = 60; x < width; x += 140) {
      const isWinter = x >= 2560;
      const texture = isWinter ? 'bg_ice_pillar' : 'bg_pillar';
      const pillar = this.add.image(x, height / 2, texture);
      pillar.setAlpha(isWinter ? 0.38 : 0.28);
      pillar.setScale(1.6, 6.0);
      pillar.setScrollFactor(0.35);
    }
  }

  private buildLevelGeometry(): void {
    this.buildRoom1();
    this.buildRoom2();
    this.buildRoom3();
    this.buildRoom4();
    this.buildRoom5();
  }

  /**
   * Room 1: Entrance Caverns (0 to 960 x, 360 to 720 y)
   * Expansive 2-screen wide cavern with multiple elevations.
   */
  private buildRoom1(): void {
    // Left boundary wall
    this.createPlatformBlock(0, 360, 1, 23);
    // Ceiling
    this.createPlatformBlock(0, 360, 60, 1);
    // Base Floor (y: 688)
    this.createPlatformBlock(0, 688, 60, 2);

    // East Corridor Ceiling (enclosing the transition tunnel: 816 to 960 x, y: 360 to 584)
    this.createPlatformBlock(816, 360, 9, 14);

    // Stepped Cavern Tiers for movement testing
    this.createPlatformBlock(160, 640, 5, 1);
    this.createPlatformBlock(280, 590, 6, 1);
    this.createPlatformBlock(420, 540, 6, 1);
    this.createPlatformBlock(560, 480, 8, 1);
    this.createPlatformBlock(700, 560, 5, 1);
    this.createPlatformBlock(760, 630, 3, 1);

    // Visual doorway glow indicator
    this.add.rectangle(954, 586, 12, 4, 0x38bdf8, 0.5);
  }

  /**
   * Room 2: Crystal Shaft (960 to 1600 x, 0 to 800 y)
   * Towering vertical shaft with wall-jumping ascent to Dash Shrine.
   */
  private buildRoom2(): void {
    // Ceiling
    this.createPlatformBlock(960, 0, 40, 1);
    // Floor
    this.createPlatformBlock(960, 688, 40, 7);

    // Lower West Corridor Ceiling (enclosing transition tunnel: 960 to 1088 x, y: 360 to 584)
    this.createPlatformBlock(960, 360, 8, 14);

    // Lower stepping ledges (shifted right outside tunnel exit)
    this.createPlatformBlock(1104, 630, 4, 1);
    // Small crevice spike hazard
    this.createSpikes(1168, 678, 3);

    // Vertical Shaft Walls (x: 1220 to 1360)
    // Left shaft wall
    this.createPlatformBlock(1220, 180, 2, 29);
    // Right shaft wall
    this.createPlatformBlock(1340, 240, 2, 26);

    // Rest ledges inside and around the shaft
    this.createPlatformBlock(1150, 510, 4, 1);
    this.createPlatformBlock(1370, 430, 4, 1);
    this.createPlatformBlock(1150, 340, 4, 1);

    // Upper Level: Dash Shrine Platform
    this.createPlatformBlock(1220, 180, 10, 2);

    // Upper Walkway extending to Room 3 doorway (y: 256)
    this.createPlatformBlock(1380, 256, 14, 2);

    // Upper East Corridor Ceiling (enclosing transition tunnel: 1472 to 1600 x, y: 0 to 160)
    this.createPlatformBlock(1472, 0, 8, 10);

    // Lower Right Wall (beneath walkway)
    this.createPlatformBlock(1584, 256, 1, 34);

    // Visual doorway indicators
    this.add.rectangle(964, 586, 12, 4, 0x38bdf8, 0.5);
    this.add.rectangle(1592, 162, 12, 4, 0x38bdf8, 0.5);
  }

  /**
   * Room 3: The Sanctuary (1600 to 2560 x, 0 to 360 y)
   * Grand 2-screen wide cavern with an epic wide spike chasm.
   */
  private buildRoom3(): void {
    // Ceiling
    this.createPlatformBlock(1600, 0, 60, 1);

    // West Corridor Ceiling (enclosing transition tunnel: 1600 to 1728 x, y: 0 to 160)
    this.createPlatformBlock(1600, 0, 8, 10);

    // Entry Platform extending through tunnel into open staging platform (y: 256)
    this.createPlatformBlock(1600, 256, 12, 6);

    // The Epic Wide Spike Abyss (x: 1792 to 2320, width 528px!)
    this.createPlatformBlock(1792, 330, 33, 2, false);
    this.createSpikes(1792, 320, 33);

    // Floating Relics
    this.createPlatformBlock(1930, 240, 4, 1);
    this.createPlatformBlock(2130, 210, 3, 1);

    // Far Right Sanctuary Altar Platform
    this.createPlatformBlock(2320, 256, 14, 6);

    // Right Boundary Wall with doorway opening into Winter Zone (Room 4)
    // Top wall above doorway (y: 0 to 160)
    this.createPlatformBlock(2544, 0, 1, 10);
    // Bottom wall below doorway (y: 256 to 368)
    this.createPlatformBlock(2544, 256, 1, 7);

    // Visual doorway indicators
    this.add.rectangle(1608, 162, 12, 4, 0x38bdf8, 0.5);
    this.add.rectangle(2548, 162, 12, 4, 0x38bdf8, 0.5);
  }

  private createSpikes(
    startX: number,
    startY: number,
    count: number,
    texture: string = 'tile_spike'
  ): void {
    for (let i = 0; i < count; i++) {
      const sx = startX + i * 16;
      const spike = this.spikes.create(sx + 8, startY + 8, texture) as Phaser.Physics.Arcade.Sprite;
      const body = spike.body as Phaser.Physics.Arcade.StaticBody | null;
      if (body) {
        body.setSize(12, 10);
        body.setOffset(2, 6);
      }
    }
  }

  /**
   * Creates a solid rectangular platform block with continuous single physics collider
   * Eliminates internal seams/cracks that cause player snagging on walls.
   * `isSafePlace` sets the 'safe_place' property on the collider for Hollow Knight resurrection.
   * `theme` selects between classic caverns ('cavern') and snowy white platforms ('snow').
   */
  private createPlatformBlock(
    startX: number,
    startY: number,
    tilesWide: number,
    tilesHigh: number,
    isSafePlace: boolean = true,
    theme: 'cavern' | 'snow' = 'cavern'
  ): Phaser.GameObjects.Rectangle {
    const tileSize = 16;
    const width = tilesWide * tileSize;
    const height = tilesHigh * tileSize;

    const groundTex = theme === 'snow' ? 'tile_snow_ground' : 'tile_ground';
    const wallTex = theme === 'snow' ? 'tile_snow_wall' : 'tile_wall';

    // Visual tiles (no separate physics bodies)
    for (let x = 0; x < tilesWide; x++) {
      for (let y = 0; y < tilesHigh; y++) {
        const posX = startX + x * tileSize + tileSize / 2;
        const posY = startY + y * tileSize + tileSize / 2;
        const texture = y === 0 ? groundTex : wallTex;
        this.add.image(posX, posY, texture);
      }
    }

    // Single unified physics rectangle
    const blockCollider = this.add.rectangle(
      startX + width / 2,
      startY + height / 2,
      width,
      height
    );
    this.physics.add.existing(blockCollider, true);
    blockCollider.setData('safe_place', isSafePlace);
    this.platforms.add(blockCollider);
    return blockCollider;
  }

  /**
   * Room 4: Glacial Pass (2560 to 3520 x, 0 to 360 y)
   * Winter Zone entry featuring white snow platforms, frost crevices, and chasm crossing.
   */
  private buildRoom4(): void {
    // Ceiling
    this.createPlatformBlock(2560, 0, 60, 1, true, 'snow');

    // West Corridor Ceiling (enclosing transition tunnel: 2560 to 2656 x, y: 0 to 160)
    this.createPlatformBlock(2560, 0, 6, 10, true, 'snow');

    // West Entry Platform extending from tunnel
    this.createPlatformBlock(2560, 256, 8, 6, true, 'snow');

    // Stepped icy tiers & crevice spike hazard
    this.createPlatformBlock(2688, 330, 6, 2, false, 'snow');
    this.createSpikes(2688, 320, 6, 'tile_ice_spike');

    this.createPlatformBlock(2784, 220, 5, 8, true, 'snow');
    this.createPlatformBlock(2880, 180, 5, 1, true, 'snow');

    // The Frozen Abyss (Dash & precision test!)
    this.createPlatformBlock(2960, 330, 22, 2, false, 'snow');
    this.createSpikes(2960, 320, 22, 'tile_ice_spike');

    // Floating snow shelves across the abyss
    this.createPlatformBlock(3000, 230, 4, 1, true, 'snow');
    this.createPlatformBlock(3130, 190, 4, 1, true, 'snow');
    this.createPlatformBlock(3240, 230, 4, 1, true, 'snow');

    // East Staging Platform extending into Room 5 doorway
    this.createPlatformBlock(3340, 256, 11, 6, true, 'snow');

    // East Corridor Ceiling (enclosing transition tunnel: 3424 to 3520 x, y: 0 to 160)
    this.createPlatformBlock(3424, 0, 6, 10, true, 'snow');

    // East Wall opening (doorway at y: 160..256)
    this.createPlatformBlock(3504, 0, 1, 10, true, 'snow');
    this.createPlatformBlock(3504, 256, 1, 7, true, 'snow');

    // Visual doorway indicators
    this.add.rectangle(2568, 162, 12, 4, 0x38bdf8, 0.5);
    this.add.rectangle(3512, 162, 12, 4, 0x38bdf8, 0.5);
  }

  /**
   * Room 5: Frozen Peaks (3520 to 4480 x, 0 to 480 y)
   * Grand vertical summit ascent with towering snow spires, wall jumping, and peak altar.
   */
  private buildRoom5(): void {
    // Ceiling
    this.createPlatformBlock(3520, 0, 60, 1, true, 'snow');

    // West Corridor Ceiling (enclosing transition tunnel: 3520 to 3616 x, y: 0 to 160)
    this.createPlatformBlock(3520, 0, 6, 10, true, 'snow');

    // West Entry Platform (y: 256)
    this.createPlatformBlock(3520, 256, 8, 14, true, 'snow');

    // Glacial Spires (Vertical Wall-Jumping Ascent!)
    // Left Spire Wall (x: 3700 to 3732)
    this.createPlatformBlock(3700, 110, 2, 22, true, 'snow');
    // Right Spire Wall (x: 3820 to 3852)
    this.createPlatformBlock(3820, 70, 2, 25, true, 'snow');

    // Shaft resting ledges
    this.createPlatformBlock(3650, 360, 3, 1, true, 'snow');
    this.createPlatformBlock(3850, 310, 4, 1, true, 'snow');
    this.createPlatformBlock(3660, 210, 3, 1, true, 'snow');

    // The Summit Altar Platform (Highest Point!)
    this.createPlatformBlock(3730, 70, 10, 2, true, 'snow');

    // High Mountain Ridge (East descent)
    this.createPlatformBlock(3920, 140, 6, 1, true, 'snow');
    this.createPlatformBlock(4050, 190, 8, 2, true, 'snow');
    this.createPlatformBlock(4220, 250, 15, 14, true, 'snow');

    // Deep crevice with ice spikes beneath the spires
    this.createPlatformBlock(3648, 448, 36, 2, false, 'snow');
    this.createSpikes(3648, 438, 36, 'tile_ice_spike');

    // Far Right World Boundary Wall
    this.createPlatformBlock(4464, 0, 1, 30, true, 'snow');

    // Visual doorway indicator
    this.add.rectangle(3528, 162, 12, 4, 0x38bdf8, 0.5);

    // Glowing Summit Beacon at top of peak
    this.add.circle(3810, 48, 8, 0x38bdf8, 0.6);
    this.add.circle(3810, 48, 4, 0xffffff, 0.9);
  }

  private createSignposts(): void {
    // Room 1 Signposts
    this.createSignpost(90, 610, 'MOVE: A/D OR ARROWS | JUMP: Z | NEEDLE: X');
    this.createSignpost(410, 515, 'LEDGE: COYOTE TIME');
    this.createSignpost(740, 645, 'EAST TUNNEL >> CRYSTAL SHAFT');

    // Room 2 Signposts
    this.createSignpost(1080, 645, 'WEST TUNNEL >> ENTRANCE CAVERNS');
    this.createSignpost(1140, 480, 'WALL JUMP: PRESS Z ON WALL');
    this.createSignpost(1230, 130, 'DASH SHRINE [C] | POGO: DOWN+X');
    this.createSignpost(1390, 225, 'EAST TUNNEL >> THE SANCTUARY');

    // Room 3 Signposts
    this.createSignpost(1730, 225, 'ABYSS: USE DASH [C] OR POGO: DOWN+X');
    this.createSignpost(2340, 220, 'EAST PORTAL >> GLACIAL PASS (WINTER REACH)', '#38bdf8');

    // Room 4 Signposts
    this.createSignpost(2650, 225, 'FROSTPEAK REACH: ENTERING WINTER REALM', '#38bdf8');
    this.createSignpost(2900, 150, 'BITING WINDS: DASH [C] ACROSS CHASM');
    this.createSignpost(3340, 225, 'EAST TUNNEL >> FROZEN PEAKS');

    // Room 5 Signposts
    this.createSignpost(3610, 225, 'SUMMIT ASCENT: WALL JUMP [Z] ON SPIRES');
    this.createSignpost(3740, 36, '*** FROSTPEAK SUMMIT - ALL REALMS CONQUERED! ***', '#38bdf8');
  }

  private createSignpost(x: number, y: number, text: string, textColor: string = '#cbd5e1'): void {
    const pixelText = new PixelText(this, x, y, text, {
      fontSize: '8px',
      color: textColor,
      padding: { x: 4, y: 3 },
      lineSpacing: 2,
    });
    pixelText.setAlpha(0.78);

    const bg = this.add.rectangle(
      Math.round(x + pixelText.width / 2),
      Math.round(y + pixelText.height / 2),
      pixelText.width,
      pixelText.height,
      0x0f172a,
      0.7
    );
    bg.setStrokeStyle(1, 0x334155, 0.6);
    bg.setDepth(pixelText.depth - 1);
  }

  private setupPlayerEvents(): void {
    this.events.on('player-jumped', (x: number, y: number) => {
      this.dustParticles.explode(6, x, y);
    });

    this.events.on('player-landed', (x: number, y: number) => {
      this.dustParticles.explode(8, x, y);
    });

    this.events.on('player-wall-jumped', (x: number, y: number) => {
      this.dustParticles.explode(6, x, y);
    });

    this.events.on('player-dash-used', (_x: number, _y: number) => {
      this.cameras.main.shake(120, 0.005);
    });

    // Needle Attack & Silksong Pogo handling
    this.events.on('player-attack', (attack: { isDownSlash: boolean }) => {
      if (attack.isDownSlash) {
        this.checkPogoCollision();
      }
    });

    this.events.on('player-pogo', (x: number, y: number) => {
      this.cameras.main.shake(60, 0.0025);
      this.dustParticles.explode(8, x, y);
    });
  }

  private collectDashOrb(): void {
    if (!this.dashOrb) return;

    this.player.hasDash = true;
    this.dashOrb.collect();
    this.dashOrb = undefined;

    // Camera flash and event to UI
    this.cameras.main.flash(400, 6, 182, 212);
    this.events.emit('dash-unlocked');
  }

  private handlePlayerPlatformCollision(platformObj: unknown): void {
    const platform = platformObj as Phaser.GameObjects.Rectangle;
    if (this.player.body.touching.down || this.player.body.blocked.down) {
      this.standingPlatform = platform;
    }
  }

  /**
   * Tracks stable footing on safe ground platforms (Hollow Knight style).
   * Aligns resurrection coordinates to the exact center of the standing tile (16px grid)
   * so the player never resurrects on the precarious edge pixel of a platform.
   */
  private updateSafeGroundTracking(delta: number): void {
    const isGrounded = this.player.body.blocked.down || this.player.body.touching.down;

    if (!isGrounded || this.isHazardRespawning || this.roomManager.getIsTransitioning()) {
      this.standingPlatform = null;
      this.safeGroundTimer = 0;
      return;
    }

    // Platform must be tagged as safe_place !== false
    const isPlatformSafe = this.standingPlatform
      ? this.standingPlatform.getData('safe_place') !== false
      : false;

    const stats = this.player.getStats();
    const isSpecialState = stats.isDashing || stats.isWallSliding || this.player.getIsControlLocked();

    if (isPlatformSafe && !isSpecialState) {
      // Calculate tile center coordinates on the standing platform
      let tileCenterX: number;
      let tileCenterY: number;

      if (this.standingPlatform) {
        const platformLeft = this.standingPlatform.x - this.standingPlatform.width / 2;
        const platformTop = this.standingPlatform.y - this.standingPlatform.height / 2;
        const tilesCount = Math.max(1, Math.round(this.standingPlatform.width / 16));
        const relX = this.player.x - platformLeft;
        const tileIndex = Phaser.Math.Clamp(Math.floor(relX / 16), 0, tilesCount - 1);

        // Center of the 16px tile horizontally (+8px from left edge of tile)
        tileCenterX = Math.round(platformLeft + tileIndex * 16 + 8);
        // Feet resting cleanly on top surface of the platform
        tileCenterY = Math.round(platformTop - 12);
      } else {
        tileCenterX = Math.floor(this.player.x / 16) * 16 + 8;
        tileCenterY = Math.round(this.player.y);
      }

      // Ensure the tile center itself is safe from any nearby hazard spikes
      if (!this.isNearHazard(tileCenterX, tileCenterY)) {
        this.safeGroundTimer += delta;
        // Require ~120ms stable footing before updating the tile checkpoint
        if (this.safeGroundTimer >= 120) {
          this.lastSafePosition = {
            x: tileCenterX,
            y: tileCenterY,
          };
        }
      } else {
        this.safeGroundTimer = 0;
      }
    } else {
      this.safeGroundTimer = 0;
    }
  }

  /**
   * Ensures the candidate safe position has sufficient clearance from spikes.
   */
  private isNearHazard(x: number, y: number): boolean {
    const clearanceX = 24;
    const clearanceY = 28;
    const children = this.spikes.getChildren();
    for (let i = 0; i < children.length; i++) {
      const spike = children[i] as Phaser.Physics.Arcade.Sprite;
      if (
        Math.abs(x - spike.x) < clearanceX &&
        Math.abs(y - spike.y) < clearanceY
      ) {
        return true;
      }
    }
    return false;
  }

  private handleSpikeHazard(): void {
    if (this.isHazardRespawning || this.roomManager.getIsTransitioning()) {
      return;
    }

    if (this.player.getIsDownSlashing()) {
      // Player landed on spikes during down-slash -> reward with pogo bounce!
      this.player.executePogo();
      return;
    }

    // Grace period for upward launch right after a successful pogo
    if (this.player.isPogoRecoil()) {
      return;
    }

    // Spikes always trigger resurrection regardless of post-damage invulnerability
    this.triggerHazardResurrection();
  }

  /**
   * Hollow Knight-style hazard resurrection:
   * 1. Lock control & freeze velocity
   * 2. Impact flash, camera shake, and soul particles
   * 3. Quick fade out to black (140ms)
   * 4. Teleport player to last safe position in total darkness
   * 5. Quick fade in from black (140ms)
   * 6. Unlock control & grant temporary i-frames with sprite flicker
   */
  private triggerHazardResurrection(): void {
    if (this.isHazardRespawning) return;
    this.isHazardRespawning = true;

    // 1. Cancel special states (dash, downslash) and lock input
    this.player.cancelSpecialStates();
    this.player.setControlLocked(true);

    // 2. Visual punch: screen flash & camera shake
    this.cameras.main.flash(180, 225, 29, 72);
    this.cameras.main.shake(160, 0.007);

    // 3. Impact dust particles
    this.dustParticles.explode(14, this.player.x, this.player.y);

    // 4. Hollow Knight-style blackout fade
    this.cameras.main.fadeOut(140, 0, 0, 0, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) {
        // 5. Teleport player to last safe position in darkness
        this.player.setPosition(this.lastSafePosition.x, this.lastSafePosition.y);
        this.player.body.setVelocity(0, 0);

        // Center camera on resurrected position immediately
        this.cameras.main.centerOn(this.lastSafePosition.x, this.lastSafePosition.y);

        // 6. Fade back in
        this.cameras.main.fadeIn(140, 0, 0, 0, (_camIn: Phaser.Cameras.Scene2D.Camera, inProgress: number) => {
          if (inProgress === 1) {
            // 7. Restore control & give generous i-frames with sprite flicker
            this.player.setControlLocked(false);
            this.player.triggerInvulnerability(1200);
            this.isHazardRespawning = false;

            // Arrival dust puff at safe resurrection tile
            this.dustParticles.explode(8, this.player.x, this.player.y + 11);
          }
        });
      }
    });
  }
}
