import Link from "next/link";

export default function MyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 text-slate-950">
      <nav className="mb-10 flex items-center justify-between border-b border-slate-200 pb-5">
        <Link className="text-lg font-semibold" href="/">
          CodingMaster
        </Link>
        <Link className="text-sm font-medium text-slate-600 hover:text-slate-950" href="/problems">
          문제은행
        </Link>
      </nav>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-blue-700">내 기록</p>
        <h1 className="mb-4 text-3xl font-bold tracking-normal">학습 기록 준비 중</h1>
        <p className="max-w-2xl leading-7 text-slate-600">
          로그인, 제출, 힌트, 포기 기록이 연결되면 이 화면에서 풀이 통계와
          복습 메모를 확인할 수 있습니다.
        </p>
      </section>
    </main>
  );
}
