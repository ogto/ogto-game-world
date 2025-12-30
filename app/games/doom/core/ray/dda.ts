import type { WorldState } from "../types";

export type CastHit = {
  dist: number;
  side: 0 | 1;
  mapX: number;
  mapY: number;
  hx: number;
  hy: number;
  u: number;
  wall: number;
};

export type ShootRes = { hit: boolean; dist: number; side: 0 | 1; wall: number };

export function castRay(s: WorldState, rayAngle: number): CastHit {
  const dirX = Math.cos(rayAngle);
  const dirY = Math.sin(rayAngle);

  let mapX = Math.floor(s.player.x);
  let mapY = Math.floor(s.player.y);

  const invX = dirX === 0 ? 1e-9 : dirX;
  const invY = dirY === 0 ? 1e-9 : dirY;
  const deltaDistX = Math.abs(1 / invX);
  const deltaDistY = Math.abs(1 / invY);

  let stepX: number, stepY: number, sideDistX: number, sideDistY: number;
  if (dirX < 0) { stepX = -1; sideDistX = (s.player.x - mapX) * deltaDistX; }
  else         { stepX =  1; sideDistX = (mapX + 1 - s.player.x) * deltaDistX; }

  if (dirY < 0) { stepY = -1; sideDistY = (s.player.y - mapY) * deltaDistY; }
  else         { stepY =  1; sideDistY = (mapY + 1 - s.player.y) * deltaDistY; }

  let side: 0 | 1 = 0;

  for (let it = 0; it < 4096; it++) {
    if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
    else                       { sideDistY += deltaDistY; mapY += stepY; side = 1; }

    const v = s.stage.cell(mapX, mapY);
    if (v !== 0) {
      let dist: number;
      if (side === 0) dist = (mapX - s.player.x + (1 - stepX) / 2) / invX;
      else           dist = (mapY - s.player.y + (1 - stepY) / 2) / invY;

      const hx = s.player.x + dirX * dist;
      const hy = s.player.y + dirY * dist;

      let u = side === 0 ? (hy - Math.floor(hy)) : (hx - Math.floor(hx));
      if ((side === 0 && stepX < 0) || (side === 1 && stepY > 0)) u = 1 - u;

      return { dist: Math.max(0.0001, dist), side, mapX, mapY, hx, hy, u, wall: v };
    }
  }

  return { dist: 999, side: 0, mapX: -1, mapY: -1, hx: 0, hy: 0, u: 0, wall: 3 };
}

// ✅ 무조건 크로스헤어(정중앙) 방향으로 히트스캔 (pitch는 렌더만)
export function shootRayCenter(s: WorldState, maxDist: number): ShootRes {
  const angle = s.player.a;
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  let mapX = Math.floor(s.player.x);
  let mapY = Math.floor(s.player.y);

  const invX = dirX === 0 ? 1e-9 : dirX;
  const invY = dirY === 0 ? 1e-9 : dirY;
  const deltaDistX = Math.abs(1 / invX);
  const deltaDistY = Math.abs(1 / invY);

  let stepX: number, stepY: number, sideDistX: number, sideDistY: number;
  if (dirX < 0) { stepX = -1; sideDistX = (s.player.x - mapX) * deltaDistX; }
  else         { stepX =  1; sideDistX = (mapX + 1 - s.player.x) * deltaDistX; }

  if (dirY < 0) { stepY = -1; sideDistY = (s.player.y - mapY) * deltaDistY; }
  else         { stepY =  1; sideDistY = (mapY + 1 - s.player.y) * deltaDistY; }

  let side: 0 | 1 = 0;

  for (let it = 0; it < 4096; it++) {
    if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
    else                       { sideDistY += deltaDistY; mapY += stepY; side = 1; }

    let dist: number;
    if (side === 0) dist = (mapX - s.player.x + (1 - stepX) / 2) / invX;
    else           dist = (mapY - s.player.y + (1 - stepY) / 2) / invY;

    if (dist > maxDist) break;

    const v = s.stage.cell(mapX, mapY);
    if (v !== 0) return { hit: true, dist, side, wall: v };
  }

  return { hit: false, dist: maxDist, side: 0, wall: 0 };
}
