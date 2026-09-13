---
name: phaser-gameplay
description: Guidelines and patterns for implementing Phaser 3 games in TypeScript with Vite.
---

# Phaser Gameplay Skill

## Scene Lifecycle & Structure
- Separate preload, menu, game, and HUD into distinct scenes.
- Launch UI scene in parallel: `this.scene.launch('UIScene')`.
- Clean up event listeners in `shutdown` or `destroy` hooks to avoid memory leaks during restarts.

## Physics Tuning (Arcade Physics)
- Use `Phaser.Physics.Arcade`.
- Define realistic gravity in game config: `gravity: { y: 1000, x: 0 }`.
- Set player body bounds with offset:
  ```ts
  this.body.setSize(width, height);
  this.body.setOffset(offsetX, offsetY);
  ```
- Use `body.blocked.down` or `body.touching.down` for grounded checks with slope/platform tolerance.

## Input Handling
- Track `Phaser.Input.Keyboard.Key` for arrows/WASD, Space, and Shift.
- Implement `JustDown` checks: `Phaser.Input.Keyboard.JustDown(key)`.
- Support gamepad API when feasible.

