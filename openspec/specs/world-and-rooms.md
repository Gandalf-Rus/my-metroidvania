# Specification: World Structure & Metroidvania Progression (Hollow Knight / Silksong Style)

## 1. World Organization
The game world is composed of expansive discrete **Rooms** configured in `src/config/rooms.ts`:
- Each Room defines:
  - Coordinate bounds (`x`, `y`, `width`, `height` in world pixels).
  - Spawn checkpoint (`spawnPoint`).
  - Name and Subtitle for discovery cards.
  - Doorway trigger zones (`DoorwayConfig`) connecting to adjacent rooms.

## 2. World Layout (Large Multi-Screen Caverns)

```
y: 0 ─────────────────────────────[Room 2: Crystal Shaft]───────────────[Room 3: Sanctuary]
                                  │ Bounds: 640 x 800 (x: 960..1600)    │ Bounds: 960 x 360 (x: 1600..2560)
                                  │ Upper Terrace: Dash Shrine [C]      │ === Doorway ===> Wide spike pit
                                  │ Deep vertical climb & wall jumps    │                  Sanctuary Altar ★
y: 360 ──[Room 1: Entrance]───────┼─Lower Shaft Entrance────────────────┴───────────────────────────────────
         │ Bounds: 960 x 360      │
         │ (x: 0..960, y: 360..720)
         │ Expansive cavern       │
y: 720 ──┴────────────────────────┴─────────────────────────────────────────────────────────────────────────
```

### 2.1 Room 1: Entrance Caverns (`room_1_cavern`)
- **Bounds:** `x: 0, y: 360, width: 960, height: 360` (2 screens wide).
- **Purpose:** Starting zone teaching movement, coyote time, and combat across multiple elevation tiers.
- **Doorway:** East opening (`x: 946, y: 610`) leading into Room 2.

### 2.2 Room 2: Crystal Shaft (`room_2_shaft`)
- **Bounds:** `x: 960, y: 0, width: 640, height: 800` (towering vertical chamber, >3 screens tall).
- **Purpose:** Vertical climbing challenge requiring wall slides and wall kicks up to `y: 120`.
- **Upper Shrine:** Houses the **Dash Ability Orb** pickup (`x: 1280, y: 150`).
- **Doorways:**
  - West doorway (`x: 960, y: 610`) returning to Room 1.
  - East doorway (`x: 1586, y: 170`) leading to Room 3.

### 2.3 Room 3: The Sanctuary (`room_3_sanctuary`)
- **Bounds:** `x: 1600, y: 0, width: 960, height: 360` (2 screens wide).
- **Purpose:** Grand hall featuring an epic 500px wide spike abyss, crossed by Dash or floating pogo crystals.
- **Goal:** The Sanctuary Altar at the far right (`x: 2420, y: 220`).

## 3. Camera Tracking & Deadzone
- **Central Third Tracking:** `camera.setDeadzone(160, 90)` on the $480 \times 270$ display keeps the player smoothly framed within the central third of the screen.
- **Boundary Clamping:** `camera.setBounds(room.x, room.y, room.width, room.height)` naturally halts camera scrolling at the room's walls, floor, and ceiling.

## 4. Room Transitions (Hollow Knight Quick Black Fade)
- Triggered on doorway overlap.
- **Sequence:**
  1. Freeze player controls (`player.setControlLocked(true)`).
  2. Camera fades out to black: `camera.fadeOut(160ms, 0, 0, 0)`.
  3. Swap `currentRoom` and position player at destination arrival coordinates.
  4. Re-clamp `camera.setBounds` to the new room and center on player.
  5. Camera fades back in: `camera.fadeIn(160ms, 0, 0, 0)`.
  6. Restore player controls and emit `room-changed` event to trigger the discovery banner.
