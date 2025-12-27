"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const DURATION_MS = 10_000;
const BEST_KEY = "ogto_10s_best_v4";

// 게임 밸런스
const FAKE_RATE = 0.22;
const MISS_PENALTY = 1;
const FAKE_PENALTY = 2;
const FAKE_TTL_MS = 720; // 가짜는 안 누르면 자동으로 넘어감(패널티 없음)

// 콤보/배수
const COMBO_WINDOW_MS = 2000;
const COMBO_DECAY_MS = 3000;
const MULT_STEP = 5;
const MULT_MAX = 4;

type Phase = "ready" | "countdown" | "playing" | "ended";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function readBest(): number {
  if (typeof window === "undefined") return 0;
  const n = Number(localStorage.getItem(BEST_KEY) ?? "0");
  return Number.isFinite(n) ? n : 0;
}
function writeBest(v: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BEST_KEY, String(v));
}

type Pop = { id: number; x: number; y: number; text: string; mult: number };
type Ripple = { id: number; x: number; y: number };
type Shatter = { id: number; x: number; y: number; fake: boolean };

export default function GameClient() {
  const boardRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeftMs, setTimeLeftMs] = useState(DURATION_MS);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const [comboUI, setComboUI] = useState(0);
  const [multUI, setMultUI] = useState(1);

  const [count, setCount] = useState<3 | 2 | 1 | 0>(3);

  const [pops, setPops] = useState<Pop[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [shatters, setShatters] = useState<Shatter[]>([]);
  const [banner, setBanner] = useState<string | null>(null);

  const [shake, setShake] = useState(false);

  // Target
  const [targetKey, setTargetKey] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 }); // %
  const [targetSize, setTargetSize] = useState(76); // px
  const [isFake, setIsFake] = useState(false);

  // refs for correctness
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const lastHitAtRef = useRef(0);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const multRef = useRef(1);

  const popIdRef = useRef(1);
  const rippleIdRef = useRef(1);
  const shatterIdRef = useRef(1);

  const missLockRef = useRef(false);
  const countdownTokenRef = useRef(0);
  const fakeTtlTimerRef = useRef<number | null>(null);

  const phaseRef = useRef<Phase>("ready");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const timeLeftSec = useMemo(() => Math.ceil(timeLeftMs / 1000), [timeLeftMs]);

  // 고조(배경/타겟 반응)
  const hype = useMemo(() => clamp((comboUI * 0.07 + (multUI - 1) * 0.25), 0, 1), [comboUI, multUI]);

  useEffect(() => {
    setBest(readBest());
  }, []);

  // ---------- helpers ----------
  function stopLoop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
  function clearFakeTTL() {
    if (fakeTtlTimerRef.current != null) {
      window.clearTimeout(fakeTtlTimerRef.current);
      fakeTtlTimerRef.current = null;
    }
  }
  function kickShake() {
    setShake(true);
    window.setTimeout(() => setShake(false), 90);
  }
  function flashBanner(text: string, ms = 240) {
    setBanner(text);
    window.setTimeout(() => setBanner(null), ms);
  }

  function syncUIFromRefs() {
    setScore(scoreRef.current);
    setComboUI(comboRef.current);
    setMultUI(multRef.current);
  }

  function computeTargetSize() {
    const board = boardRef.current;
    if (!board) return 76;
    const rect = board.getBoundingClientRect();
    const base = Math.min(rect.width, rect.height);
    return clamp(Math.round(base * 0.14), 56, 92);
  }

  function addRippleAt(clientX: number, clientY: number) {
    const board = boardRef.current;
    if (!board) return;
    const r = board.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;

    const id = rippleIdRef.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((a) => a.id !== id));
    }, 420);
  }

  function addPopAt(clientX: number, clientY: number, text: string, mult: number) {
    const board = boardRef.current;
    if (!board) return;
    const r = board.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;

    const id = popIdRef.current++;
    setPops((prev) => [...prev, { id, x, y, text, mult }]);
    window.setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== id));
    }, 520);
  }

  function addShatterAt(clientX: number, clientY: number, fake: boolean) {
    const board = boardRef.current;
    if (!board) return;
    const r = board.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;

    const id = shatterIdRef.current++;
    setShatters((prev) => [...prev, { id, x, y, fake }]);
    window.setTimeout(() => {
      setShatters((prev) => prev.filter((s) => s.id !== id));
    }, 520);
  }

  function spawnTarget(forceFake?: boolean) {
    const board = boardRef.current;
    if (!board) return;

    clearFakeTTL();

    const size = computeTargetSize();
    setTargetSize(size);

    const padPct = 12;
    const x = randInt(padPct, 100 - padPct);
    const y = randInt(padPct, 100 - padPct);

    setTargetPos({ x, y });
    setTargetKey((k) => k + 1);

    const fake = typeof forceFake === "boolean" ? forceFake : Math.random() < FAKE_RATE;
    setIsFake(fake);

    // ✅ 가짜는 안 누르면 자동으로 넘어감
    if (fake) {
      fakeTtlTimerRef.current = window.setTimeout(() => {
        if (phaseRef.current === "playing") spawnTarget(false);
      }, FAKE_TTL_MS) as unknown as number;
    }
  }

  function applyPenalty(p: number, clientX: number, clientY: number, label: string) {
    addRippleAt(clientX, clientY);
    addPopAt(clientX, clientY, label, 1);
    kickShake();

    if (label.startsWith("FAKE")) flashBanner("FAKE!", 260);
    else flashBanner("MISS", 220);

    scoreRef.current = Math.max(0, scoreRef.current - p);
    comboRef.current = 0;
    multRef.current = 1;
    syncUIFromRefs();
  }

  // ---------- loop ----------
  function endGame() {
    stopLoop();
    clearFakeTTL();
    setPhase("ended");
    setTimeLeftMs(0);

    const finalScore = scoreRef.current;
    setBest((prev) => {
      const next = Math.max(prev, finalScore);
      writeBest(next);
      return next;
    });
  }

  function loop() {
    const now = performance.now();
    const elapsed = now - startedAtRef.current;
    const left = Math.max(0, DURATION_MS - elapsed);

    setTimeLeftMs(left);

    // 콤보 자연 소멸
    if (comboRef.current > 0 && now - lastHitAtRef.current > COMBO_DECAY_MS) {
      comboRef.current = 0;
      multRef.current = 1;
      syncUIFromRefs();
    }

    if (left <= 0) {
      endGame();
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  async function startCountdown() {
    const token = ++countdownTokenRef.current;

    stopLoop();
    clearFakeTTL();

    scoreRef.current = 0;
    comboRef.current = 0;
    multRef.current = 1;
    syncUIFromRefs();

    setPops([]);
    setRipples([]);
    setShatters([]);
    setBanner(null);

    setTimeLeftMs(DURATION_MS);
    setCount(3);
    setPhase("countdown");

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    await sleep(420);
    if (countdownTokenRef.current !== token) return;
    setCount(2);

    await sleep(420);
    if (countdownTokenRef.current !== token) return;
    setCount(1);

    await sleep(420);
    if (countdownTokenRef.current !== token) return;
    setCount(0);

    await sleep(180);
    if (countdownTokenRef.current !== token) return;

    lastHitAtRef.current = performance.now();
    startedAtRef.current = performance.now();
    setPhase("playing");

    spawnTarget();
    rafRef.current = requestAnimationFrame(loop);
  }

  function reset() {
    countdownTokenRef.current++;
    stopLoop();
    clearFakeTTL();

    setPhase("ready");
    setTimeLeftMs(DURATION_MS);
    setCount(3);
    setBanner(null);

    scoreRef.current = 0;
    comboRef.current = 0;
    multRef.current = 1;
    syncUIFromRefs();

    setPops([]);
    setRipples([]);
    setShatters([]);

    setIsFake(false);
    setTargetPos({ x: 50, y: 50 });
    setTargetKey((k) => k + 1);
  }

  // ---------- input ----------
  function onBoardPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== "playing") return;

    const el = e.target as HTMLElement;
    if (el.closest('[data-role="target"]')) return;

    if (missLockRef.current) return;
    missLockRef.current = true;
    window.setTimeout(() => (missLockRef.current = false), 120);

    applyPenalty(MISS_PENALTY, e.clientX, e.clientY, `-${MISS_PENALTY}`);
  }

  function onTargetPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (phaseRef.current !== "playing") return;

    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);

    const now = performance.now();

    // 가짜
    if (isFake) {
      addShatterAt(e.clientX, e.clientY, true);
      applyPenalty(FAKE_PENALTY, e.clientX, e.clientY, `FAKE -${FAKE_PENALTY}`);
      spawnTarget(false);
      return;
    }

    // 진짜
    addRippleAt(e.clientX, e.clientY);
    kickShake();

    const dt = now - lastHitAtRef.current;
    lastHitAtRef.current = now;

    const nextCombo = dt <= COMBO_WINDOW_MS ? comboRef.current + 1 : 1;
    comboRef.current = nextCombo;

    const nextMult = clamp(1 + Math.floor(nextCombo / MULT_STEP), 1, MULT_MAX);

    // ✅ 배수 체감: 배수 바뀌는 순간 배너로 때려줌
    if (nextMult !== multRef.current) {
      flashBanner(`x${nextMult}!`, 260);
      // 배수 오를 때 살짝 더 강한 흔들림
      kickShake();
    }

    multRef.current = nextMult;

    scoreRef.current = scoreRef.current + nextMult;

    // ✅ 배수 체감: 팝업도 배수에 따라 크게 (+4는 확실히 큼)
    addPopAt(e.clientX, e.clientY, `+${nextMult}`, nextMult);

    syncUIFromRefs();

    spawnTarget();
  }

  // resize 재배치
  useEffect(() => {
    const onResize = () => {
      if (phaseRef.current === "playing") spawnTarget(isFake);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFake]);

  const ctaLabel =
    phase === "ended" ? "다시 도전" : phase === "ready" ? "시작하기" : "진행중";

  // ✅ 타겟이 배수에 따라 살짝 커지고(체감), 링이 강해짐
  const targetScale = 1 + (multUI - 1) * 0.06; // 너무 과하면 0.05로
  const ringGlow = 0.18 + 0.10 * hype; // 콤보/배수 고조에 따라 글로우 증가

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur p-4 sm:p-6">
      {/* 상단 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
            <span className="text-sm font-extrabold">10s</span>
          </div>
          <div>
            <div className="text-sm text-white/60">Reflex Challenge</div>
            <div className="text-lg font-extrabold tracking-tight">10초 챌린지</div>
          </div>
        </div>
      </div>

      {/* HUD */}
      <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs text-white/60">
              Time <span className="ml-1 text-white font-extrabold">{timeLeftSec}s</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-xs text-white/60">
              Score{" "}
              <span className="ml-1 text-white font-extrabold text-sm">{score}</span>
              <span className="ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-extrabold text-white/90">
                x{multUI} · combo {comboUI}
              </span>
            </div>
          </div>

          <div className="text-xs text-white/60">
            Best <span className="ml-1 text-white font-extrabold">{best}</span>
          </div>
        </div>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className={[
          "relative mt-4 h-[56vh] min-h-[420px] w-full overflow-hidden rounded-[28px]",
          "border border-white/10",
          "bg-black/35",
          shake ? "animate-[shake_90ms_ease-in-out]" : "",
        ].join(" ")}
        style={{
          touchAction: "manipulation",
          userSelect: "none",
          WebkitUserSelect: "none",
          // ✅ (3) 콤보/배수 고조 배경
          backgroundImage: `
            radial-gradient(80% 60% at 50% 20%, rgba(255,255,255,${0.10 + 0.12 * hype}), rgba(0,0,0,0)),
            radial-gradient(70% 50% at 50% 85%, rgba(255,120,120,${0.00 + 0.12 * hype}), rgba(0,0,0,0))
          `,
          filter: `saturate(${1 + 0.10 * hype})`,
        }}
        onPointerDown={onBoardPointerDown}
      >
        {/* 그리드 */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* 배너(배수/미스/페이크) */}
        {banner && (
          <div
            className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/55 px-4 py-2 text-sm font-extrabold text-white"
            style={{ animation: "banner 240ms ease-out forwards" }}
          >
            {banner}
          </div>
        )}

        {/* 리플 */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25"
            style={{
              left: r.x,
              top: r.y,
              width: 8,
              height: 8,
              animation: "ripple 420ms ease-out forwards",
            }}
          />
        ))}

        {/* 팝 */}
        {pops.map((p) => (
          <span
            key={p.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-extrabold text-white"
            style={{
              left: p.x,
              top: p.y,
              textShadow: "0 6px 18px rgba(0,0,0,0.45)",
              // ✅ 배수 체감: 배수에 따라 팝 글자 크기/튀는 정도
              fontSize: 12 + p.mult * 7,
              animation: `pop 520ms ease-out forwards`,
            }}
          >
            {p.text}
          </span>
        ))}

        {/* (1) Shatter */}
        {shatters.map((s) => (
          <div
            key={s.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: s.x, top: s.y }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="absolute block rounded-sm"
                style={{
                  width: randInt(4, 9),
                  height: randInt(2, 5),
                  background: s.fake ? "rgba(255,170,170,0.95)" : "rgba(255,255,255,0.95)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                  transform: "translate(-50%, -50%)",
                  animation: `shard 520ms ease-out forwards`,
                  ["--dx" as any]: `${randInt(-80, 80)}px`,
                  ["--dy" as any]: `${randInt(-90, 70)}px`,
                  ["--rot" as any]: `${randInt(-220, 220)}deg`,
                }}
              />
            ))}
          </div>
        ))}

        {/* 오버레이 */}
        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center px-6">
            <div className="w-full max-w-md rounded-[28px] border border-white/12 bg-black/45 backdrop-blur p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
              <div className="text-xs text-white/60">ogto game world</div>

              {phase === "countdown" ? (
                <div className="mt-3">
                  <div className="text-sm text-white/70">준비</div>
                  <div className="mt-2 text-6xl font-extrabold tracking-tight">
                    {count === 0 ? "GO" : count}
                  </div>
                  <div className="mt-3 text-xs text-white/60">타겟을 빠르게 클릭/탭하세요</div>
                </div>
              ) : phase === "ended" ? (
                <div className="mt-3">
                  <div className="text-2xl font-extrabold">끝!</div>
                  <div className="mt-2 text-sm text-white/70">
                    점수 <span className="font-extrabold text-white">{score}</span>
                    <span className="mx-2 text-white/30">·</span>
                    최고 <span className="font-extrabold text-white">{best}</span>
                  </div>

                  <div className="mt-4 grid grid-cols gap">
                    <button
                      onClick={startCountdown}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black hover:opacity-90 active:opacity-80"
                    >
                      다시 도전
                    </button>
                  </div>

                  <div className="mt-4 text-[11px] text-white/45"></div>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="text-2xl font-extrabold">10초 동안 최대한 많이!</div>
                  <div className="mt-2 text-sm text-white/70 leading-relaxed">
                    빈 공간 <b>-{MISS_PENALTY}</b>, 가짜 <b>-{FAKE_PENALTY}</b>.
                    <br />
                    콤보가 쌓이면 배수가 올라가서 <b>+2/+3/+4</b>가 됩니다.
                    <br />
                    가짜는 <b>안 누르면</b> 자동으로 넘어가요.
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={startCountdown}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black hover:opacity-90 active:opacity-80"
                    >
                      시작하기
                    </button>
                    <button
                      onClick={() => {
                        alert(
                          `팁\n- ${COMBO_WINDOW_MS}ms 이내 연속 히트하면 콤보\n- ${MULT_STEP}콤보마다 배수 증가(최대 x${MULT_MAX})\n- 가짜는 ${FAKE_TTL_MS}ms 후 자동 전환`
                        );
                      }}
                      className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-extrabold text-white/90 hover:bg-white/10 active:bg-white/15"
                    >
                      플레이 팁
                    </button>
                  </div>

                  <div className="mt-4 text-[11px] text-white/45">기록은 이 브라우저에 저장됩니다.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Target (하나만!) */}
        {phase === "playing" && (
          <button
            data-role="target"
            key={targetKey}
            onPointerDown={onTargetPointerDown}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${targetPos.x}%`,
              top: `${targetPos.y}%`,
              width: targetSize,
              height: targetSize,
              transform: `translate(-50%, -50%) scale(${targetScale})`,
            }}
            aria-label="target"
          >
            {/* 몸통 */}
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: isFake
                  ? "radial-gradient(circle at 30% 30%, rgba(255,210,210,0.98), rgba(255,160,160,0.58) 35%, rgba(255,120,120,0.18) 70%, rgba(255,120,120,0.06))"
                  : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.55) 35%, rgba(255,255,255,0.20) 70%, rgba(255,255,255,0.08))",
                boxShadow: isFake
                  ? `0 18px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,170,170,0.28), 0 0 ${46 + 30 * ringGlow}px rgba(255,120,120,${0.12 + ringGlow})`
                  : `0 18px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.25), 0 0 ${40 + 28 * ringGlow}px rgba(255,255,255,${0.14 + ringGlow})`,
                animation: "breath 1.2s ease-in-out infinite",
              }}
            />

            {/* 링 */}
            <span
              className="absolute inset-[-10px] rounded-full"
              style={{
                border: isFake ? "1px solid rgba(255,160,160,0.14)" : "1px solid rgba(255,255,255,0.12)",
                boxShadow: `0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 ${18 + 34 * ringGlow}px rgba(255,255,255,${0.08 + ringGlow})`,
              }}
            />

            {/* 텍스트 */}
            <span className="absolute inset-0 grid place-items-center font-extrabold text-black/80">
              {isFake ? "X" : "HIT"}
            </span>
          </button>
        )}
      </div>

      <div className="mt-3 text-[11px] text-white/55 flex items-center justify-between flex-wrap gap-2">
        <div>
          콤보 {COMBO_WINDOW_MS}ms · 유지 {COMBO_DECAY_MS}ms · {MULT_STEP}콤보마다 배수(최대 x{MULT_MAX}) · 가짜 자동전환 {FAKE_TTL_MS}ms
        </div>
        <div className="text-white/35">v4</div>
      </div>

      <style jsx global>{`
        @keyframes breath {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.04);
            filter: brightness(1.08);
          }
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }
        @keyframes ripple {
          0% {
            opacity: 0.75;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(18);
          }
        }
        @keyframes pop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(8px) scale(0.98);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-26px) scale(1);
          }
        }
        @keyframes shake {
          0% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(-3px, 1px, 0);
          }
          50% {
            transform: translate3d(2px, -1px, 0);
          }
          75% {
            transform: translate3d(-2px, 0px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes banner {
          0% {
            opacity: 0;
            transform: translate(-50%, -10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0px) scale(1);
          }
        }
        @keyframes shard {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(0px, 0px) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%)
              translate(var(--dx), var(--dy))
              rotate(var(--rot));
          }
        }
      `}</style>
    </section>
  );
}
