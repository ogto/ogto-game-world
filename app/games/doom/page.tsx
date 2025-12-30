import type { Metadata } from "next";
import PlayClient from "./PlayClient";

export const metadata: Metadata = {
  title: {
    default: "DOOM FPS (개발중) | ogto 게임세상",
    template: "%s | ogto 게임세상",
  },
  description:
    "레이캐스팅 기반 1인칭 FPS 프로토타입. WASD 이동, 포인터락 조준, 사격, 랜덤 적 스폰까지 구현 중인 DOOM 스타일 웹 FPS 게임.",
  keywords: [
    "DOOM FPS",
    "둠 FPS",
    "웹 FPS",
    "브라우저 FPS",
    "레이캐스트 FPS",
    "포인터락 게임",
    "1인칭 슈팅 게임",
    "웹 게임 개발",
    "FPS 프로토타입",
    "자바스크립트 FPS",
    "HTML5 캔버스 게임",
    "ogto 게임세상",
    "개발중 게임",
  ],
  alternates: {
    canonical: "/games/doom",
  },
  robots: {
    index: true,          // 🔹 개발중이지만 색인 허용
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
    url: "/games/doom",
    title: "DOOM FPS (개발중) | ogto 게임세상",
    description:
      "DOOM 스타일 레이캐스팅 기반 1인칭 FPS 프로토타입. 이동/사격/적 스폰이 구현된 웹 FPS 게임.",
    siteName: "ogto 게임세상",
    images: [
      {
        url: "/thumbs/doom.png", // 준비 안 됐으면 recoil.png 임시 사용해도 됨
        width: 1200,
        height: 630,
        alt: "DOOM FPS - 웹 FPS 프로토타입 (개발중)",
      },
    ],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOOM FPS (개발중) | ogto 게임세상",
    description:
      "레이캐스팅 기반 DOOM 스타일 웹 FPS. 포인터락 조준과 랜덤 적 스폰 구현 중.",
    images: ["/thumbs/doom.png"],
  },
  category: "game",
  other: {
    "application-name": "ogto 게임세상",
    "apple-mobile-web-app-title": "ogto 게임세상",
  },
};

export default function DoomPage() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <PlayClient />
    </main>
  );
}
