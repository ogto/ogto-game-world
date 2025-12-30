import { startEngine } from "../../core/engine";
import type { StageAdapter } from "../../core/types";
import { CITY_MAP } from "./map";
import { renderWorldStage1 } from "./render_world";
import { buildStage1SpawnPoints } from "./spawn_points";

const SPAWN_POINTS = buildStage1SpawnPoints();

export function startStage1(canvas: HTMLCanvasElement, hintEl: HTMLElement) {
  const stage1: StageAdapter = {
    width: CITY_MAP[0].length,
    height: CITY_MAP.length,
    cell(mx, my) {
      if (mx < 0 || my < 0 || mx >= CITY_MAP[0].length || my >= CITY_MAP.length) return 3;
      return CITY_MAP[my][mx];
    },
    renderWorld: renderWorldStage1,
    getSpawnPoints() {
      return SPAWN_POINTS;
    },
  };

  return startEngine(canvas, hintEl, stage1);
}
