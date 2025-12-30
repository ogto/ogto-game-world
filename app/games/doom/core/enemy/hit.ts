import type { WorldState } from "../types";
import type { Enemy } from "./types";

export type HitResult =
  | { hit: false }
  | { hit: true; enemy: Enemy; part: "head" | "body"; dmg: number; dist: number };

function rayCircleIntersect2D(
  ox: number, oy: number,
  dx: number, dy: number,
  cx: number, cy: number,
  r: number
) {
  // Ray: O + tD, circle center C
  const fx = ox - cx;
  const fy = oy - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;

  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;

  const sdisc = Math.sqrt(disc);
  const t1 = (-b - sdisc) / (2 * a);
  const t2 = (-b + sdisc) / (2 * a);

  // 가장 가까운 양의 t
  if (t1 > 0) return t1;
  if (t2 > 0) return t2;
  return null;
}

/**
 * 벽까지 거리(wallDist) 안에서 가장 먼저 맞는 적을 찾는다.
 * head/body는 pitch(상하 에임)를 기반으로 단순 판정.
 */
export function hitTestEnemyAlongRay(
  s: WorldState,
  yawDirX: number,
  yawDirY: number,
  wallDist: number
): HitResult {
  let bestT = Infinity;
  let best: Enemy | null = null;

  const ox = s.player.x;
  const oy = s.player.y;

  for (const e of s.enemies) {
    if (e.state === "dead") continue;
    const t = rayCircleIntersect2D(ox, oy, yawDirX, yawDirY, e.x, e.y, e.radius);
    if (t == null) continue;
    if (t > wallDist) continue;
    if (t < bestT) { bestT = t; best = e; }
  }

  if (!best) return { hit: false };

  // ✅ head/body 판정: 피치가 “위쪽”이면 headshot 확률 ↑
  // pitch 방향은 마우스 설정에 따라 부호가 달라질 수 있어서 “절대값+부호”로 단순화
  // - 화면 위를 볼수록 head 가능성이 증가
  const p = s.player.pitch;

  // 기준: -0.10 이상 위를 보면 head 쪽(환경 따라 값 조절 가능)
  const isHead = p < -0.10;

  const part: "head" | "body" = isHead ? "head" : "body";
  const dmg = part === "head" ? 2 : 1;

  return { hit: true, enemy: best, part, dmg, dist: bestT };
}

export function applyEnemyHit(e: Enemy, part: "head" | "body", dmg: number) {
  e.hp -= dmg;
  e.hitFlash = 0.18;

  if (e.hp <= 0) {
    e.state = "dead";
    e.deadT = 0;
  }
}
