import Link from "next/link";

const workflowItems = [
  "문제를 읽고 풀이를 시도합니다.",
  "힌트, 실행, 제출, 포기 기록을 남깁니다.",
  "막힌 사고 단계를 근거와 함께 확인합니다.",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 text-slate-950">
      <nav className="flex items-center justify-between border-b border-slate-200 pb-5">
        <Link className="text-lg font-semibold" href="/">
          CodingMaster
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link className="hover:text-slate-950" href="/problems">
            문제은행
          </Link>
          <Link className="hover:text-slate-950" href="/me">
            내 기록
          </Link>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1fr_420px]">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-blue-700">CodingMaster MVP</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
              코딩 테스트에서 내가 어디서 막히는지 확인합니다
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              문제를 많이 푸는 것보다 중요한 것은 조건 해석, 풀이 구조화,
              시간복잡도 판단 중 어느 단계가 약한지 아는 것입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              href="/problems"
            >
              문제은행 보기
            </Link>
            <Link
              className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-slate-500"
              href="/me"
            >
              내 기록 확인
            </Link>
          </div>
        </div>

        <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold">풀이 흐름</h2>
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              MVP
            </span>
          </div>
          <ol className="space-y-4">
            {workflowItems.map((item, index) => (
              <li className="flex gap-3" key={item}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-slate-700">{item}</p>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}
