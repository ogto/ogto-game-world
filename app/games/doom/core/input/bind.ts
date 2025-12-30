import { BLOCK_KEYS } from "../constants";
import type { WorldState } from "../types";
import { clamp } from "../utils/math";
import { requestShoot } from "../weapon/weapon";

function setKey(s: WorldState, code: string, down: boolean) {
  s.keys[code] = down;
}

function isLocked(s: WorldState) {
  return document.pointerLockElement === s.canvas;
}

export function bindInput(s: WorldState) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (BLOCK_KEYS.has(e.code)) e.preventDefault();
    setKey(s, e.code, true);
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") setKey(s, "Shift", true);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (BLOCK_KEYS.has(e.code)) e.preventDefault();
    setKey(s, e.code, false);
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") setKey(s, "Shift", false);
  };

  const onCanvasClick = () => {
    s.canvas.focus();
    if (!isLocked(s)) s.canvas.requestPointerLock();
  };

  const onPointerLockChange = () => {
    const locked = isLocked(s);
    s.hintEl.style.display = locked ? "none" : "block";
    if (locked) s.canvas.focus();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isLocked(s)) return;
    s.player.a += e.movementX * s.player.mouseSens;

    s.player.pitch += e.movementY * s.player.pitchSens;
    s.player.pitch = clamp(s.player.pitch, -0.65, 0.65);
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    requestShoot(s);
  };

  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp, { passive: false });
  s.canvas.addEventListener("click", onCanvasClick);
  document.addEventListener("pointerlockchange", onPointerLockChange);
  document.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", onMouseDown, { passive: false });

  s.cleanupFns.push(() => window.removeEventListener("keydown", onKeyDown as any));
  s.cleanupFns.push(() => window.removeEventListener("keyup", onKeyUp as any));
  s.cleanupFns.push(() => s.canvas.removeEventListener("click", onCanvasClick as any));
  s.cleanupFns.push(() => document.removeEventListener("pointerlockchange", onPointerLockChange as any));
  s.cleanupFns.push(() => document.removeEventListener("mousemove", onMouseMove as any));
  s.cleanupFns.push(() => window.removeEventListener("mousedown", onMouseDown as any));
}
