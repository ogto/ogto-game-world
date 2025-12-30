import type { WorldState } from "../../core/types";
import { castRay } from "../../core/ray/dda";

export function renderWorldStage1(ctx: CanvasRenderingContext2D, s: WorldState, now: number) {
  const w = innerWidth;
  const h = innerHeight;

  const pitchShift = s.player.pitch * (h * 0.42);
  const centerY = h / 2 + pitchShift;

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, "#080c1a");
  sky.addColorStop(1, "#05070f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // skyline
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#0a0f1d";
  for (let i = 0; i < 18; i++) {
    const bw = 40 + (i % 5) * 22;
    const bh = 80 + ((i * 37) % 160);
    const bx = (i / 18) * w + ((i * 29) % 30);
    ctx.fillRect(bx, h * 0.18 + (i % 3) * 10 + pitchShift * 0.15, bw, bh);
  }
  ctx.globalAlpha = 1;

  // road
  ctx.fillStyle = "#0c111b";
  ctx.fillRect(0, centerY + h * 0.02, w, h);

  // lane
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 14; i++) {
    const yy = centerY + h * 0.24 + i * 34;
    ctx.fillRect(w * 0.5 - 2, yy, 4, 18);
  }
  ctx.globalAlpha = 1;

  const numRays = Math.max(320, Math.floor(w));
  const colW = w / numRays;
  const halfFov = s.player.fov / 2;

  // ✅ zBuffer 준비
  if (!s.zBuffer || s.zNumRays !== numRays) {
    s.zBuffer = new Float32Array(numRays);
    s.zNumRays = numRays;
  }

  for (let i = 0; i < numRays; i++) {
    const t = i / numRays;
    const rayA = s.player.a - halfFov + t * s.player.fov;
    const hit = castRay(s, rayA);

    const dist = hit.dist * Math.cos(rayA - s.player.a);
    s.zBuffer[i] = dist; // ✅ 저장

    const heightMul = hit.wall === 1 ? 0.85 : hit.wall === 2 ? 1.1 : 1.35;
    const lineH = Math.min(h, (h / Math.max(0.001, dist)) * heightMul);
    const y0 = centerY - lineH / 2;

    const sideShade = hit.side === 1 ? 0.78 : 1.0;
    const shade = Math.max(0, Math.min(1, 1 - dist / 18));
    let v = Math.floor(22 + 210 * shade * sideShade);

    const fog = Math.max(0, Math.min(1, dist / 22));
    v = Math.floor(v * (1 - fog) + 14 * fog);

    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(i * colW, y0, colW + 0.5, lineH);

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#000";
    ctx.fillRect(i * colW, y0 + lineH * 0.7, colW + 0.5, lineH * 0.3);
    ctx.globalAlpha = 1;

    // ✅ 네온/창문 제거 원하면 여기 블록 없음(네가 원했던 상태 유지)
  }
}
