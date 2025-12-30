export type Keys = Record<string, boolean>;

export type Player = {
  x: number;
  y: number;
  a: number;
  pitch: number;
  fov: number;
  radius: number;

  speed: number;
  runMul: number;

  mouseSens: number;
  pitchSens: number;

  // ✅ 플레이어 HP
  hp: number;
  maxHp: number;
};

export type Weapon = {
  recoil: number;
  recoilVel: number;
  fireCooldown: number;
  cooldownSec: number;
  firingFrame: boolean;
};

export type Tracer = { t: number; life: number; sx: number; sy: number; ex: number; ey: number };
export type Impact = { t: number; life: number; x: number; y: number };

export type StageAdapter = {
  width: number;
  height: number;
  cell: (mx: number, my: number) => number;
  renderWorld: (ctx: CanvasRenderingContext2D, s: WorldState, now: number) => void;
  // ✅ 랜덤 스폰을 위한 “가능한 스폰 좌표 목록”
  getSpawnPoints: () => Array<{ x: number; y: number }>;
};

export type WorldState = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  hintEl: HTMLElement;

  stage: StageAdapter;

  dpr: number;
  keys: Keys;

  player: Player;
  weapon: Weapon;

  muzzle: { x: number; y: number };
  tracers: Tracer[];
  impacts: Impact[];

  // ✅ 적 시스템
  enemies: import("./enemy/types").Enemy[];
  enemyNextId: number;

  // ✅ 적/벽 가림(occlusion)을 위한 zBuffer
  zNumRays: number;
  zBuffer: Float32Array | null;

  // ✅ 피격 플래시
  damageFlash: number;

  lastT: number;
  rafId: number | null;

  cleanupFns: Array<() => void>;
};
