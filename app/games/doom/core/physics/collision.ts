import type { WorldState } from "../types";

export function isWallAt(s: WorldState, x: number, y: number) {
  const mx = Math.floor(x);
  const my = Math.floor(y);
  return s.stage.cell(mx, my) !== 0;
}

export function moveWithCollision(s: WorldState, nx: number, ny: number) {
  const p = s.player;
  const r = p.radius;

  // x
  if (
    !isWallAt(s, nx + (nx > p.x ? r : -r), p.y) &&
    !isWallAt(s, nx, p.y + r) &&
    !isWallAt(s, nx, p.y - r)
  ) {
    p.x = nx;
  }

  // y
  if (
    !isWallAt(s, p.x, ny + (ny > p.y ? r : -r)) &&
    !isWallAt(s, p.x + r, ny) &&
    !isWallAt(s, p.x - r, ny)
  ) {
    p.y = ny;
  }
}
