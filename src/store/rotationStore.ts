import { create } from 'zustand';
import type { Player, Rotation, ExtPosition } from '../types';
import { rotate as rotateHelper } from '../utils/rotation';

export type RotationState = {
  players: Player[];
  rotation: Rotation;
  setSlotPosition: (playerId: string, pos: ExtPosition) => void; // swap-safe
  rotate: () => void;                // rotate all 9
  toggleMode: () => void;            // 6–2 ↔ 5–1
  // roster editing
  setPlayerName: (playerId: string, name: string) => void;
  setPlayerRole: (playerId: string, role: Player['role']) => void;
  setPlayerJersey: (playerId: string, jersey?: number) => void;
};

const defaultPlayers: Player[] = [
  { id: 'p1', name: 'Setter1', role: 'S', jersey: 1 },
  { id: 'p2', name: 'OH1',    role: 'OH', jersey: 2 },
  { id: 'p3', name: 'MB1',    role: 'MB', jersey: 3 },
  { id: 'p4', name: 'OPP1',   role: 'OPP', jersey: 4 },
  { id: 'p5', name: 'MB2',    role: 'MB', jersey: 5 },
  { id: 'p6', name: 'OH2',    role: 'OH', jersey: 6 },
  { id: 'p7', name: 'Setter2',role: 'S',  jersey: 7 },
  { id: 'p8', name: 'DS1',    role: 'DS', jersey: 8 },
  { id: 'p9', name: 'OPP2',   role: 'OPP',jersey: 9 },
];

const defaultRotation: Rotation = {
  slots: [
    { pos: 1, playerId: 'p1' },
    { pos: 2, playerId: 'p2' },
    { pos: 3, playerId: 'p3' },
    { pos: 4, playerId: 'p4' },
    { pos: 5, playerId: 'p5' },
    { pos: 6, playerId: 'p6' },
    { pos: 7, playerId: 'p7' },
    { pos: 8, playerId: 'p8' },
    { pos: 9, playerId: 'p9' },
  ],
  servingIndex: 0,
  mode: '6-2',
};

export const useRotationStore = create<RotationState>((set, get) => ({
  players: defaultPlayers,
  rotation: defaultRotation,
  setSlotPosition: (playerId, newPos) => {
    set((state) => {
      const slots = [...state.rotation.slots];
      const meIdx = slots.findIndex((s) => s.playerId === playerId);
      const targetIdx = slots.findIndex((s) => s.pos === newPos);
      if (meIdx === -1 || targetIdx === -1) return state as any;
      const me = slots[meIdx];
      const target = slots[targetIdx];
      slots[meIdx] = { ...me, pos: newPos };
      slots[targetIdx] = { ...target, pos: me.pos };
      return { rotation: { ...state.rotation, slots } } as any;
    });
  },
  rotate: () => {
    const current = get().rotation;
    const rotated = rotateHelper(current);
    set({ rotation: rotated });
  },
  toggleMode: () => {
    set((state) => ({ rotation: { ...state.rotation, mode: state.rotation.mode === '6-2' ? '5-1' : '6-2' } }));
  },
  setPlayerName: (playerId, name) => {
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, name } : p)),
    }));
  },
  setPlayerRole: (playerId, role) => {
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, role } : p)),
    }));
  },
  setPlayerJersey: (playerId, jersey) => {
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, jersey } : p)),
    }));
  },
}));