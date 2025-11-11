export type Position = 1 | 2 | 3 | 4 | 5 | 6; // on-court clockwise numbering
export type OffPosition = 7 | 8 | 9;           // three off-court slots that also rotate
export type ExtPosition = Position | OffPosition; // full 9-person rotation ring
export type Role = 'S' | 'OH' | 'OPP' | 'MB' | 'L' | 'DS';
export type RotationMode = '6-2' | '5-1';

export type Player = {
  id: string;
  name: string;
  role: Role;
  jersey?: number;
};

export type Slot = { pos: ExtPosition; playerId: string };

export type Rotation = {
  slots: Slot[];         // 9 in a ring (6 on court, 3 off)
  servingIndex: number;  // index into slots (0..8)
  mode: RotationMode;
};