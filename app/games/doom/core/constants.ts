export const BLOCK_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

export const MAX_DPR = 2;

export const PLAYER_DEFAULT = {
  x: 2.5,
  y: 1.5,
  a: 0,
  pitch: 0,
  fov: Math.PI / 3,
  radius: 0.18,

  speed: 1.2,
  runMul: 1.55,

  mouseSens: 0.0019,
  pitchSens: 0.0015,

  hp: 100,
  maxHp: 100,
};

// 스폰/적 관련 상수
export const ENEMY_MAX = 10;
export const ENEMY_SPAWN_EVERY = 0.9;      // 초당 스폰 시도
export const ENEMY_MIN_DIST = 4.5;         // 플레이어와 최소 거리
export const ENEMY_DESPAWN_DIST = 30;      // 너무 멀면 정리(선택)


export const WEAPON_DEFAULT = {
  recoil: 0,
  recoilVel: 0,
  fireCooldown: 0,
  cooldownSec: 0.105,
  firingFrame: false,
};

export const SHOOT_MAX_DIST = 45;
