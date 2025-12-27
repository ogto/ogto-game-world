import type { Metadata } from "next";
import GameClient from "./GameClient";

export const metadata: Metadata = {
  title: {
    default: "10초 챌린지 | ogto 게임세상",
    template: "%s | ogto 게임세상",
  },
  description:
    "체감 10초를 정확히 맞추는 집중력 테스트 미니게임. 클릭 한 번으로 반응속도와 시간 감각을 훈련해보세요.",
  keywords: [
    "10초 챌린지",
    "10초 게임",
    "집중력 테스트",
    "반응속도 테스트",
    "타이밍 게임",
    "시간 감각 테스트",
    "클릭 게임",
    "원버튼 게임",
    "미니게임",
    "웹 게임",
    "브라우저 게임",
    "ogto 게임세상",
  ],
  alternates: {
    canonical: "/games/10s-challenge",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/games/10s-challenge",
    title: "10초 챌린지 | ogto 게임세상",
    description:
      "체감 10초를 정확히 맞추는 집중력 & 타이밍 테스트. 모바일·PC 모두 가능한 원버튼 미니게임.",
    siteName: "ogto 게임세상",
    images: [
      {
        url: "/thumbs/10s-chal.png",
        width: 1200,
        height: 630,
        alt: "10초 챌린지 - 집중력 테스트 미니게임",
      },
    ],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "10초 챌린지 | ogto 게임세상",
    description:
      "클릭 한 번으로 즐기는 10초 집중력 챌린지. 시간 감각을 테스트해보세요.",
    images: ["/thumbs/10s-chal.png"],
  },
  category: "game",
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
