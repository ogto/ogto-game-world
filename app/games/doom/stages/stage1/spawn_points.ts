import { CITY_MAP } from "./map";

export function buildStage1SpawnPoints() {
  const pts: Array<{ x: number; y: number }> = [];
  for (let my = 0; my < CITY_MAP.length; my++) {
    for (let mx = 0; mx < CITY_MAP[0].length; mx++) {
      if (CITY_MAP[my][mx] !== 0) continue;

      // 셀 중앙
      const x = mx + 0.5;
      const y = my + 0.5;

      // 벽 바로 옆은 피해서 “갑툭튀” 느낌 줄이기(선택)
      // 주변에 벽이 3개 이상이면 통로나 구석이라 스폰에 좋음
      let walls = 0;
      const n = [
        [mx + 1, my],
        [mx - 1, my],
        [mx, my + 1],
        [mx, my - 1],
      ];
      for (const [ax, ay] of n) {
        const v = (CITY_MAP[ay]?.[ax] ?? 3);
        if (v !== 0) walls++;
      }
      if (walls >= 2) pts.push({ x, y });
    }
  }
  return pts;
}
