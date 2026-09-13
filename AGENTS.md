# Metroidvania Game - Agent Guidelines

## Project Overview
- **Genre:** 2D Metroidvania Platformer for Web
- **Language:** TypeScript
- **Engine/Framework:** Phaser 3 (Arcade Physics, Tilemaps, Cameras, State)
- **Bundler:** Vite
- **Art Style:** Pixel Art (Kenney / OpenGameArt / Procedural placeholders)

## Architecture Principles
1. **Separation of Concerns:**
   - `src/scenes/`: Phaser scenes (`BootScene`, `PreloadScene`, `GameScene`, `UIScene`).
   - `src/entities/`: Game entities (Player, Enemies, Pickups) inheriting or encapsulating Phaser GameObjects.
   - `src/systems/`: Physics helpers, input handlers, room transitions, save/progression state.
   - `src/config/`: Constants, keybindings, physics tuning values.
2. **Platformer Feel ("Juice"):**
   - Implement snappy jump curves: variable jump height (release button early = lower jump).
   - Coyote Time: allow jump for ~100ms after falling off a platform edge.
   - Jump Buffering: register jump input pressed ~100-150ms before touching the ground.
   - Wall sliding & Wall jumping.
   - Dash mechanic with cooldown and brief invulnerability / velocity freeze.
3. **TypeScript Standards:**
   - Strict typing; avoid `any`.
   - Explicit interfaces for Entity configurations, Input states, and Save data.
4. **Metroidvania World Design:**
   - Room-based grid or connected scenes with seamless or quick screen transitions.
   - Ability gating (e.g. Double Jump, Dash, High Jump) unlocking new pathways.

