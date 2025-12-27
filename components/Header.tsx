import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto max-w-6xl h-[56px] px-6 flex items-center justify-between">
        {/* 로고 / 타이틀 */}
        <Link
          href="/"
          className="flex items-center gap-2 group select-none"
        >
          <span className="text-[#D6FF00] font-extrabold tracking-tight text-lg">
            ogto
          </span>
          <span className="text-white/70 text-sm group-hover:text-white transition">
            게임세상
          </span>
        </Link>

        {/* 우측 영역 (확장용) */}
        <div className="flex items-center gap-3">
          {/* 필요하면 나중에 아이콘/버튼 추가 */}
        </div>
      </div>
    </header>
  );
}
