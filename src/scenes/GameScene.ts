import Phaser from 'phaser';
import { Player } from '../entities/Player.ts';
import { Pickup } from '../entities/Pickup.ts';
import { RoomManager } from '../systems/RoomManager.ts';
import { ROOMS } from '../config/rooms.ts';
import { PixelText } from '../entities/PixelText.ts';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private dashOrb?: Pickup;
  private dustParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private roomManager!: RoomManager;

  constructor() {
    super('GameScene');
  }

  public create(): void {
    const worldWidth = 2560;
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

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.spikes, () => this.handleSpikeHazard());

    // Initialize RoomManager (handles camera clamping, central-third tracking, and fade transitions)
    this.roomManager = new RoomManager(this, this.player, 'room_1_cavern');
    this.roomManager.init();

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
    if (this.player.y > 780 && !this.roomManager.getIsTransitioning()) {
      this.respawnPlayer();
    }
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

  private createBackground(width: number, height: number): void {
    // Gradient sky / cavern backdrop
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x0a0c14, 0x0a0c14, 0x141829, 0x141829, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // Distant cavern pillars across map
    for (let x = 60; x < width; x += 140) {
      const pillar = this.add.image(x, height / 2, 'bg_pillar');
      pillar.setAlpha(0.28);
      pillar.setScale(1.6, 6.0);
      pillar.setScrollFactor(0.35);
    }
  }

  private buildLevelGeometry(): void {
    this.buildRoom1();
    this.buildRoom2();
    this.buildRoom3();
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
    this.createPlatformBlock(1792, 330, 33, 2);
    this.createSpikes(1792, 320, 33);

    // Floating Relics
    this.createPlatformBlock(1930, 240, 4, 1);
    this.createPlatformBlock(2130, 210, 3, 1);

    // Far Right Sanctuary Altar Platform
    this.createPlatformBlock(2320, 256, 14, 6);

    // Right Boundary Wall
    this.createPlatformBlock(2544, 0, 1, 23);

    // Visual doorway indicator
    this.add.rectangle(1608, 162, 12, 4, 0x38bdf8, 0.5);
  }

  private createSpikes(startX: number, startY: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const sx = startX + i * 16;
      const spike = this.spikes.create(sx + 8, startY + 8, 'tile_spike') as Phaser.Physics.Arcade.Sprite;
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
   */
  private createPlatformBlock(
    startX: number,
    startY: number,
    tilesWide: number,
    tilesHigh: number
  ): void {
    const tileSize = 16;
    const width = tilesWide * tileSize;
    const height = tilesHigh * tileSize;

    // Visual tiles (no separate physics bodies)
    for (let x = 0; x < tilesWide; x++) {
      for (let y = 0; y < tilesHigh; y++) {
        const posX = startX + x * tileSize + tileSize / 2;
        const posY = startY + y * tileSize + tileSize / 2;
        const texture = y === 0 ? 'tile_ground' : 'tile_wall';
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
    this.platforms.add(blockCollider);
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
    this.createSignpost(2350, 220, '*** SANCTUARY REACHED! ***', '#facc15');
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

  private handleSpikeHazard(): void {
    if (this.roomManager.getIsTransitioning()) {
      return;
    }

    if (this.player.isInvulnerableToSpikes()) {
      return;
    }

    if (this.player.getIsDownSlashing()) {
      // Player landed on spikes during down-slash -> reward with pogo bounce!
      this.player.executePogo();
      return;
    }

    this.cameras.main.flash(200, 225, 29, 72);
    this.respawnPlayer();
  }

  private respawnPlayer(): void {
    const currentRoom = this.roomManager.getCurrentRoom();
    this.player.setPosition(currentRoom.spawnPoint.x, currentRoom.spawnPoint.y);
    this.player.body.setVelocity(0, 0);
  }
}
