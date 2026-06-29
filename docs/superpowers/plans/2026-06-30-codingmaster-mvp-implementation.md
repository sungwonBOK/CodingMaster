# CodingMaster MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable CodingMaster MVP: a Next.js + Supabase problem-bank coding practice app with Python example execution/submission, hints, give-up flow, explanation display, and evidence-based thinking-step analysis.

**Architecture:** Use a monorepo-style project with `apps/web` for the Next.js app, `packages/runner` for a replaceable Python runner boundary, `supabase` for schema/seed files, and `docs` for project decisions. Supabase handles auth and data persistence; user code execution is isolated behind a `RunnerClient` interface so the MVP can start with a local runner and later move to Docker without changing the judge flow.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Vitest, Python runner process, GitHub Issues for implementation tracking.

---

## Scope

Included:

- Public landing page.
- Public problem bank list.
- Public problem detail and code editor UI.
- Google/GitHub login through Supabase.
- Login-gated hints, example execution, submission, give-up, explanation, and analysis.
- Python-only runner interface.
- Seed-based problem data.
- Simple review note and profile stats.
- GitHub issue tracker backlog.

Excluded:

- Admin problem editor.
- Similar problem recommendation.
- Weekly report.
- User feedback on analysis quality.
- Code AST/static analysis.
- Multi-language execution.
- Payment.
- Study group features.

## Repository Layout

Create this structure under `C:\Users\sungw\Desktop\CodingMaster`.

```text
CodingMaster/
  apps/
    web/
      app/
      components/
      lib/
      tests/
  packages/
    runner/
      src/
      tests/
  supabase/
    migrations/
    seed/
  docs/
    issues/
    superpowers/
      plans/
  MVP_DESIGN.md
  package.json
  pnpm-workspace.yaml
  README.md
```

Responsibilities:

- `apps/web`: user-facing pages, API route handlers, Supabase helpers, auth gates, and UI components.
- `packages/runner`: TypeScript runner interface and MVP local Python runner implementation.
- `supabase`: SQL schema and seed data; no live secrets committed.
- `docs/issues`: local issue mirror before GitHub issues are created.

## GitHub Issue Backlog

Create these issues once a GitHub repository exists.

1. `[MVP-00] Initialize repository and project tooling`
2. `[MVP-01] Scaffold Next.js app shell`
3. `[MVP-02] Add Supabase schema and seed problem format`
4. `[MVP-03] Implement public problem bank list/detail`
5. `[MVP-04] Add Supabase Auth login gates`
6. `[MVP-05] Add code editor and local draft preservation`
7. `[MVP-06] Implement runner boundary and Python example execution`
8. `[MVP-07] Implement submit judging and submission storage`
9. `[MVP-08] Implement hints and hint usage tracking`
10. `[MVP-09] Implement give-up flow, explanation, and answer reveal`
11. `[MVP-10] Implement evidence-based thinking-step analysis`
12. `[MVP-11] Implement simple review note and my page stats`
13. `[MVP-12] Polish UX, empty states, and build verification`

---

## Task 0: Local Git And Issue Backlog Preparation

**Files:**

- Create: `README.md`
- Create: `.gitignore`
- Create: `docs/issues/MVP_ISSUES.md`

- [ ] **Step 0.1: Initialize git repository if missing**

Run:

```powershell
git -C C:\Users\sungw\Desktop\CodingMaster status -sb
```

Expected if not initialized:

```text
fatal: not a git repository (or any of the parent directories): .git
```

Then run:

```powershell
git -C C:\Users\sungw\Desktop\CodingMaster init
```

Expected:

```text
Initialized empty Git repository
```

- [ ] **Step 0.2: Create `.gitignore`**

Create `C:\Users\sungw\Desktop\CodingMaster\.gitignore`:

```gitignore
node_modules
.next
out
dist
coverage
.env
.env.local
.env.*.local
.DS_Store
*.log
__pycache__
.pytest_cache
.venv
```

- [ ] **Step 0.3: Create README**

Create `C:\Users\sungw\Desktop\CodingMaster\README.md`:

```markdown
# CodingMaster

CodingMaster is a coding-test practice platform focused on identifying which thinking step blocks a learner, not on maximizing problem volume.

## MVP

The MVP provides:

- Public problem bank browsing.
- Login-gated hints, execution, submission, give-up, explanation, and analysis.
- Python-only runner boundary.
- Supabase Auth/Postgres for user data.

See `MVP_DESIGN.md` and `docs/superpowers/plans/2026-06-30-codingmaster-mvp-implementation.md`.
```

- [ ] **Step 0.4: Create local issue backlog mirror**

Create `C:\Users\sungw\Desktop\CodingMaster\docs\issues\MVP_ISSUES.md` with the same 13 issues listed in the `GitHub Issue Backlog` section. Each issue should include acceptance criteria from its task section below.

- [ ] **Step 0.5: Commit planning artifacts**

Run:

```powershell
git -C C:\Users\sungw\Desktop\CodingMaster add README.md .gitignore docs\issues\MVP_ISSUES.md MVP_DESIGN.md docs\superpowers\plans\2026-06-30-codingmaster-mvp-implementation.md
git -C C:\Users\sungw\Desktop\CodingMaster commit -m "docs: add MVP design and implementation plan"
```

Expected:

```text
[master (root-commit) ...] docs: add MVP design and implementation plan
```

---

## Task 1: Workspace Tooling

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`

- [ ] **Step 1.1: Create root package manifest**

Create `C:\Users\sungw\Desktop\CodingMaster\package.json`:

```json
{
  "name": "codingmaster",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "dev": "pnpm --filter @codingmaster/web dev",
    "build": "pnpm --filter @codingmaster/runner build && pnpm --filter @codingmaster/web build",
    "lint": "pnpm --filter @codingmaster/web lint",
    "test": "pnpm --filter @codingmaster/runner test && pnpm --filter @codingmaster/web test"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 1.2: Create pnpm workspace**

Create `C:\Users\sungw\Desktop\CodingMaster\pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

- [ ] **Step 1.3: Create shared TypeScript config**

Create `C:\Users\sungw\Desktop\CodingMaster\tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 1.4: Verify manifest syntax**

Run:

```powershell
node -e "JSON.parse(require('fs').readFileSync('C:/Users/sungw/Desktop/CodingMaster/package.json','utf8')); JSON.parse(require('fs').readFileSync('C:/Users/sungw/Desktop/CodingMaster/tsconfig.base.json','utf8')); console.log('ok')"
```

Expected:

```text
ok
```

---

## Task 2: Runner Package First

**Files:**

- Create: `packages/runner/package.json`
- Create: `packages/runner/tsconfig.json`
- Create: `packages/runner/src/types.ts`
- Create: `packages/runner/src/local-python-runner.ts`
- Create: `packages/runner/src/index.ts`
- Create: `packages/runner/tests/local-python-runner.test.ts`

- [ ] **Step 2.1: Create runner package manifest**

Create `C:\Users\sungw\Desktop\CodingMaster\packages\runner\package.json`:

```json
{
  "name": "@codingmaster/runner",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2.2: Create runner types**

Create `C:\Users\sungw\Desktop\CodingMaster\packages\runner\src\types.ts`:

```ts
export type RunnerStatus = "completed" | "timeout" | "runtime_error";

export type ExecutePythonRequest = {
  code: string;
  input: string;
  timeLimitMs: number;
  outputLimitBytes: number;
};

export type ExecutePythonResult = {
  status: RunnerStatus;
  stdout: string;
  stderr: string;
  elapsedMs: number;
};

export interface RunnerClient {
  executePython(request: ExecutePythonRequest): Promise<ExecutePythonResult>;
}
```

- [ ] **Step 2.3: Write runner tests before implementation**

Create `C:\Users\sungw\Desktop\CodingMaster\packages\runner\tests\local-python-runner.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LocalPythonRunner } from "../src/local-python-runner";

describe("LocalPythonRunner", () => {
  it("executes Python code with stdin", async () => {
    const runner = new LocalPythonRunner();

    const result = await runner.executePython({
      code: "n = int(input())\nprint(n + 1)",
      input: "4\n",
      timeLimitMs: 1000,
      outputLimitBytes: 1024
    });

    expect(result.status).toBe("completed");
    expect(result.stdout.trim()).toBe("5");
  });

  it("returns timeout when execution exceeds the limit", async () => {
    const runner = new LocalPythonRunner();

    const result = await runner.executePython({
      code: "while True:\n    pass",
      input: "",
      timeLimitMs: 100,
      outputLimitBytes: 1024
    });

    expect(result.status).toBe("timeout");
  });
});
```

- [ ] **Step 2.4: Implement local runner**

Create `C:\Users\sungw\Desktop\CodingMaster\packages\runner\src\local-python-runner.ts`:

```ts
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import type { ExecutePythonRequest, ExecutePythonResult, RunnerClient } from "./types";

export class LocalPythonRunner implements RunnerClient {
  executePython(request: ExecutePythonRequest): Promise<ExecutePythonResult> {
    const startedAt = performance.now();

    return new Promise((resolve) => {
      const child = spawn("python", ["-I", "-c", request.code], {
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true
      });

      let stdout = "";
      let stderr = "";
      let settled = false;

      const finish = (result: Omit<ExecutePythonResult, "elapsedMs">) => {
        if (settled) return;
        settled = true;
        resolve({ ...result, elapsedMs: Math.round(performance.now() - startedAt) });
      };

      const timer = setTimeout(() => {
        child.kill();
        finish({ status: "timeout", stdout, stderr });
      }, request.timeLimitMs);

      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8");
        if (Buffer.byteLength(stdout, "utf8") > request.outputLimitBytes) {
          child.kill();
          finish({ status: "runtime_error", stdout: stdout.slice(0, request.outputLimitBytes), stderr: "Output limit exceeded" });
        }
      });

      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });

      child.on("error", (error) => {
        clearTimeout(timer);
        finish({ status: "runtime_error", stdout, stderr: error.message });
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        if (settled) return;
        finish({ status: code === 0 ? "completed" : "runtime_error", stdout, stderr });
      });

      child.stdin.end(request.input);
    });
  }
}
```

- [ ] **Step 2.5: Export runner API**

Create `C:\Users\sungw\Desktop\CodingMaster\packages\runner\src\index.ts`:

```ts
export type { ExecutePythonRequest, ExecutePythonResult, RunnerClient, RunnerStatus } from "./types";
export { LocalPythonRunner } from "./local-python-runner";
```

- [ ] **Step 2.6: Verify runner tests pass**

Run:

```powershell
pnpm --dir C:\Users\sungw\Desktop\CodingMaster --filter @codingmaster/runner test
```

Expected:

```text
2 passed
```

---

## Task 3: Supabase Schema And Seed Shape

**Files:**

- Create: `supabase/migrations/0001_initial_schema.sql`
- Create: `supabase/seed/problems.json`

- [ ] **Step 3.1: Create initial schema SQL**

Create `C:\Users\sungw\Desktop\CodingMaster\supabase\migrations\0001_initial_schema.sql`.

Required tables:

```text
problems
test_cases
hints
submissions
hint_usages
give_up_events
thinking_step_analyses
review_notes
```

Required RLS rules:

- `problems` are publicly readable.
- Public `test_cases` are publicly readable.
- `hints` require login.
- User records in `submissions`, `hint_usages`, `give_up_events`, `thinking_step_analyses`, and `review_notes` are readable/writable only by their owner.

- [ ] **Step 3.2: Create sample seed JSON**

Create `C:\Users\sungw\Desktop\CodingMaster\supabase\seed\problems.json` with at least two problems:

- `sum-of-numbers`: easy implementation/array problem.
- `two-sum-exists`: medium set/hash problem with large-input and duplicate-data test case tags.

Each problem must include:

```text
slug
title
difficulty
statement
inputDescription
outputDescription
constraintsText
algorithmTags
thinkingStepTags
failurePatternTags
testCases
hints
explanation
answerCode
```

- [ ] **Step 3.3: Validate seed JSON**

Run:

```powershell
node -e "JSON.parse(require('fs').readFileSync('C:/Users/sungw/Desktop/CodingMaster/supabase/seed/problems.json','utf8')); console.log('seed ok')"
```

Expected:

```text
seed ok
```

---

## Task 4: Next.js App Shell

**Files:**

- Create: `apps/web`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/problems/page.tsx`
- Create: `apps/web/app/problems/[slug]/page.tsx`
- Create: `apps/web/app/me/page.tsx`

- [ ] **Step 4.1: Scaffold Next.js app**

Run:

```powershell
pnpm create next-app@latest C:\Users\sungw\Desktop\CodingMaster\apps\web --ts --tailwind --eslint --app --src-dir false --import-alias "@/*"
```

Expected:

```text
Success! Created web
```

- [ ] **Step 4.2: Set package name**

Modify `apps/web/package.json`:

```json
{
  "name": "@codingmaster/web",
  "private": true
}
```

Keep generated dependencies and scripts.

- [ ] **Step 4.3: Create landing page**

Create `apps/web/app/page.tsx`:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <section className="space-y-4">
        <p className="text-sm font-semibold text-blue-600">CodingMaster</p>
        <h1 className="text-4xl font-bold tracking-normal text-slate-950">
          내가 어떤 사고 단계에서 막히는지 찾아주는 코테 플랫폼
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          문제를 많이 푸는 것보다 중요한 것은 어디서 막히는지 아는 것입니다.
        </p>
      </section>
      <Link className="w-fit rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white" href="/problems">
        문제은행 보기
      </Link>
    </main>
  );
}
```

- [ ] **Step 4.4: Verify web build**

Run:

```powershell
pnpm --dir C:\Users\sungw\Desktop\CodingMaster --filter @codingmaster/web build
```

Expected:

```text
Compiled successfully
```

---

## Task 5: Problem Pages From Seed Data

**Files:**

- Create: `apps/web/lib/problems/problem-types.ts`
- Create: `apps/web/lib/problems/seed-problems.ts`
- Create: `apps/web/lib/problems/problem-repository.ts`
- Modify: `apps/web/app/problems/page.tsx`
- Modify: `apps/web/app/problems/[slug]/page.tsx`

- [ ] **Step 5.1: Add problem types**

Create `apps/web/lib/problems/problem-types.ts`:

```ts
export type ProblemTestCase = {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  caseType: string;
};

export type ProblemHint = {
  level: number;
  content: string;
};

export type Problem = {
  slug: string;
  title: string;
  difficulty: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraintsText: string;
  algorithmTags: string[];
  thinkingStepTags: string[];
  failurePatternTags: string[];
  testCases: ProblemTestCase[];
  hints: ProblemHint[];
  explanation: string;
  answerCode: string;
};
```

- [ ] **Step 5.2: Add repository helpers**

Create `apps/web/lib/problems/seed-problems.ts`:

```ts
import problems from "../../../../supabase/seed/problems.json";
import type { Problem } from "./problem-types";

export const seedProblems = problems as Problem[];
```

Create `apps/web/lib/problems/problem-repository.ts`:

```ts
import { seedProblems } from "./seed-problems";

export function listProblems() {
  return seedProblems.map((problem) => ({
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    algorithmTags: problem.algorithmTags,
    thinkingStepTags: problem.thinkingStepTags
  }));
}

export function getProblemBySlug(slug: string) {
  return seedProblems.find((problem) => problem.slug === slug) ?? null;
}
```

- [ ] **Step 5.3: Render list and detail pages**

Acceptance criteria:

- `/problems` lists seed problem titles, difficulty, algorithm tags, and thinking step tags.
- `/problems/[slug]` shows problem statement, input/output description, public examples, and a Python textarea.
- Hints, explanation, and answer code are not visible yet.

- [ ] **Step 5.4: Verify build**

Run:

```powershell
pnpm --dir C:\Users\sungw\Desktop\CodingMaster --filter @codingmaster/web build
```

Expected:

```text
Compiled successfully
```

---

## Task 6: Judge And Analysis Core

**Files:**

- Create: `apps/web/lib/judge/judge-types.ts`
- Create: `apps/web/lib/judge/judge-service.ts`
- Create: `apps/web/lib/analysis/analyze-give-up.ts`
- Create: `apps/web/tests/analyze-give-up.test.ts`

- [ ] **Step 6.1: Add judge types**

Create `apps/web/lib/judge/judge-types.ts`:

```ts
export type JudgeResult = "accepted" | "wrong_answer" | "time_limit_exceeded" | "runtime_error";

export type JudgeCaseResult = {
  caseType: string;
  passed: boolean;
  stdout: string;
  expectedOutput: string;
  elapsedMs: number;
  result: JudgeResult;
};

export type JudgeSummary = {
  result: JudgeResult;
  elapsedMs: number;
  failedCaseType: string | null;
  cases: JudgeCaseResult[];
};
```

- [ ] **Step 6.2: Implement judge service**

Create `apps/web/lib/judge/judge-service.ts`:

```ts
import type { RunnerClient } from "@codingmaster/runner";
import type { Problem, ProblemTestCase } from "@/lib/problems/problem-types";
import type { JudgeCaseResult, JudgeSummary } from "./judge-types";

function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

export class JudgeService {
  constructor(private readonly runner: RunnerClient) {}

  async runExamples(problem: Problem, code: string): Promise<JudgeSummary> {
    return this.runCases(problem.testCases.filter((testCase) => testCase.isPublic), code);
  }

  async submit(problem: Problem, code: string): Promise<JudgeSummary> {
    return this.runCases(problem.testCases, code);
  }

  private async runCases(testCases: ProblemTestCase[], code: string): Promise<JudgeSummary> {
    const cases: JudgeCaseResult[] = [];

    for (const testCase of testCases) {
      const execution = await this.runner.executePython({
        code,
        input: testCase.input,
        timeLimitMs: 2000,
        outputLimitBytes: 10000
      });

      const result = execution.status === "timeout"
        ? "time_limit_exceeded"
        : execution.status === "runtime_error"
          ? "runtime_error"
          : normalizeOutput(execution.stdout) === normalizeOutput(testCase.expectedOutput)
            ? "accepted"
            : "wrong_answer";

      const passed = result === "accepted";

      cases.push({
        caseType: testCase.caseType,
        passed,
        stdout: execution.stdout,
        expectedOutput: testCase.expectedOutput,
        elapsedMs: execution.elapsedMs,
        result
      });

      if (!passed) break;
    }

    const failed = cases.find((testCase) => !testCase.passed);

    return {
      result: failed?.result ?? "accepted",
      elapsedMs: cases.reduce((sum, testCase) => sum + testCase.elapsedMs, 0),
      failedCaseType: failed?.caseType ?? null,
      cases
    };
  }
}
```

- [ ] **Step 6.3: Implement give-up analysis**

Create `apps/web/lib/analysis/analyze-give-up.ts`:

```ts
import type { Problem } from "@/lib/problems/problem-types";

export type GiveUpSignals = {
  viewedHintLevel: number;
  attemptCount: number;
  failedCaseType: string | null;
};

export type ThinkingStepAnalysis = {
  weakStep: string;
  confidence: number;
  evidence: string[];
  explanation: string;
};

export function analyzeGiveUp(problem: Problem, signals: GiveUpSignals): ThinkingStepAnalysis {
  const evidence: string[] = [];

  if (signals.viewedHintLevel > 0) evidence.push(`힌트 ${signals.viewedHintLevel}단계까지 확인했습니다.`);
  if (signals.attemptCount > 0) evidence.push(`제출을 ${signals.attemptCount}회 시도했습니다.`);
  if (signals.failedCaseType) evidence.push(`${signals.failedCaseType} 테스트에서 실패했습니다.`);

  if (signals.failedCaseType?.includes("large") || problem.thinkingStepTags.includes("complexity_judgement")) {
    evidence.push("이 문제는 입력 크기와 시간복잡도 판단이 중요합니다.");
    return {
      weakStep: "시간복잡도 판단",
      confidence: 0.72,
      evidence,
      explanation: "큰 입력이나 복잡도 관련 신호가 있어, 가능한 시간복잡도를 판단하는 단계에서 막혔을 가능성이 높습니다."
    };
  }

  if (signals.failedCaseType?.includes("edge") || problem.thinkingStepTags.includes("condition_interpretation")) {
    evidence.push("이 문제는 조건과 경계값 해석이 중요합니다.");
    return {
      weakStep: "조건 해석",
      confidence: 0.66,
      evidence,
      explanation: "경계값이나 조건 해석 관련 신호가 있어, 문제 조건을 정확히 코드로 옮기는 단계에서 막혔을 가능성이 높습니다."
    };
  }

  return {
    weakStep: problem.thinkingStepTags[0] ?? "풀이 구조화",
    confidence: 0.55,
    evidence: [...evidence, "문제의 핵심 사고 단계와 풀이 행동 기록을 함께 기준으로 추정했습니다."],
    explanation: "아직 근거가 많지는 않지만, 포기 시점의 행동 기록상 이 사고 단계에서 막혔을 가능성이 있습니다."
  };
}
```

- [ ] **Step 6.4: Test analysis behavior**

Create `apps/web/tests/analyze-give-up.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { analyzeGiveUp } from "@/lib/analysis/analyze-give-up";
import type { Problem } from "@/lib/problems/problem-types";

const baseProblem: Problem = {
  slug: "sample",
  title: "Sample",
  difficulty: "medium",
  statement: "sample",
  inputDescription: "sample",
  outputDescription: "sample",
  constraintsText: "sample",
  algorithmTags: [],
  thinkingStepTags: ["complexity_judgement"],
  failurePatternTags: [],
  testCases: [],
  hints: [],
  explanation: "sample",
  answerCode: "print('ok')"
};

describe("analyzeGiveUp", () => {
  it("returns complexity analysis for large input failures", () => {
    const analysis = analyzeGiveUp(baseProblem, {
      viewedHintLevel: 3,
      attemptCount: 2,
      failedCaseType: "large_input_proxy"
    });

    expect(analysis.weakStep).toBe("시간복잡도 판단");
    expect(analysis.evidence).toContain("large_input_proxy 테스트에서 실패했습니다.");
  });
});
```

---

## Task 7: Auth Gate And Draft Preservation

**Files:**

- Create: `apps/web/.env.example`
- Create: `apps/web/lib/supabase/client.ts`
- Create: `apps/web/components/auth/login-required-dialog.tsx`
- Create: `apps/web/components/problems/problem-workspace.tsx`
- Modify: `apps/web/app/problems/[slug]/page.tsx`

- [ ] **Step 7.1: Install Supabase packages**

Run:

```powershell
pnpm --dir C:\Users\sungw\Desktop\CodingMaster --filter @codingmaster/web add @supabase/supabase-js @supabase/ssr
```

Expected:

```text
Done
```

- [ ] **Step 7.2: Add env template**

Create `apps/web/.env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 7.3: Add login-required component**

Create `apps/web/components/auth/login-required-dialog.tsx`:

```tsx
"use client";

export function LoginRequiredDialog() {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
      실행, 제출, 힌트, 포기는 로그인 후 사용할 수 있습니다.
    </div>
  );
}
```

- [ ] **Step 7.4: Add local draft workspace**

Create `apps/web/components/problems/problem-workspace.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";

type ProblemWorkspaceProps = {
  problemSlug: string;
};

export function ProblemWorkspace({ problemSlug }: ProblemWorkspaceProps) {
  const storageKey = `codingmaster:draft:${problemSlug}`;
  const [code, setCode] = useState("# Python 코드를 작성하세요\n");
  const [showLoginRequired, setShowLoginRequired] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setCode(saved);
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, code);
  }, [code, storageKey]);

  return (
    <aside className="min-h-[520px] rounded-md border border-slate-200 p-4">
      <textarea
        className="h-96 w-full resize-none rounded-md border border-slate-200 p-3 font-mono text-sm"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <div className="mt-4 flex gap-2">
        <button onClick={() => setShowLoginRequired(true)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">실행</button>
        <button onClick={() => setShowLoginRequired(true)} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">제출</button>
        <button onClick={() => setShowLoginRequired(true)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">힌트</button>
      </div>
      {showLoginRequired ? <div className="mt-4"><LoginRequiredDialog /></div> : null}
    </aside>
  );
}
```

- [ ] **Step 7.5: Verify draft persistence manually**

Run:

```powershell
pnpm --dir C:\Users\sungw\Desktop\CodingMaster dev
```

Open:

```text
http://localhost:3000/problems/sum-of-numbers
```

Expected:

```text
Typing in the editor persists after refresh.
Clicking 실행/제출/힌트 shows login-required messaging.
```

---

## Task 8: GitHub Issue Creation After Remote Exists

**Files:**

- Read: `docs/issues/MVP_ISSUES.md`

- [ ] **Step 8.1: Get remote repository**

Current constraints:

- `gh` CLI is not installed.
- GitHub connector is available for issue creation.
- GitHub connector did not list an existing repository during planning.

Ask the user for an existing GitHub repository URL after local planning/scaffolding is ready.

- [ ] **Step 8.2: Connect local repository to remote**

After the user provides a repository URL, run:

```powershell
git -C C:\Users\sungw\Desktop\CodingMaster remote add origin <REPOSITORY_URL>
git -C C:\Users\sungw\Desktop\CodingMaster branch -M main
git -C C:\Users\sungw\Desktop\CodingMaster push -u origin main
```

Expected:

```text
branch 'main' set up to track 'origin/main'
```

- [ ] **Step 8.3: Create GitHub issues**

Use the GitHub connector `create_issue` for each issue in `docs/issues/MVP_ISSUES.md`.

Labels:

```text
mvp
planning
frontend
backend
runner
supabase
```

Apply `mvp` to every issue. Apply one area label where appropriate.

---

## Verification Commands

Run these after the initial project files exist:

```powershell
pnpm --dir C:\Users\sungw\Desktop\CodingMaster test
pnpm --dir C:\Users\sungw\Desktop\CodingMaster build
git -C C:\Users\sungw\Desktop\CodingMaster status -sb
```

Expected:

```text
Tests pass.
Build passes.
Working tree contains only intentional changes or is clean after commit.
```

## Plan Self-Review

Spec coverage:

- Problem bank: Tasks 4 and 5.
- Login-gated actions: Task 7.
- Runner boundary: Tasks 2 and 6.
- Supabase schema: Task 3.
- Hints/give-up/explanation/analysis: Tasks 3, 6, and follow-up issues MVP-08 through MVP-10.
- Review note/my page: issue MVP-11, after first vertical slice.
- GitHub issue tracker: Task 8.

Placeholder scan:

- Live Supabase credentials are intentionally not included; `.env.example` is used until the project exists.
- GitHub issue creation waits for an actual repository URL because no accessible repository was listed.

Type consistency:

- `RunnerClient` is consumed by `JudgeService`.
- `Problem` fields match the required seed shape.
- `ThinkingStepAnalysis` fields match the give-up analysis output.
