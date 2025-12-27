import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ogto.games"), // 도메인 생기면 교체
  title: {
    default: "ogto 게임세상",
    template: "%s | ogto 게임세상",
  },
  description: "설치 없이 바로 즐기는 웹게임 모음. 반사신경, 미니게임, 캐주얼 게임 허브.",
  keywords: [
    "웹게임",
    "미니게임",
    "반사신경 게임",
    "HTML5 게임",
    "무료 게임",
  ],
  openGraph: {
    type: "website",
    siteName: "ogto 게임세상",
    locale: "ko_KR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
