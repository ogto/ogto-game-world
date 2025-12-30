import type { StageAdapter, WorldState } from "./types";
import { PLAYER_DEFAULT, WEAPON_DEFAULT } from "./constants";

export function createWorldState(canvas: HTMLCanvasElement, hintEl: HTMLElement, stage: StageAdapter): WorldState {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("2D context not available");

  return {
    canvas,
    ctx,
    hintEl,
    stage,

    dpr: 1,
    keys: Object.create(null),

    player: { ...PLAYER_DEFAULT },
    weapon: { ...WEAPON_DEFAULT },

    muzzle: { x: innerWidth * 0.53, y: innerHeight * 0.64 },
    tracers: [],
    impacts: [],

    enemies: [],
    enemyNextId: 1,

    zNumRays: 0,
    zBuffer: null,

    damageFlash: 0,

    lastT: performance.now(),
    rafId: null,

    cleanupFns: [],
  };
}
