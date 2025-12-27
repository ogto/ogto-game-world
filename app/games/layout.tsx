import Header from "@/components/Header";

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-[56px] overflow-hidden">
        {children}
      </main>
    </>
  );
}
