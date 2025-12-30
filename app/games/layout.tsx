import Header from "@/components/Header";

const HEADER_H = 64; // 너 헤더가 64px 고정이면 그대로. 다르면 실제 높이로 맞춰.

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main
        className="overflow-hidden"
        style={{ height: `calc(100vh - ${HEADER_H}px)` }}
      >
        {children}
      </main>
    </>
  );
}
