import Phaser from 'phaser';

/**
 * PixelText extends Phaser.GameObjects.Text to eliminate font anti-aliasing blur
 * and tinted/shaded edge halos in low-resolution pixel-art games.
 *
 * It post-processes the internal Canvas2D buffer using binary alpha thresholding:
 * - Every pixel with alpha >= threshold is snapped to 100% solid target foreground color (alpha 255).
 * - Every pixel with alpha < threshold is discarded to 100% transparent (alpha 0).
 *
 * This guarantees zero subpixel color fringes, zero intermediate tinted edge pixels,
 * and 100% crisp pixel-art typography when scaled up.
 */
export class PixelText extends Phaser.GameObjects.Text {
  private alphaThreshold: number;
  private currentTextColor: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    style: Phaser.Types.GameObjects.Text.TextStyle = {},
    threshold: number = 115
  ) {
    const cleanStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontStyle: style.fontStyle || 'normal',
      ...style,
      fontFamily: '"Silkscreen", monospace',
      backgroundColor: undefined, // Enforce transparent canvas so background doesn't interfere with thresholding
      letterSpacing: style.letterSpacing !== undefined ? style.letterSpacing : 0,
    };

    super(scene, Math.round(x), Math.round(y), text, cleanStyle);
    this.autoRound = true;
    this.alphaThreshold = threshold;
    this.currentTextColor = typeof style.color === 'string' ? style.color : '#ffffff';

    scene.add.existing(this);
    this.binarizeCanvas();
  }

  public override updateText(): this {
    super.updateText();
    this.binarizeCanvas();
    return this;
  }

  public override setColor(color: string): this {
    this.currentTextColor = color;
    super.setColor(color);
    this.binarizeCanvas();
    return this;
  }

  private binarizeCanvas(): void {
    const canvas = this.canvas;
    const ctx = this.context;
    if (!ctx || canvas.width === 0 || canvas.height === 0) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const threshold = this.alphaThreshold || 115;
      const targetColor =
        this.currentTextColor ||
        (typeof this.style.color === 'string' ? this.style.color : '#ffffff');

      const colorObj = Phaser.Display.Color.ValueToColor(targetColor);
      const r = colorObj.red;
      const g = colorObj.green;
      const b = colorObj.blue;

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a >= threshold) {
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        } else {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Re-upload to WebGL texture
      const renderer = this.scene?.game?.renderer as Phaser.Renderer.WebGL.WebGLRenderer | undefined;
      if (renderer && renderer.gl && this.frame?.source?.glTexture) {
        renderer.canvasToTexture(canvas, this.frame.source.glTexture, true);
      }
    } catch {
      // Safe fallback if canvas access is restricted
    }
  }
}
