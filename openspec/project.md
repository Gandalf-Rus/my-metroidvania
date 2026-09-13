# Project Specification: 2D Metroidvania Platformer

## 1. Executive Summary
A browser-based 2D Metroidvania action platformer created with Phaser 3, TypeScript, and Vite. The game emphasizes fluid, responsive movement ("game juice"), interconnected room exploration, ability-gated progression, and clean pixel aesthetics using free sprite assets.

## 2. Technology Stack
- **Engine:** Phaser 3 (`phaser` package)
- **Language:** TypeScript 5+
- **Bundler:** Vite 6+
- **Physics:** Phaser Arcade Physics (custom tuned with platformer mechanics)
- **Assets:** Kenney Pixel Platformer / 1-bit / Roguelike or OpenGameArt sprite sheets

## 3. Core Philosophy
1. **Movement First:** Player controls must feel responsive, instant, and tight (Celeste / Hollow Knight inspiration: coyote time, jump buffering, wall-slide/jump, dash).
2. **Modular Architecture:** Entities, state manager, rooms, and scenes are cleanly separated.
3. **Data-Driven Progression:** Abilities, unlocks, and rooms configured via typed data structures.

