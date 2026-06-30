import Link from "next/link";
import { listProblemSummaries } from "@/lib/problems/problem-repository.mjs";

const difficultyToneClassNames: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

function DifficultyBadge({ difficulty }: { difficulty: { label: string; tone: string } }) {
  return (
    <span
      className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
        difficultyToneClassNames[difficulty.tone] ?? difficultyToneClassNames.slate
      }`}
    >
      {difficulty.label}
    </span>
  );
}

function TagList({ label, tags }: { label: string; tags: Array<{ key: string; label: string }> }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600" key={tag.key}>
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  const problems = listProblemSummaries();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 text-slate-950">
      <nav className="mb-10 flex items-center justify-between border-b border-slate-200 pb-5">
        <Link className="text-lg font-semibold" href="/">
          CodingMaster
        </Link>
        <Link className="text-sm font-medium text-slate-600 hover:text-slate-950" href="/me">
          My Page
        </Link>
      </nav>

      <section className="mb-8 space-y-3">
        <p className="text-sm font-semibold text-blue-700">Problem Bank</p>
        <h1 className="text-3xl font-bold tracking-normal">Choose a practice problem</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Browse the seeded MVP problems. Difficulty and tag labels are resolved through a small metadata layer so they
          can change without rewriting the page components.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {problems.map((problem) => (
          <Link
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400"
            href={`/problems/${problem.slug}`}
            key={problem.slug}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{problem.title}</h2>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <div className="space-y-4">
              <TagList label="Algorithm" tags={problem.algorithmTags} />
              <TagList label="Thinking Step" tags={problem.thinkingStepTags} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
