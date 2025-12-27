import type { Metadata } from "next";
import RecoilRangeClient from "./RecoilRangeClient";

export const metadata: Metadata = {
  title: {
    default: "리코일 레인지 | ogto 게임세상",
    template: "%s | ogto 게임세상",
  },
  description:
    "배그/발로란트 느낌의 연발 사격 반동을 마우스로 제어하는 FPS 리코일 트레이너. 포인터락(FPS 모드)로 반동 컨트롤을 연습하세요.",
  keywords: [
    "리코일 연습",
    "리코일 트레이너",
    "반동 연습",
    "반동 잡기",
    "배그 리코일",
    "PUBG recoil",
    "발로란트 리코일",
    "FPS 에임 연습",
    "마우스 에임 연습",
    "사격 연습",
    "연사 연습",
    "웹 FPS 게임",
    "브라우저 FPS",
    "포인터락 게임",
    "ogto 게임세상",
  ],
  alternates: {
    canonical: "/games/recoil-range",
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
    url: "/games/recoil-range",
    title: "리코일 레인지 | ogto 게임세상",
    description:
      "배그식 연사 반동을 마우스로 제어하는 FPS 리코일 트레이너. 클릭하면 포인터락(커서 숨김)으로 게임처럼 연습 가능.",
    siteName: "ogto 게임세상",
    images: [
      {
        url: "/thumbs/recoil.png",
        width: 1200,
        height: 630,
        alt: "리코일 레인지 - FPS 리코일 트레이너",
      },
    ],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "리코일 레인지 | ogto 게임세상",
    description:
      "연발 사격 반동을 마우스로 제어하는 배그식 리코일 트레이너. FPS 모드(포인터락) 지원.",
    images: ["/thumbs/recoil.png"],
  },
  category: "game",
  other: {
    "application-name": "ogto 게임세상",
    "apple-mobile-web-app-title": "ogto 게임세상",
  },
};

export default function Page() {
  return <RecoilRangeClient />;
}
