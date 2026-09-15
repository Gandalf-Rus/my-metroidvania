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
  zone: string;
  bounds: RoomBounds;
  spawnPoint: { x: number; y: number };
  doorways: DoorwayConfig[];
}

export const ROOMS: Record<string, RoomConfig> = {
  // ZONE 1: FORGOTTEN CAVERNS
  room_1_cavern: {
    id: 'room_1_cavern',
    name: 'Entrance Caverns',
    subtitle: 'Echoing Threshold',
    zone: 'Forgotten Caverns',
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
    zone: 'Forgotten Caverns',
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
    zone: 'Forgotten Caverns',
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
      {
        id: 'door_3_to_4',
        sourceRoomId: 'room_3_sanctuary',
        targetRoomId: 'room_4_glacial_pass',
        triggerRect: { x: 2548, y: 160, width: 12, height: 96 },
        targetPlayerPos: { x: 2660, y: 220 },
        direction: 'right',
      },
    ],
  },

  // ZONE 2: FROSTPEAK REACH (WINTER ZONE)
  room_4_glacial_pass: {
    id: 'room_4_glacial_pass',
    name: 'Glacial Pass',
    subtitle: 'Frozen Threshold',
    zone: 'Frostpeak Reach',
    bounds: {
      x: 2560,
      y: 0,
      width: 960,
      height: 360,
    },
    spawnPoint: { x: 2660, y: 220 },
    doorways: [
      {
        id: 'door_4_to_3',
        sourceRoomId: 'room_4_glacial_pass',
        targetRoomId: 'room_3_sanctuary',
        triggerRect: { x: 2560, y: 160, width: 12, height: 96 },
        targetPlayerPos: { x: 2460, y: 220 },
        direction: 'left',
      },
      {
        id: 'door_4_to_5',
        sourceRoomId: 'room_4_glacial_pass',
        targetRoomId: 'room_5_frozen_peaks',
        triggerRect: { x: 3508, y: 160, width: 12, height: 96 },
        targetPlayerPos: { x: 3620, y: 220 },
        direction: 'right',
      },
    ],
  },
  room_5_frozen_peaks: {
    id: 'room_5_frozen_peaks',
    name: 'Frozen Peaks',
    subtitle: 'Biting Winds',
    zone: 'Frostpeak Reach',
    bounds: {
      x: 3520,
      y: 0,
      width: 960,
      height: 480,
    },
    spawnPoint: { x: 3620, y: 220 },
    doorways: [
      {
        id: 'door_5_to_4',
        sourceRoomId: 'room_5_frozen_peaks',
        targetRoomId: 'room_4_glacial_pass',
        triggerRect: { x: 3520, y: 160, width: 12, height: 96 },
        targetPlayerPos: { x: 3420, y: 220 },
        direction: 'left',
      },
    ],
  },
};
