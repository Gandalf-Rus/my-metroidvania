import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public async create(): Promise<void> {
    this.createProceduralTextures();
    this.createAnimations();

    if ('fonts' in document) {
      try {
        await Promise.all([
          document.fonts.load('8px "Silkscreen"'),
          document.fonts.load('16px "Silkscreen"'),
          document.fonts.load('bold 16px "Silkscreen"'),
          document.fonts.ready,
        ]);
      } catch (e) {
        console.warn('Font loading check:', e);
      }
    }

    // Start Main Game and UI Scenes
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  private createProceduralTextures(): void {
    // 1. Player Idle (16x24)
    this.drawPixelCanvas('player_idle', 16, 24, (ctx) => {
      // Cape back
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(3, 8, 4, 12);
      // Torso / armor
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(5, 7, 7, 9);
      // Belt
      ctx.fillStyle = '#78350f';
      ctx.fillRect(5, 15, 7, 2);
      // Legs / boots
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 17, 3, 5);
      ctx.fillRect(9, 17, 3, 5);
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, 21, 4, 3);
      ctx.fillRect(9, 21, 4, 3);
      // Head / Helmet
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(5, 1, 7, 7);
      // Visor / glowing eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, 3, 4, 2);
      // Scarf / collar
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(5, 6, 6, 2);
    });

    // 2. Player Run Frames (4 frames)
    for (let f = 1; f <= 4; f++) {
      this.drawPixelCanvas(`player_run_${f}`, 16, 24, (ctx) => {
        const legOffset = (f === 1 || f === 3) ? 2 : -2;
        // Cape waving
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(1, 7, 5, 10);
        // Torso
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(5, 7, 7, 9);
        // Belt
        ctx.fillStyle = '#78350f';
        ctx.fillRect(5, 15, 7, 2);
        // Animated Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(5 - legOffset, 17, 3, 5);
        ctx.fillRect(9 + legOffset, 17, 3, 5);
        ctx.fillStyle = '#475569';
        ctx.fillRect(4 - legOffset, 21, 4, 3);
        ctx.fillRect(9 + legOffset, 21, 4, 3);
        // Head
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(6, 1, 7, 7);
        // Eye
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(9, 3, 4, 2);
        // Scarf
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(5, 6, 6, 2);
      });
    }

    // 3. Player Jump (16x24)
    this.drawPixelCanvas('player_jump', 16, 24, (ctx) => {
      // Cape fluttering down
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(2, 10, 5, 12);
      // Torso angled up
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(5, 5, 7, 9);
      // Tucked legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 14, 4, 5);
      ctx.fillRect(9, 14, 4, 5);
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, 18, 4, 3);
      ctx.fillRect(9, 18, 4, 3);
      // Head looking up
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(5, 0, 7, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, 2, 4, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(4, 5, 6, 2);
    });

    // 4. Player Fall (16x24)
    this.drawPixelCanvas('player_fall', 16, 24, (ctx) => {
      // Cape floating up
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(2, 2, 4, 10);
      // Torso
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(5, 6, 7, 9);
      // Extended legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 15, 3, 6);
      ctx.fillRect(9, 15, 3, 6);
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, 20, 4, 4);
      ctx.fillRect(9, 20, 4, 4);
      // Head
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(5, 1, 7, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, 3, 4, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(4, 6, 6, 2);
    });

    // 5. Player Wall Slide (16x24)
    this.drawPixelCanvas('player_slide', 16, 24, (ctx) => {
      // Body pressed against right side wall
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(2, 8, 4, 10);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(5, 6, 7, 9);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(6, 15, 6, 4);
      ctx.fillStyle = '#475569';
      ctx.fillRect(9, 18, 4, 4);
      // Head looking back
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(5, 1, 7, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(6, 3, 4, 2);
      // Friction sparks
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(14, 12, 2, 2);
      ctx.fillRect(13, 17, 2, 2);
    });

    // 6. Player Dash (20x24)
    this.drawPixelCanvas('player_dash', 20, 24, (ctx) => {
      // Horizontal aerodynamic streak
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(0, 10, 6, 3);
      ctx.fillRect(2, 14, 4, 2);
      // Cape trailing
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(4, 8, 8, 5);
      // Body
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(9, 7, 7, 7);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(12, 4, 7, 6);
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(15, 6, 4, 2);
      // Legs stretched back
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 12, 5, 4);
    });

    // 7. Ground Block (16x16)
    this.drawPixelCanvas('tile_ground', 16, 16, (ctx) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 16, 16);
      // Top grass/moss layer
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 0, 16, 3);
      ctx.fillStyle = '#059669';
      ctx.fillRect(2, 3, 3, 2);
      ctx.fillRect(9, 3, 4, 2);
      ctx.fillRect(14, 3, 2, 2);
      // Stone texture cracks
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, 8, 5, 1);
      ctx.fillRect(6, 9, 1, 4);
      ctx.fillRect(10, 7, 4, 1);
      ctx.fillRect(3, 13, 8, 1);
    });

    // 8. Wall Block (16x16)
    this.drawPixelCanvas('tile_wall', 16, 16, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 16, 16);
      // Brick borders
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(7, 0, 1, 7);
      ctx.fillRect(12, 8, 1, 7);
      // Highlights
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, 1, 5, 1);
      ctx.fillRect(8, 1, 6, 1);
      ctx.fillRect(1, 9, 9, 1);
    });

    // 9. Platform Block (16x8)
    this.drawPixelCanvas('tile_platform', 16, 8, (ctx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, 16, 8);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 16, 2);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 6, 16, 2);
    });

    // 10. Hazard Spikes (16x16)
    this.drawPixelCanvas('tile_spike', 16, 16, (ctx) => {
      ctx.fillStyle = '#e11d48';
      // Draw 2 triangular spikes
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(4, 2);
      ctx.lineTo(8, 16);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.lineTo(12, 2);
      ctx.lineTo(16, 16);
      ctx.fill();

      // Sharp white highlight tips
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 2, 2, 3);
      ctx.fillRect(11, 2, 2, 3);
    });

    // 10b. Winter Hazard Ice Spikes (16x16)
    this.drawPixelCanvas('tile_ice_spike', 16, 16, (ctx) => {
      ctx.fillStyle = '#0284c7';
      // Draw 2 crystalline ice spikes
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(4, 1);
      ctx.lineTo(8, 16);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.lineTo(12, 1);
      ctx.lineTo(16, 16);
      ctx.fill();

      // Inner cyan ice core
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(2, 16);
      ctx.lineTo(4, 3);
      ctx.lineTo(6, 16);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, 16);
      ctx.lineTo(12, 3);
      ctx.lineTo(14, 16);
      ctx.fill();

      // Gleaming sharp white tips
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 1, 2, 4);
      ctx.fillRect(11, 1, 2, 4);
    });

    // 10c. Winter Snow Ground (16x16) - Crisp White Platforms
    this.drawPixelCanvas('tile_snow_ground', 16, 16, (ctx) => {
      // Dark glacial rock base
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, 7, 6, 4);
      ctx.fillRect(9, 9, 6, 5);

      // Ice crystal veins
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, 11, 3, 1);
      ctx.fillRect(11, 7, 2, 2);

      // Thick pure white snow cap (top 5 pixels)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 16, 4);
      ctx.fillRect(1, 4, 4, 1);
      ctx.fillRect(7, 4, 5, 1);
      ctx.fillRect(13, 4, 3, 1);

      // Soft snow shading
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(2, 4, 2, 1);
      ctx.fillRect(8, 4, 3, 1);

      // Tiny icicle drips
      ctx.fillStyle = '#cffafe';
      ctx.fillRect(3, 5, 1, 2);
      ctx.fillRect(10, 5, 1, 2);
    });

    // 10d. Winter Snow Wall (16x16) - Glacial Brick
    this.drawPixelCanvas('tile_snow_wall', 16, 16, (ctx) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 16, 16);

      // Frost-coated bricks
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1, 1, 6, 6);
      ctx.fillRect(8, 1, 7, 6);
      ctx.fillRect(1, 8, 14, 7);

      // Frozen cyan mortar
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(7, 0, 1, 7);

      // White frost highlights & icicles
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(1, 1, 4, 1);
      ctx.fillRect(8, 1, 5, 1);
      ctx.fillRect(2, 8, 8, 1);

      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(4, 4, 1, 2);
      ctx.fillRect(11, 10, 2, 1);
    });

    // 11. Dash Ability Orb (16x16)
    this.drawPixelCanvas('orb_dash', 16, 16, (ctx) => {
      // Glow aura
      const grad = ctx.createRadialGradient(8, 8, 2, 8, 8, 8);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#06b6d4');
      grad.addColorStop(0.8, '#0284c7');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);

      // Core diamond rune
      ctx.fillStyle = '#cffafe';
      ctx.beginPath();
      ctx.moveTo(8, 3);
      ctx.lineTo(13, 8);
      ctx.lineTo(8, 13);
      ctx.lineTo(3, 8);
      ctx.closePath();
      ctx.fill();

      // Inner sparkle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 7, 2, 2);
    });

    // 12. Particles
    this.drawPixelCanvas('particle_dust', 4, 4, (ctx) => {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 0, 4, 4);
    });

    this.drawPixelCanvas('particle_dash', 6, 6, (ctx) => {
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(1, 1, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 2, 2);
    });

    this.drawPixelCanvas('particle_snow', 4, 4, (ctx) => {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(1, 0, 2, 4);
      ctx.fillRect(0, 1, 4, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, 1, 2, 2);
    });

    // 13. Cavern Background Pillar (32x96)
    this.drawPixelCanvas('bg_pillar', 32, 96, (ctx) => {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, 32, 96);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(4, 0, 24, 96);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 32, 8);
      ctx.fillRect(0, 88, 32, 8);
    });

    // 13b. Winter Glacial Ice Pillar (32x96)
    this.drawPixelCanvas('bg_ice_pillar', 32, 96, (ctx) => {
      ctx.fillStyle = '#082f49';
      ctx.fillRect(0, 0, 32, 96);
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(4, 0, 24, 96);
      ctx.fillStyle = '#075985';
      ctx.fillRect(8, 0, 16, 96);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(12, 10, 2, 30);
      ctx.fillRect(16, 50, 2, 36);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 32, 8);
      ctx.fillRect(0, 88, 32, 8);
    });

    // 14. Silksong Needle Slash - Side (Hornet's Tapered Needle & Silk Crescent: 48x24)
    this.drawPixelCanvas('slash_side', 48, 24, (ctx) => {
      ctx.save();

      // 1. Pale Cyan / Ice Silk Glow Vapor (outer aura)
      ctx.beginPath();
      ctx.moveTo(4, 19);
      ctx.bezierCurveTo(12, 3, 32, 1, 46, 11);
      ctx.bezierCurveTo(34, 15, 18, 19, 4, 19);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.fill();

      // 2. Main Luminous Needle Blade (Silksong Silver & Cyan gradient)
      ctx.beginPath();
      ctx.moveTo(6, 18);
      ctx.bezierCurveTo(15, 5, 33, 4, 46, 11);
      ctx.bezierCurveTo(34, 14, 20, 17, 6, 18);
      ctx.closePath();
      const grad = ctx.createLinearGradient(6, 12, 46, 11);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.4, '#bae6fd');
      grad.addColorStop(0.8, '#ffffff');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.fill();

      // 3. Core Razor Needle Arc (Pure White razor cutting edge)
      ctx.beginPath();
      ctx.moveTo(8, 17);
      ctx.bezierCurveTo(17, 7, 33, 6, 45, 11);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 4. Trailing Silk Filaments (Iconic Hornet silk threads)
      ctx.beginPath();
      ctx.moveTo(4, 20);
      ctx.bezierCurveTo(16, 19, 28, 17, 36, 18);
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, 22);
      ctx.bezierCurveTo(18, 21, 26, 19, 32, 21);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 5. Needle Tip Sparkle (Impact point gleam)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(44, 10, 3, 3);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(43, 11, 5, 1);
      ctx.fillRect(45, 9, 1, 5);

      ctx.restore();
    });

    // 15. Silksong Needle Downward Slash - Down (Hornet's Downward Pogo Arc: 44x26)
    this.drawPixelCanvas('slash_down', 44, 26, (ctx) => {
      ctx.save();

      // 1. Outer Silk Vapor Glow
      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.bezierCurveTo(4, 18, 13, 25, 22, 25);
      ctx.bezierCurveTo(31, 25, 40, 18, 40, 4);
      ctx.bezierCurveTo(36, 13, 29, 18, 22, 18);
      ctx.bezierCurveTo(15, 18, 8, 13, 4, 4);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.fill();

      // 2. Main Semicircular Needle Slash Blade
      ctx.beginPath();
      ctx.moveTo(6, 5);
      ctx.bezierCurveTo(6, 17, 14, 23, 22, 23);
      ctx.bezierCurveTo(30, 23, 38, 17, 38, 5);
      ctx.bezierCurveTo(34, 13, 28, 17, 22, 17);
      ctx.bezierCurveTo(16, 17, 10, 13, 6, 5);
      ctx.closePath();
      const gradDown = ctx.createLinearGradient(22, 5, 22, 24);
      gradDown.addColorStop(0, '#38bdf8');
      gradDown.addColorStop(0.5, '#bae6fd');
      gradDown.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradDown;
      ctx.fill();

      // 3. Core Razor Cutting Edge (pure white arc at the bottom apex)
      ctx.beginPath();
      ctx.moveTo(8, 7);
      ctx.bezierCurveTo(9, 17, 15, 22, 22, 22);
      ctx.bezierCurveTo(29, 22, 35, 17, 36, 7);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 4. Trailing Silk Threads (arcs hugging the curve)
      ctx.beginPath();
      ctx.moveTo(10, 12);
      ctx.bezierCurveTo(14, 20, 20, 24, 22, 24);
      ctx.bezierCurveTo(24, 24, 30, 20, 34, 12);
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 5. Downward Tip Gleam / Sparkle at apex
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(21, 22, 3, 3);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(19, 23, 7, 1);
      ctx.fillRect(22, 20, 1, 7);

      ctx.restore();
    });
  }

  private drawPixelCanvas(
    key: string,
    width: number,
    height: number,
    drawer: (ctx: CanvasRenderingContext2D) => void
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      drawer(ctx);
      this.textures.addCanvas(key, canvas);
    }
  }

  private createAnimations(): void {
    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player_idle' }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-run',
      frames: [
        { key: 'player_run_1' },
        { key: 'player_run_2' },
        { key: 'player_run_3' },
        { key: 'player_run_4' },
      ],
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-jump',
      frames: [{ key: 'player_jump' }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-fall',
      frames: [{ key: 'player_fall' }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-slide',
      frames: [{ key: 'player_slide' }],
      frameRate: 1,
    });

    this.anims.create({
      key: 'player-dash',
      frames: [{ key: 'player_dash' }],
      frameRate: 1,
    });
  }
}

