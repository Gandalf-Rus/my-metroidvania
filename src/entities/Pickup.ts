import Phaser from 'phaser';

export type PickupType = 'dash' | 'double_jump' | 'health';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  public pickupType: PickupType;
  private floatTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, pickupType: PickupType) {
    super(scene, x, y, texture);
    this.pickupType = pickupType;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body so it doesn't fall

    // Floating bobbing effect
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public collect(): void {
    if (this.floatTween) {
      this.floatTween.stop();
    }

    // Sparkle burst effect on pickup
    const particles = this.scene.add.particles(this.x, this.y, 'particle_dash', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 500,
      quantity: 20,
    });

    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });

    this.destroy();
  }
}

