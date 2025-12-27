"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BEST_KEY = "recoil_trainer_best_v5";
const SFX_SHOT_SRC = "/sfx/shot_click.mp3"; // public/sfx/shot_click.mp3

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
function readBest(): number {
  if (typeof window === "undefined") return 0;
  const n = Number(localStorage.getItem(BEST_KEY) ?? "0");
  return Number.isFinite(n) ? n : 0;
}
function writeBest(n: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, String(n));
}
function randn() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

type BulletMark = { x: number; y: number; t: number };

export default function RecoilRangeClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // ✅ WebAudio (저지연)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const shotBufRef = useRef<AudioBuffer | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stateRef = useRef({
    lastT: 0,

    dpr: 1,
    w: 900,
    h: 560,

    // pointer lock
    locked: false,

    // virtual aim (cursor hidden)
    px: 0,
    py: 0,

    // for optional non-lock fallback
    pointerIn: false,
    pointerDown: false,
    lastPX: 0,
    lastPY: 0,

    // recoil control offset (drag down)
    controlX: 0,
    controlY: 0,

    // recoil physics offset
    recoilX: 0,
    recoilY: 0,
    recoilVX: 0,
    recoilVY: 0,

    // firing
    firing: false,
    rpm: 750,
    sprayTime: 0,
    shotCD: 0, // cooldown 방식

    // recoil tuning
    kickUp: 38,
    kickSide: 10,
    climb: 1.15,
    sideBias: 0.55,
    returnSpring: 16,
    damping: 8,

    // target board (far wall)
    boardX: 0,
    boardY: 0,
    boardR: 140,

    // marks
    marks: [] as BulletMark[],
    shots: 0,
    score: 0,
    best: 0,

    // gun animation
    gunKick: 0,

    // sfx throttle
    lastSfxAt: 0,
  });

  // ✅ SSR 안전: best는 0으로 시작하고, 마운트 후 로드
  const [ui, setUI] = useState({
    shots: 0,
    score: 0,
    best: 0,
    hint: "클릭하면 조준(커서 숨김) · 좌클릭 누르고 연사 · 마우스 아래로 내려 반동 제어 · ESC로 해제",
    locked: false,
  });

  function pushUI(force = false) {
    const s = stateRef.current as any;
    const t = nowMs();
    if (!force) {
      if (s._lastUiPush && t - s._lastUiPush < 80) return;
    }
    s._lastUiPush = t;

    setUI((prev) => ({
      ...prev,
      shots: s.shots,
      score: s.score,
      best: s.best,
      locked: s.locked,
    }));
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const s = stateRef.current;
    s.dpr = dpr;
    s.w = w;
    s.h = h;

    // far wall target (center-top)
    s.boardX = w * 0.5;
    s.boardY = h * 0.32;
    s.boardR = Math.min(w, h) * 0.12;

    // init aim center
    if (s.px === 0 && s.py === 0) {
      s.px = w * 0.5;
      s.py = h * 0.52;
    }
  }

  function resetStatsOnly() {
    const s = stateRef.current;

    s.sprayTime = 0;
    s.shotCD = 0;

    s.controlX = 0;
    s.controlY = 0;
    s.recoilX = 0;
    s.recoilY = 0;
    s.recoilVX = 0;
    s.recoilVY = 0;

    s.marks = [];
    s.shots = 0;
    s.score = 0;

    s.firing = false;
    s.pointerDown = false;

    s.gunKick = 0;

    pushUI(true);
  }

  // ✅ WebAudio preload/decode
  useEffect(() => {
    let alive = true;

    async function loadSfx() {
      try {
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as
          | typeof AudioContext
          | undefined;
        if (!Ctx) return;

        const ctx = new Ctx();
        const gain = ctx.createGain();
        gain.gain.value = 0.35;
        gain.connect(ctx.destination);

        audioCtxRef.current = ctx;
        gainRef.current = gain;

        const res = await fetch(SFX_SHOT_SRC);
        const arr = await res.arrayBuffer();
        const buf = await ctx.decodeAudioData(arr);
        if (!alive) return;
        shotBufRef.current = buf;
      } catch {
        // ignore
      }
    }

    loadSfx();

    // SSR-safe best load
    const best = readBest();
    stateRef.current.best = best;
    setUI((u) => ({ ...u, best }));

    return () => {
      alive = false;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      shotBufRef.current = null;
      gainRef.current = null;
    };
  }, []);

  function unlockAudioOnce() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state !== "running") ctx.resume().catch(() => {});
  }

  function playShotSfx() {
    const s = stateRef.current;
    const t = nowMs();
    if (t - s.lastSfxAt < 25) return;
    s.lastSfxAt = t;

    const ctx = audioCtxRef.current;
    const buf = shotBufRef.current;
    const gain = gainRef.current;
    if (!ctx || !buf || !gain) return;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(gain);
    src.start(0);
  }

  function addShot() {
    const s = stateRef.current;

    const aimX = s.px + s.controlX + s.recoilX;
    const aimY = s.py + s.controlY + s.recoilY;

    const elapsed = s.sprayTime;
    const spread = clamp(0.6 + elapsed * 1.15, 0.6, 5.0);
    const x = aimX + randn() * spread;
    const y = aimY + randn() * spread;

    s.marks.push({ x, y, t: nowMs() });
    if (s.marks.length > 360) s.marks.shift();

    s.shots += 1;

    // scoring
    const dx = x - s.boardX;
    const dy = y - s.boardY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d <= s.boardR) {
      const v = 100 - Math.floor((d / s.boardR) * 100);
      s.score += Math.max(0, v);
    }

    if (s.score > s.best) {
      s.best = s.score;
      writeBest(s.best);
    }

    // recoil kick (screen y down is +, so up is -)
    const climbFactor = 1 + elapsed * s.climb;
    const up = s.kickUp * climbFactor;

    const bias = Math.random() < s.sideBias ? 1 : -1;
    const side = (s.kickSide * bias + randn() * 1.2) * (1 + elapsed * 0.22);

    s.recoilVY -= up * 6;
    s.recoilVX += side * 5;

    // gun kick impulse
    s.gunKick = Math.min(1, s.gunKick + 0.35);

    playShotSfx();
    pushUI();
  }

  function drawFiringRangeBG(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    const w = s.w;
    const h = s.h;

    // ceiling-to-floor gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,255,255,0.04)");
    g.addColorStop(0.55, "rgba(255,255,255,0.015)");
    g.addColorStop(1, "rgba(0,0,0,0.14)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const horizon = h * 0.36;

    // floor perspective grid
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    for (let i = 1; i <= 18; i++) {
      const t = i / 18;
      const y = horizon + (h - horizon) * t * t;
      ctx.globalAlpha = 0.08 + t * 0.16;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const cx = w * 0.5;
    ctx.globalAlpha = 0.1;
    for (let i = -12; i <= 12; i++) {
      const x0 = cx + i * (w * 0.06);
      ctx.beginPath();
      ctx.moveTo(x0, h);
      ctx.lineTo(cx, horizon);
      ctx.stroke();
    }

    // horizon line
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();

    // vignette
    ctx.globalAlpha = 1;
    const vg = ctx.createRadialGradient(cx, h * 0.5, Math.min(w, h) * 0.2, cx, h * 0.5, Math.max(w, h) * 0.9);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.38)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 1;
  }

  function drawTarget(ctx: CanvasRenderingContext2D, s: typeof stateRef.current) {
    ctx.save();
    ctx.translate(s.boardX, s.boardY);

    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.roundRect(-s.boardR * 0.95, -s.boardR * 0.8, s.boardR * 1.9, s.boardR * 1.6, 14);
    ctx.fill();

    for (let i = 5; i >= 1; i--) {
      const rr = (s.boardR * i) / 5;
      ctx.globalAlpha = 0.18 + i * 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, rr, 0, Math.PI * 2);
      ctx.strokeStyle = "white";
      ctx.lineWidth = i === 5 ? 2 : 1;
      ctx.stroke();
    }

    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawGunOverlay(ctx: CanvasRenderingContext2D, s: typeof stateRef.current, dt: number) {
    const w = s.w;
    const h = s.h;

    // decay kick
    s.gunKick = Math.max(0, s.gunKick - dt * 3.6);

    // gun follows recoil a bit
    const swayX = s.recoilX * 0.06 + randn() * 0.18;
    const swayY = s.recoilY * 0.05 + randn() * 0.18;

    const kick = s.gunKick;
    const baseX = w * 0.54 + swayX;
    const baseY = h - 34 - kick * 14 + swayY;

    ctx.save();
    ctx.translate(baseX, baseY);

    // body
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.roundRect(-210, -62, 420, 130, 30);
    ctx.fill();

    // barrel
    ctx.globalAlpha = 0.26;
    ctx.beginPath();
    ctx.roundRect(60, -94, 260, 54, 18);
    ctx.fill();

    // top rail/sight
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.roundRect(-30, -104, 70, 34, 14);
    ctx.fill();

    // grip
    ctx.globalAlpha = 0.26;
    ctx.beginPath();
    ctx.roundRect(-92, -14, 44, 80, 14);
    ctx.fill();

    // magazine
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.roundRect(-32, 14, 34, 70, 12);
    ctx.fill();

    // muzzle flash (subtle)
    if (kick > 0.05 && s.firing) {
      ctx.globalAlpha = 0.14 + kick * 0.26;
      ctx.beginPath();
      ctx.arc(330, -68, 18 + kick * 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function step(t: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    if (!s.lastT) s.lastT = t;
    const dt = Math.min(0.033, (t - s.lastT) / 1000);
    s.lastT = t;

    // fire (cooldown 방식: 동시에 2발 방지)
    const shotInterval = 60 / s.rpm;
    if (s.firing) {
      s.sprayTime += dt;
      s.shotCD -= dt;
      if (s.shotCD <= 0) {
        addShot();
        s.shotCD = shotInterval;
      }
    } else {
      s.sprayTime = Math.max(0, s.sprayTime - dt * 2.2);
      s.shotCD = 0;
    }

    // recoil spring+damping
    const k = s.returnSpring;
    const d = s.damping;
    s.recoilVX += -k * s.recoilX * dt;
    s.recoilVY += -k * s.recoilY * dt;
    s.recoilVX *= Math.exp(-d * dt);
    s.recoilVY *= Math.exp(-d * dt);
    s.recoilX += s.recoilVX * dt;
    s.recoilY += s.recoilVY * dt;

    s.recoilX = clamp(s.recoilX, -220, 220);
    s.recoilY = clamp(s.recoilY, -260, 260);

    // control relax back to 0 (손맛)
    const relax = Math.exp(-3.2 * dt);
    s.controlX *= relax;
    s.controlY *= relax;

    // render
    const w = s.w,
      h = s.h,
      dpr = s.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    drawFiringRangeBG(ctx, s);
    drawTarget(ctx, s);

    // marks
    const fadeMs = 9000;
    const tNow = nowMs();
    for (const m of s.marks) {
      const age = tNow - m.t;
      const a = clamp(1 - age / fadeMs, 0, 1);
      if (a <= 0) continue;
      ctx.globalAlpha = 0.12 + a * 0.55;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawGunOverlay(ctx, s, dt);

    // crosshair
    const aimX = s.px + s.controlX + s.recoilX;
    const aimY = s.py + s.controlY + s.recoilY;

    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(aimX - 14, aimY);
    ctx.lineTo(aimX - 4, aimY);
    ctx.moveTo(aimX + 4, aimY);
    ctx.lineTo(aimX + 14, aimY);
    ctx.moveTo(aimX, aimY - 14);
    ctx.lineTo(aimX, aimY - 4);
    ctx.moveTo(aimX, aimY + 4);
    ctx.lineTo(aimX, aimY + 14);
    ctx.stroke();

    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(aimX, aimY, 2, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.globalAlpha = 1;

    // top-left status
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "white";
    ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText(s.locked ? "LOCKED · ESC to release" : "CLICK to lock", 16, 24);
    ctx.fillText(s.firing ? `FIRING · RPM ${s.rpm}` : "HOLD LMB to FIRE", 16, 44);
    ctx.globalAlpha = 1;

    pushUI();
    rafRef.current = requestAnimationFrame(step);
  }

  useEffect(() => {
    resizeCanvas();
    resetStatsOnly();

    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);

    const onLockChange = () => {
      const s = stateRef.current;
      const canvas = canvasRef.current;
      s.locked = !!canvas && document.pointerLockElement === canvas;

      // 락 풀리면 발사도 끊기
      if (!s.locked) {
        s.firing = false;
        s.pointerDown = false;
        s.shotCD = 0;
      }
      pushUI(true);
    };

    document.addEventListener("pointerlockchange", onLockChange);

    rafRef.current = requestAnimationFrame(step);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("pointerlockchange", onLockChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">리코일 레인지 (FPS 모드)</h1>
          <p className="mt-1 text-sm text-white/70">
            클릭하면 포인터락(커서 숨김) · 좌클릭 연사 · 마우스를 아래로 내려 반동 제어 · ESC로 해제
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => resetStatsOnly()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            리셋
          </button>
        </div>
      </div>

      {/* HUD */}
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="text-xs text-white/60">Shots</div>
          <div className="text-lg font-bold">{ui.shots}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="text-xs text-white/60">Score</div>
          <div className="text-lg font-bold">{ui.score}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="text-xs text-white/60">Best</div>
          <div className="text-lg font-bold">{ui.best}</div>
        </div>
        <div className="flex-1 min-w-[260px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="text-xs text-white/60">Hint</div>
          <div className="text-sm font-semibold">{ui.hint}</div>
          <div className="mt-1 text-xs text-white/60">
            상태: <b>{ui.locked ? "LOCKED" : "UNLOCKED"}</b> · 커서는 숨김 · 클릭으로 락 · ESC로 해제 · 소리는 첫 클릭 이후 활성
          </div>
        </div>
      </div>

      {/* Game */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4">
        <div
          ref={wrapRef}
          className="relative w-full h-[520px] sm:h-[560px] rounded-2xl overflow-hidden"
          style={{ touchAction: "none", userSelect: "none", cursor: "none" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={(e) => {
              e.preventDefault();
              const s = stateRef.current;
              unlockAudioOnce();

              const canvas = e.currentTarget as HTMLCanvasElement;
              if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock?.();
              }

              s.pointerDown = true;
              s.firing = true;

              // ✅ 탭해도 1발은 무조건
              addShot();

              // ✅ 다음 발까지 쿨다운 시작(동시에 2발 방지)
              s.shotCD = 60 / s.rpm;
            }}
            onPointerMove={(e) => {
              const s = stateRef.current;

              // pointer lock이면 movementX/Y 사용
              const dx = (e as any).movementX ?? 0;
              const dy = (e as any).movementY ?? 0;

              const aimSens = 1.0;
              s.px = clamp(s.px + dx * aimSens, 0, s.w);
              s.py = clamp(s.py + dy * aimSens, 0, s.h);

              if (!s.pointerDown) return;

              // recoil control
              const controlSens = 1.15;
              s.controlX = clamp(s.controlX + dx * controlSens * 0.25, -140, 140);
              s.controlY = clamp(s.controlY + dy * controlSens, -220, 220);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              const s = stateRef.current;
              s.pointerDown = false;
              s.firing = false;
              s.shotCD = 0;
            }}
            onPointerCancel={() => {
              const s = stateRef.current;
              s.pointerDown = false;
              s.firing = false;
              s.shotCD = 0;
            }}
          />
        </div>
      </div>
    </div>
  );
}
