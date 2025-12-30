import type { WorldState } from "../types";

export function drawCrosshair(s: WorldState) {
  const ctx = s.ctx;
  const w = innerWidth;
  const h = innerHeight;

  const cx = w / 2;
  const cy = h / 2;

  const spreadPx = Math.max(0, -s.weapon.recoil) * 0.22;

  ctx.strokeStyle = "rgba(255,255,255,.78)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 10 - spreadPx, cy); ctx.lineTo(cx - 3 - spreadPx, cy);
  ctx.moveTo(cx + 3 + spreadPx, cy);  ctx.lineTo(cx + 10 + spreadPx, cy);
  ctx.moveTo(cx, cy - 10 - spreadPx); ctx.lineTo(cx, cy - 3 - spreadPx);
  ctx.moveTo(cx, cy + 3 + spreadPx);  ctx.lineTo(cx, cy + 10 + spreadPx);
  ctx.stroke();
}
