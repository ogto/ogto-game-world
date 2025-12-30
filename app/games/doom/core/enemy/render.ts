import type { WorldState } from "../types";
import type { Enemy } from "./types";

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
function wrapPI(a: number) {
  while (a < -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

export function renderEnemies(s: WorldState) {
  const ctx = s.ctx;
  const w = innerWidth;
  const h = innerHeight;

  const z = s.zBuffer;
  const numRays = s.zNumRays;
  if (!z || numRays <= 0) return;

  const halfFov = s.player.fov / 2;
  const pitchShift = s.player.pitch * (h * 0.42);
  const centerY = h / 2 + pitchShift;

  // 거리순(멀->가까) 그리기
  const list = s.enemies
    .filter(e => !(e.state === "dead" && e.deadT >= 1))
    .slice()
    .sort((a, b) => {
      const da = (a.x - s.player.x) ** 2 + (a.y - s.player.y) ** 2;
      const db = (b.x - s.player.x) ** 2 + (b.y - s.player.y) ** 2;
      return db - da;
    });

  for (const e of list) {
    const dx = e.x - s.player.x;
    const dy = e.y - s.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.001) continue;

    const ang = Math.atan2(dy, dx);
    const rel = wrapPI(ang - s.player.a);
    if (Math.abs(rel) > halfFov + 0.35) continue; // 화면 밖은 스킵

    // 스크린 x(0~w)
    const xNorm = (rel + halfFov) / (s.player.fov);
    const sx = xNorm * w;

    // 크기 (둠 스타일: 거리 반비례)
    const baseH = (h / dist) * 0.95;
    const deadShrink = e.state === "dead" ? (1 - 0.55 * e.deadT) : 1;
    const spriteH = baseH * deadShrink;
    const spriteW = spriteH * 0.58;

    // y 위치
    const y0 = centerY - spriteH / 2;

    // 화면에 그릴 rect
    const left = sx - spriteW / 2;
    const right = sx + spriteW / 2;

    // 컬러: 기본 + 맞으면 플래시
    const flash = e.hitFlash > 0 ? 1 : 0;
    const alpha = e.state === "dead" ? (1 - e.deadT) : 1;

    // 간단 “실루엣+눈” 형태(그럴듯)
    // 벽 뒤 가림: 컬럼별로 zBuffer보다 가까울 때만 그리기
    const colW = w / numRays;
    const startRay = clamp(Math.floor(left / colW), 0, numRays - 1);
    const endRay = clamp(Math.floor(right / colW), 0, numRays - 1);

    for (let r = startRay; r <= endRay; r++) {
      if (dist >= z[r]) continue; // 벽 뒤면 그리지 않음

      const rx0 = r * colW;
      const rx1 = rx0 + colW + 0.5;

      // 적이 차지하는 구간 내에서만
      const clipL = Math.max(rx0, left);
      const clipR = Math.min(rx1, right);
      const cw = clipR - clipL;
      if (cw <= 0) continue;

      ctx.save();
      ctx.globalAlpha = alpha;

      // 몸통
      ctx.fillStyle = flash ? "rgba(255,210,160,0.95)" : "rgba(140,150,165,0.92)";
      ctx.fillRect(clipL, y0, cw, spriteH);

      // 그림자/그라데이션 느낌
      ctx.globalAlpha = alpha * 0.25;
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(clipL, y0 + spriteH * 0.65, cw, spriteH * 0.35);

      // “눈” (상단 25% 근처)
      ctx.globalAlpha = alpha * (flash ? 0.9 : 0.55);
      ctx.fillStyle = flash ? "rgba(255,80,80,0.9)" : "rgba(255,220,120,0.75)";
      const eyeY = y0 + spriteH * 0.22;
      ctx.fillRect(clipL, eyeY, cw, Math.max(2, spriteH * 0.02));

      ctx.restore();
    }
  }
}
