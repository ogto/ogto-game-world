import type { WorldState } from "../types";
import { roundRect, roundRectStroke, starBurst } from "../utils/draw";

export function drawGunGlock(s: WorldState, now: number) {
  const ctx = s.ctx;
  const w = innerWidth;
  const h = innerHeight;

  const k = s.keys;

  const moving = (k["KeyW"] || k["KeyA"] || k["KeyS"] || k["KeyD"]) ? 1 : 0;
  const run = k["Shift"] ? 1 : 0;
  const bobAmp = moving ? (run ? 8 : 6) : 3;

  const swayX = Math.sin(now * 0.009) * bobAmp;
  const swayY = Math.sin(now * 0.012) * (bobAmp * 0.75);

  const kickBack = s.weapon.firingFrame ? 6 : 0;
  const recoilY = s.weapon.recoil;

  const baseX = w * 0.62 + swayX - kickBack;
  const baseY = h * 0.62 + swayY + recoilY;

  // ✅ 총구(트레이서 시작점)
  s.muzzle.x = baseX + 28;
  s.muzzle.y = baseY + 42;

  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(-0.06);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const cSlide   = "#2b2f36";
  const cFrame   = "#1f232a";
  const cAccent  = "#3a404a";
  const cDark    = "#14181f";
  const cGrip    = "#181c22";
  const cOutline = "rgba(0,0,0,0.85)";
  const cHand    = "#3b2a20";

  // hand
  ctx.save();
  ctx.translate(35, 55);
  ctx.fillStyle = cHand;
  roundRect(ctx, -10, 10, 95, 88, 18); ctx.fill();
  ctx.fillStyle = "#2f221a";
  roundRect(ctx, 50, 22, 55, 30, 14); ctx.fill();
  ctx.restore();

  // slide
  ctx.save();
  ctx.fillStyle = cSlide;
  const slideX=40, slideY=20, slideW=230, slideH=46;
  roundRect(ctx, slideX, slideY, slideW, slideH, 10); ctx.fill();

  ctx.fillStyle = cAccent;
  roundRect(ctx, slideX+8, slideY+6, slideW-16, 12, 8); ctx.fill();

  ctx.fillStyle = cDark;
  roundRect(ctx, slideX+120, slideY+12, 55, 16, 6); ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  for(let i=0;i<7;i++){ const sx=slideX+26+i*8; ctx.beginPath(); ctx.moveTo(sx, slideY+14); ctx.lineTo(sx, slideY+40); ctx.stroke(); }
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  for(let i=0;i<6;i++){ const sx=slideX+slideW-55+i*7; ctx.beginPath(); ctx.moveTo(sx, slideY+14); ctx.lineTo(sx, slideY+40); ctx.stroke(); }

  ctx.fillStyle="#101319"; roundRect(ctx, slideX+18, slideY-6, 18, 10, 3); ctx.fill();
  ctx.fillStyle="#0f1217"; roundRect(ctx, slideX+slideW-38, slideY-7, 26, 12, 3); ctx.fill();
  ctx.fillStyle="#0f1217"; roundRect(ctx, slideX-12, slideY+16, 24, 14, 6); ctx.fill();
  ctx.restore();

  // frame
  ctx.save();
  ctx.fillStyle = cFrame;
  roundRect(ctx, 55, 56, 205, 34, 10); ctx.fill();

  ctx.fillStyle = cDark;
  roundRect(ctx, 60, 84, 70, 10, 4); ctx.fill();

  ctx.strokeStyle="rgba(0,0,0,0.75)";
  ctx.lineWidth=6;
  roundRectStroke(ctx, 112, 82, 76, 56, 18);

  ctx.strokeStyle="rgba(255,255,255,0.10)";
  ctx.lineWidth=2;
  roundRectStroke(ctx, 120, 90, 60, 40, 14);

  ctx.fillStyle="#12161c"; roundRect(ctx, 150, 104, 18, 28, 8); ctx.fill();

  ctx.fillStyle=cGrip;
  ctx.beginPath();
  ctx.moveTo(118,126); ctx.lineTo(180,126); ctx.lineTo(156,232); ctx.lineTo(98,232);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle="rgba(255,255,255,0.09)";
  ctx.lineWidth=2;
  for(let i=0;i<10;i++){
    const y=146+i*8;
    ctx.beginPath();
    ctx.moveTo(106,y);
    ctx.lineTo(168,y-10);
    ctx.stroke();
  }

  ctx.fillStyle="#151922"; roundRect(ctx, 120, 210, 52, 68, 10); ctx.fill();
  ctx.fillStyle="#0e1117"; roundRect(ctx, 124, 260, 44, 12, 6); ctx.fill();

  ctx.fillStyle="rgba(255,255,255,0.10)";
  roundRect(ctx, 200, 70, 16, 6, 3); ctx.fill();
  roundRect(ctx, 92, 74, 10, 10, 5); ctx.fill();
  ctx.restore();

  // outline
  ctx.save();
  ctx.strokeStyle = cOutline;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(28, 26);
  ctx.lineTo(280, 26);
  ctx.quadraticCurveTo(292, 28, 292, 40);
  ctx.lineTo(292, 62);
  ctx.quadraticCurveTo(292, 70, 284, 70);
  ctx.lineTo(240, 70);
  ctx.lineTo(240, 98);
  ctx.quadraticCurveTo(238, 108, 228, 108);
  ctx.lineTo(202, 108);
  ctx.lineTo(202, 126);
  ctx.lineTo(178, 126);
  ctx.lineTo(154, 236);
  ctx.lineTo(100, 236);
  ctx.lineTo(120, 278);
  ctx.lineTo(176, 278);
  ctx.lineTo(176, 210);
  ctx.lineTo(182, 126);
  ctx.lineTo(112, 126);
  ctx.quadraticCurveTo(92, 124, 92, 110);
  ctx.lineTo(92, 92);
  ctx.quadraticCurveTo(92, 76, 110, 70);
  ctx.lineTo(58, 70);
  ctx.quadraticCurveTo(42, 70, 38, 56);
  ctx.lineTo(38, 40);
  ctx.quadraticCurveTo(38, 28, 28, 26);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // muzzle flash
  if (s.weapon.firingFrame) {
    ctx.save();
    ctx.translate(28, 42);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(255,240,200,0.95)";
    starBurst(ctx, 0, 0, 14, 36, 10); ctx.fill();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "rgba(255,180,90,0.75)";
    starBurst(ctx, 0, 0, 8, 22, 8); ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}
