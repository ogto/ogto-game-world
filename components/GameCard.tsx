"use client";

import Link from "next/link";

export type Game = {
  title: string;
  desc: string;
  href: string;
  introHref?: string;
  thumb: string;
  status?: "LIVE" | "BETA" | "SOON";
  tags: string[];
  controls: { label: string; value: string }[];
};

function StatusBadge({ status }: { status?: Game["status"] }) {
  const label =
    status === "LIVE" ? "LIVE" : status === "BETA" ? "BETA" : "SOON";

  const styles =
    status === "LIVE"
      ? "border-[#D6FF00]/30 bg-[#D6FF00]/10"
      : status === "BETA"
      ? "border-white/15 bg-white/5"
      : "border-white/10 bg-white/5";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs text-white/80 ${styles}`}
    >
      {label}
    </span>
  );
}

export default function GameCard({ game }: { game: Game }) {
  const isSoon = game.status === "SOON";
  const canPlay = !isSoon && game.href && game.href !== "#";

  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl overflow-hidden">
      {/* 썸네일 */}
      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-black/30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(214,255,0,0.18), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08), transparent 50%)",
          }}
        />

        <img
          src={game.thumb}
          alt={`${game.title} thumbnail`}
          className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <StatusBadge status={game.status} />
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex flex-wrap gap-2">
            {game.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-white/80 backdrop-blur"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 내용 */}
      <div className="p-5">
        <div>
          <h3 className="text-lg font-extrabold">{game.title}</h3>
          <p className="mt-1 text-sm text-white/70">{game.desc}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {game.controls.slice(0, 4).map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2"
            >
              <div className="text-[11px] text-white/60">{c.label}</div>
              <div className="mt-1 text-sm font-semibold">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            href={canPlay ? game.href : "#"}
            aria-disabled={!canPlay}
            className={[
              "flex-1 rounded-2xl px-4 py-3 text-center text-sm font-semibold transition",
              canPlay
                ? "bg-[#D6FF00] text-black hover:brightness-95"
                : "bg-white/10 text-white/40 cursor-not-allowed",
            ].join(" ")}
          >
            {canPlay ? "플레이" : "준비중"}
          </Link>
        </div>

        <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#D6FF00]/30 to-transparent" />
      </div>
    </div>
  );
}
