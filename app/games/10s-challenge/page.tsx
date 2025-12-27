import type { Metadata } from "next";
import GameClient from "./GameClient";

export const metadata: Metadata = {
  title: "10초 챌린지 | ogto game world",
  description: "10초 동안 최대한 많이 맞춰라. 반응속도 미니게임!",
  alternates: { canonical: "/games/10s-challenge" },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            10초 챌린지
          </h1>
          <p className="mt-2 text-sm text-white/70">
            제한 시간 10초. 화면에 뜨는 타겟을 최대한 많이 클릭/탭하세요.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <GameClient />
      </div>

      <div className="mt-6 text-xs text-white/50 leading-relaxed">
        팁: 모바일은 한 손으로 탭만 하면 됩니다. 최고기록은 이 브라우저에 저장돼요.
      </div>
    </main>
  );
}
