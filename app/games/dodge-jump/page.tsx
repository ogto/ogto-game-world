import type { Metadata } from "next";
import PlayClient from "./_components/PlayClient";

export const metadata: Metadata = {
  title: "Dodge Jump | ogto 게임세상",
  description: "점프와 대시로 공을 피하며 오래 버티는 반사신경 미니게임",
  alternates: { canonical: "/games/dodge-jump" },
  openGraph: {
    title: "Dodge Jump | ogto 게임세상",
    description: "점프와 대시로 공을 피하며 오래 버티는 반사신경 미니게임",
    url: "/games/dodge-jump",
    type: "website",
    locale: "ko_KR",
  },
};

export default function Page() {
  return (
    <>
      <PlayClient />

      {/* SEO용 텍스트 */}
      <section className="sr-only">
        <h2>Dodge Jump 미니 웹게임</h2>
        <p>
          Dodge Jump는 키보드로 조작하는 반사신경 기반 무료 웹게임입니다. 좌우 이동과
          점프, 대시를 활용해 공을 피하며 최대한 오래 살아남는 것이 목표입니다.
        </p>
      </section>
    </>
  );
}
