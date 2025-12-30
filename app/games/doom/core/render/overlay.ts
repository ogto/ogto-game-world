import type { WorldState } from "../types";

export function renderDamageOverlay(s: WorldState) {
  if (s.damageFlash <= 0) return;
  const ctx = s.ctx;
  const w = innerWidth;
  const h = innerHeight;

  ctx.save();
  ctx.globalAlpha = Math.min(0.65, s.damageFlash * 0.75);
  ctx.fillStyle = "rgba(255,0,0,0.18)";
  ctx.fillRect(0, 0, w, h);

  // 테두리 비네팅 느낌
  ctx.globalAlpha = Math.min(0.75, s.damageFlash * 0.9);
  ctx.strokeStyle = "rgba(255,0,0,0.35)";
  ctx.lineWidth = 24;
  ctx.strokeRect(12, 12, w - 24, h - 24);

  ctx.restore();
}
