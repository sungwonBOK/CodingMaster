import Link from "next/link";

type ProblemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProblemDetailPage({ params }: ProblemPageProps) {
  const { slug } = await params;

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

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-blue-700">문제 상세</p>
          <h1 className="mb-4 text-3xl font-bold tracking-normal">{slug}</h1>
          <p className="mb-6 leading-7 text-slate-600">
            문제 본문, 입력 조건, 출력 조건, 공개 예제는 문제 시드 데이터가
            연결되는 다음 단계에서 표시합니다.
          </p>
          <div className="rounded-md bg-slate-50 p-4">
            <h2 className="mb-2 text-sm font-semibold">공개 예제 영역</h2>
            <p className="text-sm leading-6 text-slate-600">
              예제 입력과 출력이 이 위치에 표시됩니다.
            </p>
          </div>
        </section>

        <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-3 block text-sm font-semibold" htmlFor="code">
            Python 코드
          </label>
          <textarea
            className="h-80 w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 outline-none focus:border-blue-500"
            defaultValue={"# Python 코드를 작성하세요\n"}
            id="code"
          />
          <div className="mt-4 flex gap-2">
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
              실행
            </button>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              제출
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
