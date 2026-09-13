# Project Task Roadmap

## Phase 1: Setup & Phaser 3 Integration (MVP Groundwork)
- [x] Install `phaser` package and type definitions (`npm install phaser`).
- [x] Configure Vite build and TypeScript settings for Phaser.
- [x] Clean up default Vite boilerplate files (`counter.ts`, default styles, html).
- [x] Set up Phaser Game configuration (Pixel art rendering mode, Arcade Physics, resolution 480x270 scaled to window).

## Phase 2: Player Controller & Movement Juice
- [x] Implement `Player` entity with Arcade Physics body.
- [x] Add basic run and jump mechanics.
- [x] Implement "game juice":
  - [x] Variable jump height (early release cut).
  - [x] Coyote time (grace period).
  - [x] Jump buffering.
  - [x] Dash mechanic with cooldown and trails/visual feedback.
  - [x] Wall slide and Wall jump.
- [x] Integrate free pixel art character sprite & animations (Kenney platformer / free pack).

## Phase 3: Test Arena & Tilemap
- [x] Add tilemap / platform obstacles with collisions to test mechanics.
- [x] Configure camera follow with boundaries.
- [x] Add debug HUD / overlay showing velocity, grounded status, states.
- [x] Combat & Pogo Mechanics Juice:
  - [x] Authentic Silksong forward Needle slash (tapered crescent arc with pure white cutting edge, silk gradient, trailing filaments, tip sparkle).
  - [x] Authentic Silksong downward Needle pogo slash (downward semicircular crescent with silk threads and contact apex gleam).
  - [x] Multi-pogo spike bounce reliability (active attack window, cooldown reset on hit, fast-fall stall, hazard override).
  - [x] Tuned Silksong pogo bounce velocity to controlled, subtle recoil (-180 px/s, ~1.1 tiles high).
  - [x] Tuned attack cooldown to 340ms for deliberate Hollow Knight style nail pacing.

## Phase 4: Room Transitions & Progression (Hollow Knight / Silksong Style)
- [x] Expansive multi-screen room map (`src/config/rooms.ts` defining Rooms 1, 2, and 3 across a $2560 \times 800$ world).
- [x] Room transition controller (`src/systems/RoomManager.ts`) with camera bounds clamping, central-third deadzone tracking (`camera.setDeadzone(160, 90)`), and Hollow Knight quick black fade transitions (`fadeOut` / `fadeIn` 160ms).
- [x] Deep transition tunnels & corridors (120–160px enclosed hallways with 100px+ spawn buffer and 400ms transition cooldown) preventing accidental room switching.
- [x] Atmospheric room discovery cards in HUD (`UIScene.ts`).
- [x] Ability pickup gating (Dash Orb placed at peak of Room 2 Crystal Shaft, gating access to Room 3 chasm).
- [x] Retro Pixel-Art Typography: Integrated Google Font `Silkscreen` and built `PixelText` ([`src/entities/PixelText.ts`](file:///d:/projects/metroidvania/src/entities/PixelText.ts)) with real-time binary alpha thresholding (threshold 115). Snaps all font pixels to 100% solid foreground color, completely eliminating anti-aliasing color fringes, tinted edge halos, and downsampling blur.
- [x] Crisp UI Layout & Controls Prompts: Centered bottom controls legend with arrow support (`[A/D / ARROWS] MOVE`), balanced top-left ability card at 8px font, and hidden telemetry HUD by default (`[F1]` on-demand toggle).
- [x] In-Game Guidance & Signpost Positioning: Tuned signpost heights (clearing platforms) and soft semi-transparency (`alpha: 0.78` text, `0.70` background) for seamless atmospheric integration.
- [ ] Persist ability and room exploration state (LocalStorage).
- [ ] Combat encounters (patrolling enemies & combat state machine).
- [ ] Additional abilities (Double Jump, High Jump).

