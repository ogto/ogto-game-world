export type EnemyState = "idle" | "chase" | "attack" | "dead";

export type Enemy = {
  id: number;
  x: number;
  y: number;

  radius: number;

  hp: number;
  maxHp: number;

  speed: number;

  state: EnemyState;

  // 타이머들
  attackCd: number;
  hitFlash: number;

  // 죽음 애니메이션
  deadT: number;      // 0~1
};
