# Specification: Player Controller & Movement Mechanics

## 1. Overview
The player movement system is the backbone of the game. Rather than standard basic platformer physics, it implements feel-enhancement techniques:

## 2. Movement Mechanics
### 2.1 Horizontal Movement
- **Run Speed:** 200 - 240 px/s
- **Acceleration:** Fast ground acceleration (snappy, near-instant turnaround).
- **Air Control:** High air acceleration to maintain full player agency.

### 2.2 Jump System
- **Jump Force:** -380 to -420 px/s.
- **Variable Jump Height:** If jump button is released before peak of jump, vertical velocity is clamped/scaled (`vy *= 0.5`).
- **Coyote Time (100ms):** Allows jumping for a short window after running off a ledge.
- **Jump Buffering (120ms):** If jump is pressed shortly before touching the ground, the jump triggers automatically upon landing.

### 2.3 Wall Mechanics
- **Wall Slide:** Slower downward fall speed when pressing towards a wall.
- **Wall Jump:** Provides an impulse away from and upward from the wall, with a momentary input lock (100ms) to ensure clean kicks.

### 2.4 Dash Ability
- **Dash Speed:** 450 - 550 px/s in horizontal/diagonal direction.
- **Duration:** 140ms.
- **Physics Behavior:** Zero gravity during dash; resets velocity upon termination.
- **Cooldown / Ground Reset:** 1 dash per air-time, resets upon touching ground or wall.

### 2.5 Double Jump Ability
- Second jump available while in air if the ability is unlocked.

### 2.6 Needle Attack & Pogo Mechanics
- **Side Attack (`X`):**
  - Shape: Hornet's iconic Needle Strike (48x24 px). Aerodynamic tapered crescent blade curve with pure white razor cutting edge, ice-silk luminous gradient, delicate trailing silk filaments, and a glint sparkle at the needle tip.
  - Directional alignment: Emits in front of the player (offset `20px` along facing direction).
- **Downward Attack (`Air + Down + X`):**
  - Shape: Hornet's Downward Pogo Arc (44x26 px). Sweeping semicircular crescent beneath the player's feet with pure white apex cutting edge, radiant silk gradient, trailing silk filaments, and an apex impact spark.
  - Active Window: Hitbox remains active for 160ms for forgiving, reliable timing.
- **Attack Timing & Cooldown:**
  - Standard Attack Cooldown: 340ms (deliberate, weighted pacing in the style of Hollow Knight nail strikes, preventing mindless spam).
  - Pogo Attack Cooldown: Resets to 60ms on successful hit, allowing rapid, responsive consecutive chain bounces across hazards.
- **Spike Pogo Bounce:**
  - Bounce Impulse: Upward velocity `-260 px/s` (gentle, controlled Silksong recoil, ~2 tiles high).
  - Air Dash Reset: Refreshes air dash capability.
  - Hazard Immunity & Override: Touching spike hazard during active down-slash triggers pogo rather than damage/respawn.
  - Bounce Safety: 130ms spike invulnerability and 90ms fast-fall stall window prevents accidental self-damage while rising.

