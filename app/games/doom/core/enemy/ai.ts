import type { WorldState } from "../types";
import type { Enemy } from "./types";

export function updateEnemyAI(s: WorldState, e: Enemy, dt: number) {
  if (e.state === "dead") {
    // 사망 애니메이션 진행
    e.deadT = Math.min(1, e.deadT + dt * 1.4);
    return;
  }

  // timers
  e.hitFlash = Math.max(0, e.hitFlash - dt);
  e.attackCd = Math.max(0, e.attackCd - dt);

  const dx = s.player.x - e.x;
  const dy = s.player.y - e.y;
  const dist = Math.hypot(dx, dy);

  // 가까워지면 추적
  if (dist < 10) e.state = "chase";
  if (dist < 1.15) e.state = "attack";
  if (dist > 12) e.state = "idle";

  if (e.state === "chase") {
    const nx = dx / Math.max(0.0001, dist);
    const ny = dy / Math.max(0.0001, dist);

    e.x += nx * e.speed * dt;
    e.y += ny * e.speed * dt;
  }

  if (e.state === "attack") {
    if (e.attackCd <= 0) {
      e.attackCd = 0.75;

      // 플레이어 데미지
      s.player.hp = Math.max(0, s.player.hp - 8);
      s.damageFlash = Math.min(1, s.damageFlash + 0.55);
    }
  }
}
