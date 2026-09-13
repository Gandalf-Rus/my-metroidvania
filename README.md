# Metroidvania: Silk & Needle

A 2D Metroidvania platformer built with **TypeScript**, **Phaser 3**, and **Vite**, featuring responsive platforming physics, Hollow Knight / Silksong inspired needle combat and pogo mechanics, connected multi-room exploration, ability gating, and retro pixel-art typography.

---

## Features

### 🕹️ Platformer Controller & "Juice"
- **Variable Jump Height**: Early button release cuts upward momentum for precision aerial control.
- **Coyote Time**: A generous grace period (~100ms) allows jumping shortly after slipping off platform edges.
- **Jump Buffering**: Inputs registered ~120ms prior to landing trigger immediately upon touchdown.
- **Wall Sliding & Wall Jumping**: Cling to vertical surfaces and kick away to scale shafts.
- **Air Dash**: Rapid forward burst with ghost trail visuals, cooldown pacing, and airborne velocity freeze.

### ⚔️ Needle Combat & Pogo Mechanics
- **Forward Slash**: Crescent silk needle slash with sharp cutting edge, filament trails, and tip gleam.
- **Downward Pogo Slash**: Down-slash with contact recoil bounce (-180 px/s) to bounce off spikes and hazards.
- **Spike Hazard Override**: Pogoing over hazards resets dash/air state and allows chaining bounces across spike pits without taking damage.
- **Deliberate Combat Pacing**: 340ms attack cooldown mirrors tight metroidvania combat rhythms.

### 🗺️ Connected World Architecture & Progression
- **Multi-Screen World Map**: Rooms 1, 2, and 3 spread across a $2560 \times 800$ canvas.
- **Seamless Room Transitions**: Managed by `RoomManager` with camera bounds clamping, central-third deadzone tracking (`160x90`), and quick fade-to-black transitions (`160ms`).
- **Transition Buffers**: Deep enclosed corridors (120–160px) with 400ms cooldowns prevent accidental room re-entry.
- **Ability Gating**: The Dash ability is locked until acquired from the peak of Room 2 (Crystal Shaft), gating passage over the spikes and chasm in Room 3 (Forgotten Pass).

### 🎨 Retro Pixel-Art Typography
- **Binary Alpha Thresholding**: Custom [`PixelText`](src/entities/PixelText.ts) eliminates HTML5 Canvas2D subpixel font blur and anti-aliasing color fringes by clamping glyph alpha (`>= 115` -> 100% solid, `< 115` -> transparent).
- **Crisp UI**: Built on Google Font `Silkscreen` with pixel-perfect alignment, centered bottom HUD legends, top-left ability cards, and atmospheric in-game signposts.
- **Debug Telemetry**: Toggleable runtime stats overlay (`[F1]`) displaying FPS, velocity, state flags, and current room coords.

---

## Controls

| Action | Primary Key | Secondary Key | Notes |
| :--- | :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` | `Left` / `Right` Arrow | Smooth acceleration & turnaround |
| **Jump** | `Z` | `Up` Arrow / `W` | Variable height (release early to cut jump) |
| **Needle Slash** | `X` | `J` | Forward horizontal swipe |
| **Downward Pogo** | `Down` + `X` | `S` + `X` | Strike spikes below to bounce upward |
| **Dash** | `C` | `Shift` / `K` | Unlocked after collecting Dash Orb in Room 2 |
| **Toggle Debug HUD** | `F1` | — | Displays velocity, state machine, and room bounds |

---

## Project Structure

```text
metroidvania/
├── openspec/                  # Design specs & project task roadmaps
│   ├── specs/                 # Player controller & room specifications
│   ├── project.md             # Project requirements & architecture
│   └── tasks.md               # Task breakdown & implementation roadmap
├── public/                    # Static assets (favicons, icons)
├── src/
│   ├── assets/                # Pixel art spritesheets & graphics
│   ├── config/
│   │   ├── gameConfig.ts      # Phaser game config (480x270, Arcade Physics)
│   │   ├── physicsConfig.ts   # Movement constants (gravity, speed, coyote, dash)
│   │   └── rooms.ts           # Room layouts, platforms, spikes, pickups, signposts
│   ├── entities/
│   │   ├── Pickup.ts          # Collectible items (Dash Orb) with floating tweens
│   │   ├── PixelText.ts       # Canvas2D binary thresholded pixel-art text engine
│   │   └── Player.ts          # Player physics, animation, pogo recoil & state machine
│   ├── scenes/
│   │   ├── BootScene.ts       # Font pre-baking & procedural asset generators
│   │   ├── GameScene.ts       # Level geometry, collision loops, combat & signposts
│   │   └── UIScene.ts         # Ability badges, room title banners & controls legend
│   ├── systems/
│   │   └── RoomManager.ts     # Camera tracking, room switching, fade transitions
│   ├── main.ts                # Application entry point
│   └── style.css              # Pixelated styling, canvas letterboxing & font imports
├── index.html                 # Web entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18+ recommended
- **npm** or **pnpm** / **yarn**

### Installation
```bash
# Clone or navigate to the project directory
cd metroidvania

# Install dependencies
npm install
```

### Development
Start the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Production Build
Type-check and compile the production bundle into `dist/`:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## Development Guidelines

- Follow the [AGENTS.md](AGENTS.md) architecture principles: strict typing, modular separation of scenes/entities/systems, and crisp pixel-art presentation.
- All code and documentation must remain strictly in English.

