import type { WorldState } from "../types";
import { moveWithCollision } from "./collision";
import { trySpawnEnemies } from "../enemy/spawn";
import { updateEnemyAI } from "../enemy/ai";

export function updateWorld(s: WorldState, dt: number) {
  const k = s.keys;
  const p = s.player;

  const forward = (k["KeyW"] ? 1 : 0) + (k["KeyS"] ? -1 : 0);
  const strafe = (k["KeyD"] ? 1 : 0) + (k["KeyA"] ? -1 : 0);

  const run = k["Shift"] ? p.runMul : 1;
  const sp = p.speed * run * dt;

  const dx = Math.cos(p.a);
  const dy = Math.sin(p.a);

  const px = -dy;
  const py = dx;

  const nx = p.x + (dx * forward + px * strafe) * sp;
  const ny = p.y + (dy * forward + py * strafe) * sp;

  moveWithCollision(s, nx, ny);

  // weapon
  const w = s.weapon;
  w.fireCooldown = Math.max(0, w.fireCooldown - dt);
  w.firingFrame = false;

  w.recoilVel += (0 - w.recoil) * 95 * dt;
  w.recoilVel *= Math.pow(0.001, dt);
  w.recoil += w.recoilVel * dt;
  if (w.recoil > 0) w.recoil = 0;

  // 적 스폰(랜덤/지속)
  trySpawnEnemies(s, dt);

  // 적 AI 업데이트
  for (const e of s.enemies) updateEnemyAI(s, e, dt);

  // 피격 플래시 감쇠
  s.damageFlash = Math.max(0, s.damageFlash - dt * 1.8);
}
