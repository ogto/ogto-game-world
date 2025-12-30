import type { WorldState } from "../types";
import type { Enemy } from "./types";
import { ENEMY_MAX, ENEMY_MIN_DIST, ENEMY_SPAWN_EVERY } from "../constants";

type Director = { t: number };
const director: Director = { t: 0 };

function randInt(n: number) { return (Math.random() * n) | 0; }

function canSpawnAt(s: WorldState, x: number, y: number) {
  // 플레이어와 너무 가까우면 금지
  const dx = x - s.player.x;
  const dy = y - s.player.y;
  if (Math.hypot(dx, dy) < ENEMY_MIN_DIST) return false;

  // 적끼리 겹치지 않게
  for (const e of s.enemies) {
    if (e.state === "dead") continue;
    const ex = x - e.x;
    const ey = y - e.y;
    if (Math.hypot(ex, ey) < (e.radius + 0.5)) return false;
  }

  return true;
}

export function trySpawnEnemies(s: WorldState, dt: number) {
  director.t += dt;

  // 일정 주기마다 스폰 시도
  if (director.t < ENEMY_SPAWN_EVERY) return;
  director.t = 0;

  // 최대치 제한
  const alive = s.enemies.filter(e => e.state !== "dead").length;
  if (alive >= ENEMY_MAX) return;

  const pts = s.stage.getSpawnPoints();
  if (!pts.length) return;

  // 랜덤으로 여러 번 시도해서 “어딘가에서 튀어나오는” 느낌
  for (let tries = 0; tries < 10; tries++) {
    const p = pts[randInt(pts.length)];
    if (!canSpawnAt(s, p.x, p.y)) continue;

    const enemy: Enemy = {
      id: s.enemyNextId++,
      x: p.x,
      y: p.y,
      radius: 0.35,

      hp: 3,
      maxHp: 3,

      speed: 0.75,

      state: "idle",

      attackCd: 0,
      hitFlash: 0,
      deadT: 0,
    };

    s.enemies.push(enemy);
    break;
  }
}
