---
name: metroidvania-world
description: Guidelines for building room-based metroidvania map structures, camera bounds, and progression gating.
---

# Metroidvania World Design Skill

## Room Design Patterns
- Represent the world as interconnected rooms on a grid (or arbitrary size rooms connected by doorway triggers).
- Camera bounding: set `camera.setBounds(room.x, room.y, room.width, room.height)` per active room.
- Transition triggers: sensor zones at edges that initiate transition (pan or quick fade).

## Progression & Ability Gating
- Track abilities in a global state manager:
  - `DASH`: pass through fast traps or wide gaps.
  - `DOUBLE_JUMP`: reach higher platforms (height > 3 tiles).
  - `WALL_JUMP`: scale vertical shafts.
- Keep room layouts readable with clear visual signposts indicating required abilities (e.g., colored barriers, cracked blocks, high ledges).

