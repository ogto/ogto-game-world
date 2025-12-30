import { createWorldState } from "./state";
import { bindResize, resizeCanvas } from "./resize";
import { bindInput } from "./input/bind";
import { updateWorld } from "./physics/update";
import { renderFx } from "./fx/fx";
import { drawGunGlock } from "./render/gun_glock";
import { drawCrosshair } from "./render/crosshair";
import { renderEnemies } from "./enemy/render";
import { renderDamageOverlay } from "./render/overlay";
import type { StageAdapter } from "./types";

export function startEngine(canvas: HTMLCanvasElement, hintEl: HTMLElement, stage: StageAdapter) {
  const s = createWorldState(canvas, hintEl, stage);

  resizeCanvas(s);
  bindResize(s);
  bindInput(s);

  let running = true;

  const tick = (now: number) => {
    if (!running) return;

    const dt = Math.min(0.033, (now - s.lastT) / 1000);
    s.lastT = now;

    updateWorld(s, dt);

    stage.renderWorld(s.ctx, s, now);

    // 적은 월드 다음에(벽 zBuffer 기반 가림)
    renderEnemies(s);

    renderFx(s, dt);
    drawGunGlock(s, now);
    drawCrosshair(s);

    // 플레이어 피격 오버레이
    renderDamageOverlay(s);

    s.rafId = requestAnimationFrame(tick);
  };

  s.rafId = requestAnimationFrame(tick);

  return () => {
    running = false;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    s.cleanupFns.forEach((fn) => fn());
  };
}
