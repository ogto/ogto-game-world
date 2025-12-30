import type { WorldState } from "../types";
import { SHOOT_MAX_DIST } from "../constants";
import { shootRayCenter } from "../ray/dda";
import { hitTestEnemyAlongRay, applyEnemyHit } from "../enemy/hit";

export function requestShoot(s: WorldState) {
  if (document.pointerLockElement !== s.canvas) return;

  const w = s.weapon;
  if (w.fireCooldown > 0) return;

  w.fireCooldown = w.cooldownSec;
  w.firingFrame = true;

  w.recoilVel += -22;
  w.recoil = Math.max(w.recoil - 9, -24);

  // 먼저 “벽까지 거리” 계산
  const wall = shootRayCenter(s, SHOOT_MAX_DIST);
  const wallDist = wall.hit ? wall.dist : SHOOT_MAX_DIST;

  // 적 피격 테스트(벽보다 가까운 적이 있으면 적이 먼저 맞음)
  const yawDirX = Math.cos(s.player.a);
  const yawDirY = Math.sin(s.player.a);

  const hit = hitTestEnemyAlongRay(s, yawDirX, yawDirY, wallDist);

  // 트레이서 제거한 상태 기준: “맞는 표시만”
  const cx = innerWidth / 2;
  const cy = innerHeight / 2;

  if (hit.hit) {
    applyEnemyHit(hit.enemy, hit.part, hit.dmg);
    s.impacts.push({ t: 0, life: 0.16, x: cx, y: cy }); // 히트마커(정중앙)
    return;
  }

  // 벽 맞으면 표시
  if (wall.hit) {
    s.impacts.push({ t: 0, life: 0.18, x: cx, y: cy });
  }
}
