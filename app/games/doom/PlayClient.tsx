"use client";

import { useEffect, useRef } from "react";
import { startStage1 } from "./stages/stage1/index";

export default function PlayClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hintEl = hintRef.current;
    if (!canvas || !hintEl) return;

    const stop = startStage1(canvas, hintEl);
    return () => stop();
  }, []);

  return (
    <div
      style={{
        margin: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#070a12",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        style={{
          display: "block",
          width: "100%",
          height: "100%",           
          outline: "none",
        }}
      />

      {/* HUD */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          zIndex: 50,
          color: "#cbd5e1",
          font: "13px/1.25 system-ui",
          background: "rgba(0,0,0,.35)",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.08)",
          userSelect: "none",
          backdropFilter: "blur(8px)",
          maxWidth: "min(560px,calc(100% - 24px))",
        }}
      >
        <div>
          <b style={{ color: "#fff" }}>WASD</b> 이동 ·{" "}
          <b style={{ color: "#fff" }}>Shift</b> 달리기 ·{" "}
          <b style={{ color: "#fff" }}>마우스</b> 시점(상하 포함) ·{" "}
          <b style={{ color: "#fff" }}>좌클릭</b> 발사
        </div>

        <div>화면 클릭 → 포인터락(마우스 시점) / ESC → 해제</div>
        <div style={{ opacity: 0.85, marginTop: 6 }}>
          Stage1: 도시 · 총알은 항상 크로스헤어로
        </div>
        <div style={{ opacity: 0.9, marginTop: 6 }}>
          HP: <b style={{ color: "#fff" }} id="doom-hp">100</b>
        </div>
      </div>

      {/* Hint */}
      <div
        ref={hintRef}
        style={{
          position: "absolute",      // ✅ fixed 금지
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 50,
          color: "#e5e7eb",
          font: "14px/1.4 system-ui",
          background: "rgba(0,0,0,.55)",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,.10)",
          textAlign: "center",
          userSelect: "none",
          pointerEvents: "none",     // ✅ 클릭은 캔버스로
        }}
      >
        화면을 클릭하면 마우스로 시점을 움직일 수 있어.
        <small style={{ display: "block", color: "rgba(255,255,255,.75)", marginTop: 6 }}>
          클릭: 포인터락 + 포커스 · 좌클릭: 발사 · ESC: 해제
        </small>
      </div>
    </div>
  );
}
