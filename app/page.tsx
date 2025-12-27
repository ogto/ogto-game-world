// app/page.tsx
import Link from "next/link";
import Header from "@/components/Header";
import GameCard, { type Game } from "../components/GameCard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ogto 게임세상",
  description:
    "ogto 게임세상은 설치 없이 바로 즐길 수 있는 무료 웹게임 모음 사이트입니다.",
  alternates: {
    canonical: "/",
  },
};

const games: Game[] = [
  {
    title: "Dodge Jump",
    desc: "점프/대시로 공을 피하며 오래 버티는 반사신경 미니게임",
    href: "/games/dodge-jump/intro",
    thumb: "/thumbs/dodge.png",
    status: "LIVE",
    tags: ["키보드", "반사신경", "미니게임"],
    controls: [
      { label: "이동", value: "← →" },
      { label: "점프", value: "Space" },
      { label: "대시", value: "Shift" },
      { label: "재시작", value: "Enter" },
    ],
  },
  {
    title: "10초 챌린지",
    desc: "체감 10초를 정확히 맞추는 집중력 & 감각 테스트",
    href: "/games/10s-challenge",
    thumb: "/thumbs/10s-chal.png",
    status: "LIVE",
    tags: ["집중력", "타이밍", "원버튼"],
    controls: [
      { label: "시작/정지", value: "클릭" },
    ],
  },
  {
    title: "리코일 레인지 (FPS)",
    desc: "1인칭 시점에서 연사 반동을 제어하는 FPS 리코일 연습 게임",
    href: "/games/recoil-range",
    thumb: "/thumbs/recoil.png",
    status: "LIVE",
    tags: ["FPS", "반동연습", "마우스", "사격"],
    controls: [
      { label: "조준 모드", value: "클릭 (포인터락)" },
      { label: "사격", value: "좌클릭(누르고 연사)" },
      { label: "반동 제어", value: "마우스 ↓" },
      { label: "조준 해제", value: "ESC" },
    ],
  },

  // {
  //   title: "곧 추가될 게임",
  //   desc: "클릭 스피드, 리액션 테스트, 원버튼 게임 등",
  //   href: "#",
  //   thumb: "/thumbs/soon.png",
  //   status: "SOON",
  //   tags: ["준비중"],
  //   controls: [
  //     { label: "상태", value: "제작중" },
  //     { label: "출시", value: "Soon" },
  //   ],
  // },
];


export default function HomePage() {
  return (
    <>
    <main className="min-h-screen">
      {/* 배경 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-black to-black" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#D6FF00]/10 blur-3xl" />
        <div className="absolute top-24 -right-32 h-[520px] w-[520px] rounded-full bg-[#D6FF00]/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[#D6FF00]/6 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* 상단 헤더 */}
        <Header />

        {/* 검색 UI(동작은 나중에) */}
        <section className="mt-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="text-xs text-white/60">Search</div>
                <input
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[#D6FF00]/50 focus:ring-2 focus:ring-[#D6FF00]/20"
                  placeholder="게임 이름, 태그로 검색 (예: 반사신경, 클릭)"
                />
              </div>

              <div className="flex gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <div className="text-xs text-white/60">Sort</div>
                  <div className="mt-1 text-sm font-semibold">최신순</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <div className="text-xs text-white/60">Status</div>
                  <div className="mt-1 text-sm font-semibold">전체</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-xs text-white/60">About</div>
                <div className="mt-1 text-white/80">
                  가벼운 게임을 빠르게 만들어 올립니다.
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D6FF00]/30 bg-[#D6FF00]/10 px-3 py-1 text-xs text-white/80">
                <span className="h-2 w-2 rounded-full bg-[#D6FF00]" />
                Neon Yellow
              </span>
            </div>
          </div>
        </section>
        {/* 배너 광고 */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-[#D6FF00]/40 bg-[#D6FF00]/10 backdrop-blur p-6">
            {/* 글로우 효과 */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#D6FF00]/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#D6FF00]/20 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-black/60">
                  Advertisement
                </div>
                <div className="mt-1 text-lg sm:text-xl font-extrabold text-black">
                  광고 문의
                </div>
                <div className="mt-1 text-base sm:text-lg font-semibold text-black">
                  010-3992-6664
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-[#D6FF00]">
                  배너 광고 가능
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 게임 목록 */}
        <section id="games" className="mt-12">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">게임 목록</h2>
            </div>
            <div className="text-sm text-white/50">
              현재{" "}
              <span className="text-[#D6FF00] font-semibold">
                {games.length}
              </span>
              개
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <GameCard key={g.title} game={g} />
            ))}
          </div>
        </section>

        {/* 문의 */}
        <section id="contact" className="mt-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold">
                  게임 콜라보 / 커스텀 제작
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  브랜드 이벤트/프로모션용 미니게임 커스텀도 가능. (스킨/로고/점수판 등)
                </p>
              </div>
              <Link
                href="mailto:hello@ogto.games"
                className="rounded-2xl bg-[#D6FF00] px-5 py-3 text-sm font-semibold text-black hover:brightness-95 transition"
              >
                문의하기
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-12 pb-10 text-center text-sm text-white/50">
          만든 사람 ogto ·
        </footer>
      </div>
    </main>
    </>
  );
}
