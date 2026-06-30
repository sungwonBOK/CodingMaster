import Link from "next/link";

const placeholderProblems = [
  {
    slug: "sum-of-numbers",
    title: "수들의 합",
    difficulty: "쉬움",
    tags: ["구현", "배열"],
  },
  {
    slug: "two-sum-exists",
    title: "두 수의 합 존재 여부",
    difficulty: "보통",
    tags: ["집합", "해시"],
  },
];

export default function ProblemsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 text-slate-950">
      <nav className="mb-10 flex items-center justify-between border-b border-slate-200 pb-5">
        <Link className="text-lg font-semibold" href="/">
          CodingMaster
        </Link>
        <Link className="text-sm font-medium text-slate-600 hover:text-slate-950" href="/me">
          내 기록
        </Link>
      </nav>

      <section className="mb-8 space-y-3">
        <p className="text-sm font-semibold text-blue-700">문제은행</p>
        <h1 className="text-3xl font-bold tracking-normal">연습할 문제를 선택하세요</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          실제 문제 데이터와 채점 흐름은 다음 이슈에서 연결합니다. 지금은 앱
          구조와 라우팅을 확인하기 위한 기본 화면입니다.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {placeholderProblems.map((problem) => (
          <Link
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400"
            href={`/problems/${problem.slug}`}
            key={problem.slug}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{problem.title}</h2>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {problem.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <span
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
