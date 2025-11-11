import type { Rotation, ExtPosition, Player } from '../types';

const ring: ExtPosition[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const nextPosMap = new Map<ExtPosition, ExtPosition>(ring.map((p, i) => [p, ring[(i + 1) % ring.length]]));

export function rotate(r: Rotation): Rotation {
  const rotated = r.slots.map((s) => ({ ...s, pos: nextPosMap.get(s.pos)! }));
  const servingIndex = (r.servingIndex + ring.length - 1) % ring.length;
  return { ...r, slots: rotated, servingIndex };
}

// Grid: cols 0..2 (left→right), rows 0..2 (front row at 0, off-court at 2)
// row 0: 4,3,2  | row 1: 5,6,1 | row 2: 7,8,9
export function positionToGrid(pos: ExtPosition): { row: 0 | 1 | 2; col: 0 | 1 | 2 } {
  switch (pos) {
    case 4: return { row: 0, col: 0 };
    case 3: return { row: 0, col: 1 };
    case 2: return { row: 0, col: 2 };
    case 5: return { row: 1, col: 0 };
    case 6: return { row: 1, col: 1 };
    case 1: return { row: 1, col: 2 };
    case 7: return { row: 2, col: 0 };
    case 8: return { row: 2, col: 1 };
    case 9: return { row: 2, col: 2 };
  }
}

export const gridToPosition = (row: 0 | 1 | 2, col: 0 | 1 | 2): ExtPosition => {
  if (row === 0 && col === 0) return 4;
  if (row === 0 && col === 1) return 3;
  if (row === 0 && col === 2) return 2;
  if (row === 1 && col === 0) return 5;
  if (row === 1 && col === 1) return 6;
  if (row === 1 && col === 2) return 1;
  if (row === 2 && col === 0) return 7;
  if (row === 2 && col === 1) return 8;
  return 9;
};

// Helpers
export const isBackRow = (pos: ExtPosition) => pos === 1 || pos === 6 || pos === 5; // RB, MB, LB
export const isOffCourt = (pos: ExtPosition) => pos === 7 || pos === 8 || pos === 9;

export function getActiveSetter(rotation: Rotation, players: Player[]): string | null {
  const setters = players.filter((p) => p.role === 'S').map((p) => p.id);
  if (rotation.mode === '5-1') {
    return setters.includes('p1') ? 'p1' : setters[0] ?? null;
  }
  const backRowSetter = rotation.slots.find((s) => isBackRow(s.pos) && setters.includes(s.playerId));
  return backRowSetter?.playerId ?? (setters[0] ?? null);
}

export type OverlapIssue = { a: string; b: string; type: 'row' | 'leftRight'; message: string };

// Simple legality check at serve based on rotational positions
export function checkOverlap(rotation: Rotation): { ok: boolean; issues: OverlapIssue[] } {
  const map = new Map<number, string>();
  rotation.slots.forEach((s) => map.set(s.pos as number, s.playerId));

  const issues: OverlapIssue[] = [];
  // Row (front/back): back must be deeper than corresponding front
  const pairs: [number, number][] = [[1, 2], [6, 3], [5, 4]]; // (back,right) behind (front,right), etc.
  for (const [backPos, frontPos] of pairs) {
    if (!map.has(backPos) || !map.has(frontPos)) continue;
    const backRow = positionToGrid(backPos as ExtPosition).row;
    const frontRow = positionToGrid(frontPos as ExtPosition).row;
    if (backRow <= frontRow) {
      issues.push({ a: map.get(backPos)!, b: map.get(frontPos)!, type: 'row', message: `Back-row ${backPos} must be behind front-row ${frontPos}` });
    }
  }

  // Left/right order within each row: Front (4<3<2), Back (5<6<1)
  const frontOrder = [4, 3, 2];
  const backOrder = [5, 6, 1];
  const ensureOrder = (order: number[]) => {
    for (let i = 0; i < order.length - 1; i++) {
      const left = order[i], right = order[i + 1];
      if (map.has(left) && map.has(right)) {
        const leftCol = positionToGrid(left as ExtPosition).col;
        const rightCol = positionToGrid(right as ExtPosition).col;
        if (leftCol >= rightCol) {
          issues.push({ a: map.get(left)!, b: map.get(right)!, type: 'leftRight', message: `${left} must stay left of ${right}` });
        }
      }
    }
  };
  ensureOrder(frontOrder);
  ensureOrder(backOrder);

  return { ok: issues.length === 0, issues };
}