import type { Enemy } from "../../core/enemy/types";

export function createStage1Enemies(): Enemy[] {
  return [
    { id: 1, x: 6.5, y: 6.5, radius: 0.35, hp: 3, speed: 0.6, state: "idle", hitFlash: 0 },
    { id: 2, x: 10.5, y: 12.5, radius: 0.35, hp: 3, speed: 0.6, state: "idle", hitFlash: 0 },
  ];
}
