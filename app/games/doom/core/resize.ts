import { MAX_DPR } from "./constants";
import type { WorldState } from "./types";

export function resizeCanvas(s: WorldState) {
  const dpr = Math.max(1, Math.min(MAX_DPR, devicePixelRatio || 1));
  s.dpr = dpr;

  s.canvas.width = Math.floor(innerWidth * dpr);
  s.canvas.height = Math.floor(innerHeight * dpr);

  // 좌표계를 CSS 픽셀 기준으로 맞춤
  s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function bindResize(s: WorldState) {
  const onResize = () => resizeCanvas(s);
  window.addEventListener("resize", onResize);
  s.cleanupFns.push(() => window.removeEventListener("resize", onResize));
}
