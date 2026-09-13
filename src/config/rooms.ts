export interface DoorwayConfig {
  id: string;
  sourceRoomId: string;
  targetRoomId: string;
  triggerRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  targetPlayerPos: {
    x: number;
    y: number;
  };
  direction: 'left' | 'right' | 'up' | 'down';
}

export interface RoomBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomConfig {
  id: string;
  name: string;
  subtitle: string;
  bounds: RoomBounds;
  spawnPoint: { x: number; y: number };
  doorways: DoorwayConfig[];
}

export const ROOMS: Record<string, RoomConfig> = {
  room_1_cavern: {
    id: 'room_1_cavern',
    name: 'Entrance Caverns',
    subtitle: 'Echoing Threshold',
    bounds: {
      x: 0,
      y: 360,
      width: 960,
      height: 360,
    },
    spawnPoint: { x: 80, y: 660 },
    doorways: [
      {
        id: 'door_1_to_2',
        sourceRoomId: 'room_1_cavern',
        targetRoomId: 'room_2_shaft',
        triggerRect: { x: 948, y: 584, width: 12, height: 104 },
        targetPlayerPos: { x: 1072, y: 660 },
        direction: 'right',
      },
    ],
  },
  room_2_shaft: {
    id: 'room_2_shaft',
    name: 'Crystal Shaft',
    subtitle: 'Deep Ascent',
    bounds: {
      x: 960,
      y: 0,
      width: 640,
      height: 800,
    },
    spawnPoint: { x: 1072, y: 660 },
    doorways: [
      {
        id: 'door_2_to_1',
        sourceRoomId: 'room_2_shaft',
        targetRoomId: 'room_1_cavern',
        triggerRect: { x: 960, y: 584, width: 12, height: 104 },
        targetPlayerPos: { x: 848, y: 660 },
        direction: 'left',
      },
      {
        id: 'door_2_to_3',
        sourceRoomId: 'room_2_shaft',
        targetRoomId: 'room_3_sanctuary',
        triggerRect: { x: 1588, y: 160, width: 12, height: 96 },
        targetPlayerPos: { x: 1712, y: 220 },
        direction: 'right',
      },
    ],
  },
  room_3_sanctuary: {
    id: 'room_3_sanctuary',
    name: 'The Sanctuary',
    subtitle: 'Sacred Altar',
    bounds: {
      x: 1600,
      y: 0,
      width: 960,
      height: 360,
    },
    spawnPoint: { x: 1712, y: 220 },
    doorways: [
      {
        id: 'door_3_to_2',
        sourceRoomId: 'room_3_sanctuary',
        targetRoomId: 'room_2_shaft',
        triggerRect: { x: 1600, y: 160, width: 12, height: 96 },
        targetPlayerPos: { x: 1488, y: 220 },
        direction: 'left',
      },
    ],
  },
};
