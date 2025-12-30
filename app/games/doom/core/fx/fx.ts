import type { WorldState } from "../types";
import { starBurst } from "../utils/draw";

export function renderFx(s: WorldState, dt: number) {
  const ctx = s.ctx;

  // tracers
  for (let i = s.tracers.length - 1; i >= 0; i--) {
    const tr = s.tracers[i];
    tr.t += dt;
    const a = 1 - tr.t / tr.life;
    if (a <= 0) {
      s.tracers.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = 0.65 * a;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,240,200,0.95)";
    ctx.beginPath();
    ctx.moveTo(tr.sx, tr.sy);
    ctx.lineTo(tr.ex, tr.ey);
    ctx.stroke();

    ctx.globalAlpha = 0.25 * a;
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255,180,90,0.65)";
    ctx.beginPath();
    ctx.moveTo(tr.sx, tr.sy);
    ctx.lineTo(tr.ex, tr.ey);
    ctx.stroke();
    ctx.restore();
  }

  // impacts
  for (let i = s.impacts.length - 1; i >= 0; i--) {
    const im = s.impacts[i];
    im.t += dt;
    const a = 1 - im.t / im.life;
    if (a <= 0) {
      s.impacts.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.translate(im.x, im.y);
    ctx.globalAlpha = 0.9 * a;
    ctx.fillStyle = "rgba(255,240,210,0.9)";
    starBurst(ctx, 0, 0, 4, 12, 7);
    ctx.fill();

    ctx.globalAlpha = 0.45 * a;
    ctx.fillStyle = "rgba(255,170,90,0.85)";
    starBurst(ctx, 0, 0, 2, 8, 6);
    ctx.fill();
    ctx.restore();
  }
}
