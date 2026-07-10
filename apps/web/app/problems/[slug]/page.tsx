import Link from "next/link";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "@/components/problems/problem-workspace";
import { getProblemDetail, listProblemSummaries } from "@/lib/problems/problem-repository.mjs";

type ProblemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const difficultyToneClassNames: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function generateStaticParams() {
  return listProblemSummaries().map((problem) => ({ slug: problem.slug }));
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

function TextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="leading-7 text-slate-700">{children}</p>
    </section>
  );
}

export default async function ProblemDetailPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = getProblemDetail(slug);

  if (!problem) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 text-slate-950">
      <nav className="mb-10 flex items-center justify-between border-b border-slate-200 pb-5">
        <Link className="text-lg font-semibold" href="/">
          CodingMaster
        </Link>
        <Link className="text-sm font-medium text-slate-600 hover:text-slate-950" href="/problems">
          Problem Bank
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="space-y-8 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
                  difficultyToneClassNames[problem.difficulty.tone] ?? difficultyToneClassNames.slate
                }`}
              >
                {problem.difficulty.label}
              </span>
              <span className="text-sm text-slate-500">{problem.slug}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-normal">{problem.title}</h1>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <TagList label="Algorithm" tags={problem.algorithmTags} />
            <TagList label="Thinking Step" tags={problem.thinkingStepTags} />
          </div>

          <TextBlock title="Problem">{problem.statement}</TextBlock>
          <TextBlock title="Input">{problem.inputDescription}</TextBlock>
          <TextBlock title="Output">{problem.outputDescription}</TextBlock>
          <TextBlock title="Constraints">{problem.constraintsText}</TextBlock>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">Public Examples</h2>
            <div className="space-y-3">
              {problem.publicExamples.map((example, index) => (
                <div className="rounded-md bg-slate-50 p-4" key={`${example.caseType}-${index}`}>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Example {index + 1}: {example.caseType}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Input</p>
                      <pre className="overflow-auto rounded-md bg-white p-3 text-sm text-slate-800">{example.input}</pre>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Expected Output</p>
                      <pre className="overflow-auto rounded-md bg-white p-3 text-sm text-slate-800">{example.expectedOutput}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <ProblemWorkspace
          problemSlug={problem.slug}
          starterCode={problem.editor.starterCode}
        />
      </div>
    </main>
  );
}
