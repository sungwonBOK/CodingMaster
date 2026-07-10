# MVP-04 Supabase Login Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the minimum Supabase browser client setup and show a login-required notice when a public visitor clicks Run, Submit, or Hint on a problem.

**Architecture:** Keep the problem page server-rendered and isolate editor state plus protected controls in a small client component. Test environment resolution and login-gate behavior independently, then verify the integrated UI in the browser without adding a real sign-in flow.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, Node.js 24.13.0, pnpm 9.15.4, `@supabase/supabase-js` 2.110.2, `@supabase/ssr` 0.12.0, Node test runner, tsx 4.23.0, Testing Library 16.3.2, jsdom 29.1.1, `@types/jsdom` 28.0.3

## Global Constraints

- Work only in `C:\Users\sungw\Desktop\CodingMaster`.
- Keep `app/problems/[slug]/page.tsx` server-rendered.
- Do not add actual sign-in screens, OAuth providers, callback handling, server session cookies, or route protection.
- Do not commit live Supabase credentials or service-role secrets.
- Keep the local-only `AGENTS.md` untracked and out of every commit.
- Follow RED-GREEN-REFACTOR and do not write production behavior before its failing test.
- Per the user request, make the implementation commit only after all verification passes.

---

### Task 1: Supabase Browser Configuration

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/pnpm-lock.yaml`
- Create: `apps/web/.env.example`
- Create: `apps/web/lib/supabase/browser-client-config.mjs`
- Create: `apps/web/lib/supabase/browser-client-config.d.mts`
- Create: `apps/web/lib/supabase/client.ts`
- Create: `apps/web/tests/supabase-client-config.test.mjs`

**Interfaces:**
- Produces: `readSupabaseBrowserConfig(env): { url: string; publishableKey: string }`
- Produces: `createClient(): SupabaseClient`

- [ ] **Step 1: Install pinned runtime and test dependencies**

Run from `apps/web`:

```powershell
corepack pnpm add @supabase/supabase-js@2.110.2 @supabase/ssr@0.12.0
corepack pnpm add -D tsx@4.23.0 @testing-library/react@16.3.2 jsdom@29.1.1 @types/jsdom@28.0.3
```

- [ ] **Step 2: Write the failing Supabase configuration test**

Create `tests/supabase-client-config.test.mjs`:

```js
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { readSupabaseBrowserConfig } = await import(
  "../lib/supabase/browser-client-config.mjs"
);

describe("Supabase browser client configuration", () => {
  it("returns the public URL and publishable key", () => {
    assert.deepEqual(
      readSupabaseBrowserConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
      {
        url: "https://example.supabase.co",
        publishableKey: "sb_publishable_example",
      },
    );
  });

  it("identifies a missing public URL without exposing values", () => {
    assert.throws(
      () =>
        readSupabaseBrowserConfig({
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
        }),
      /NEXT_PUBLIC_SUPABASE_URL is required/,
    );
  });

  it("identifies a missing publishable key without exposing values", () => {
    assert.throws(
      () =>
        readSupabaseBrowserConfig({
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        }),
      /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required/,
    );
  });
});
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```powershell
node --test tests/supabase-client-config.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `browser-client-config.mjs`.

- [ ] **Step 4: Implement the minimum configuration reader**

Create `lib/supabase/browser-client-config.mjs`:

```js
export function readSupabaseBrowserConfig(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required");
  }

  return { url, publishableKey };
}
```

Create `lib/supabase/browser-client-config.d.mts`:

```ts
export type SupabaseBrowserConfig = {
  url: string;
  publishableKey: string;
};

export function readSupabaseBrowserConfig(
  env: Record<string, string | undefined>,
): SupabaseBrowserConfig;
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests/supabase-client-config.test.mjs
```

Expected: 3 tests pass and 0 fail.

- [ ] **Step 6: Add the environment template and browser client factory**

Create `.env.example`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseBrowserConfig } from "./browser-client-config.mjs";

export function createClient() {
  const { url, publishableKey } = readSupabaseBrowserConfig({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  return createBrowserClient(url, publishableKey);
}
```

- [ ] **Step 7: Run Task 1 tests**

Run:

```powershell
corepack pnpm test
```

Expected: the existing problem repository tests and the 3 Supabase configuration tests pass.

---

### Task 2: Login-Gated Problem Workspace

**Files:**
- Create: `apps/web/lib/auth/login-gate.mjs`
- Create: `apps/web/lib/auth/login-gate.d.mts`
- Create: `apps/web/tests/login-gate.test.mjs`
- Create: `apps/web/components/problems/problem-workspace.tsx`
- Create: `apps/web/tests/problem-workspace.test.tsx`
- Modify: `apps/web/app/problems/[slug]/page.tsx`

**Interfaces:**
- Produces: `getLoginRequiredNotice(action): { title: string; message: string }`
- Produces: `ProblemWorkspace({ problemSlug, starterCode })`

- [ ] **Step 1: Write the failing login-gate model test**

Create `tests/login-gate.test.mjs`:

```js
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { getLoginRequiredNotice } = await import(
  "../lib/auth/login-gate.mjs"
);

describe("login gate", () => {
  for (const [action, label] of [
    ["run", "실행"],
    ["submit", "제출"],
    ["hint", "힌트"],
  ]) {
    it(`requires login before ${action}`, () => {
      assert.deepEqual(getLoginRequiredNotice(action), {
        title: "로그인이 필요합니다",
        message: `${label} 기능은 로그인 후 사용할 수 있습니다.`,
      });
    });
  }
});
```

- [ ] **Step 2: Run the model test and verify RED**

Run:

```powershell
node --test tests/login-gate.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `login-gate.mjs`.

- [ ] **Step 3: Implement the minimum login-gate model**

Create `lib/auth/login-gate.mjs`:

```js
const actionLabels = {
  run: "실행",
  submit: "제출",
  hint: "힌트",
};

export function getLoginRequiredNotice(action) {
  return {
    title: "로그인이 필요합니다",
    message: `${actionLabels[action]} 기능은 로그인 후 사용할 수 있습니다.`,
  };
}
```

Create `lib/auth/login-gate.d.mts`:

```ts
export type ProtectedAction = "run" | "submit" | "hint";

export type LoginRequiredNotice = {
  title: string;
  message: string;
};

export function getLoginRequiredNotice(
  action: ProtectedAction,
): LoginRequiredNotice;
```

- [ ] **Step 4: Run the model test and verify GREEN**

Run:

```powershell
node --test tests/login-gate.test.mjs
```

Expected: 3 tests pass and 0 fail.

- [ ] **Step 5: Write the failing client-component test**

Update the test script in `package.json` now that a TSX test will exist:

```json
"test": "node --test tests/*.test.mjs && node --import tsx --test tests/*.test.tsx"
```

Create `tests/problem-workspace.test.tsx`:

```tsx
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
});

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Node: dom.window.Node,
});
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});

const { cleanup, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { ProblemWorkspace } = await import(
  "../components/problems/problem-workspace"
);

afterEach(() => cleanup());

describe("ProblemWorkspace", () => {
  it("renders the starter code without an initial login notice", () => {
    render(
      <ProblemWorkspace
        problemSlug="sum-of-numbers"
        starterCode="# starter code"
      />,
    );

    assert.equal(
      (screen.getByLabelText("Python Code") as HTMLTextAreaElement).value,
      "# starter code",
    );
    assert.equal(screen.queryByRole("alert"), null);
  });

  for (const [button, actionLabel] of [
    ["Run", "실행"],
    ["Submit", "제출"],
    ["Hint", "힌트"],
  ]) {
    it(`shows a login-required notice for ${button}`, () => {
      render(
        <ProblemWorkspace
          problemSlug="sum-of-numbers"
          starterCode="# starter code"
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: button }));

      const alert = screen.getByRole("alert").textContent ?? "";
      assert.match(alert, /로그인이 필요합니다/);
      assert.match(alert, new RegExp(`${actionLabel} 기능`));
    });
  }
});
```

Run:

```powershell
node --import tsx --test tests/problem-workspace.test.tsx
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `components/problems/problem-workspace`.

- [ ] **Step 6: Implement the client workspace**

Create `components/problems/problem-workspace.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  getLoginRequiredNotice,
  type LoginRequiredNotice,
  type ProtectedAction,
} from "@/lib/auth/login-gate.mjs";

type ProblemWorkspaceProps = {
  problemSlug: string;
  starterCode: string;
};

const protectedActions: Array<{
  action: ProtectedAction;
  label: string;
  primary?: boolean;
}> = [
  { action: "run", label: "Run" },
  { action: "submit", label: "Submit", primary: true },
  { action: "hint", label: "Hint" },
];

export function ProblemWorkspace({
  problemSlug,
  starterCode,
}: ProblemWorkspaceProps) {
  const [code, setCode] = useState(starterCode);
  const [notice, setNotice] = useState<LoginRequiredNotice | null>(null);
  const textareaId = `code-${problemSlug}`;

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <label className="mb-3 block text-sm font-semibold" htmlFor={textareaId}>
        Python Code
      </label>
      <textarea
        className="h-80 w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 outline-none focus:border-blue-500"
        id={textareaId}
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {protectedActions.map(({ action, label, primary }) => (
          <button
            className={
              primary
                ? "rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
            }
            key={action}
            type="button"
            onClick={() => setNotice(getLoginRequiredNotice(action))}
          >
            {label}
          </button>
        ))}
      </div>
      {notice ? (
        <div
          className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"
          role="alert"
        >
          <p className="font-semibold">{notice.title}</p>
          <p className="mt-1">{notice.message}</p>
        </div>
      ) : null}
    </aside>
  );
}
```

- [ ] **Step 7: Run the component test and verify GREEN**

Run:

```powershell
node --import tsx --test tests/problem-workspace.test.tsx
```

Expected: all workspace tests pass and 0 fail.

- [ ] **Step 8: Integrate the workspace into the server-rendered detail page**

In `app/problems/[slug]/page.tsx`, import `ProblemWorkspace` and replace only the existing editor `<aside>` with:

```tsx
<ProblemWorkspace
  problemSlug={problem.slug}
  starterCode={problem.editor.starterCode}
/>
```

Do not move problem loading, `generateStaticParams`, or public problem content into the client component.

- [ ] **Step 9: Run all tests after integration**

Run:

```powershell
corepack pnpm test
```

Expected: all problem repository, Supabase configuration, login-gate, and workspace tests pass.

---

### Task 3: Verification and Feature Commit

**Files:**
- Verify all files from Tasks 1 and 2.
- Do not stage: `AGENTS.md`

**Interfaces:**
- Consumes: the complete MVP-04 implementation.
- Produces: a verified feature commit on `codex/mvp04-supabase-login-gate`, ready for final review.

- [ ] **Step 1: Run repository and web checks**

Run:

```powershell
node scripts\validate-mvp02.mjs
cd apps\web
corepack pnpm test
corepack pnpm lint
corepack pnpm build
```

Expected: every command exits 0 with no test, lint, type, or build errors.

- [ ] **Step 2: Verify the browser interaction**

Start the development server on port 3000, open `/problems/sum-of-numbers`, and verify:

- public problem content and starter code remain visible;
- no login notice is initially present;
- Run shows the execution login notice;
- Submit shows the submission login notice;
- Hint shows the hint login notice.

- [ ] **Step 3: Audit the final diff**

Run:

```powershell
git diff --check
git status --short
git diff -- apps/web
```

Expected: only MVP-04 files are changed, and `AGENTS.md` remains untracked.

- [ ] **Step 4: Commit the verified implementation**

Stage the explicit MVP-04 paths only, then run:

```powershell
git add -- docs/superpowers/plans/2026-07-11-mvp04-supabase-login-gate.md apps/web/.gitignore apps/web/.env.example apps/web/package.json apps/web/pnpm-lock.yaml apps/web/lib/supabase/browser-client-config.mjs apps/web/lib/supabase/browser-client-config.d.mts apps/web/lib/supabase/client.ts apps/web/tests/supabase-client-config.test.mjs apps/web/lib/auth/login-gate.mjs apps/web/lib/auth/login-gate.d.mts apps/web/tests/login-gate.test.mjs apps/web/components/problems/problem-workspace.tsx apps/web/tests/problem-workspace.test.tsx apps/web/app/problems/[slug]/page.tsx
git commit -m "feat: add Supabase login gate"
```

Expected: one feature commit; `AGENTS.md` is not included.

- [ ] **Step 5: Verify the feature branch state**

Run:

```powershell
git status --short --branch
git log -2 --oneline
```

Expected: the feature branch contains the design and feature commits, and only the local-only `AGENTS.md` remains untracked.

## After Final Code Review

The controller performs these steps only after the broad whole-branch review is approved:

1. Confirm the untracked implementation-plan copy in `C:\Users\sungw\Desktop\CodingMaster` is byte-identical to the committed feature-branch file, then remove only that duplicate untracked copy.
2. Fast-forward `main` to `codex/mvp04-supabase-login-gate` while preserving the untracked root `AGENTS.md`.
3. Push `main` and close issue #5:

```powershell
git push origin main
gh issue close 5 --repo sungwonBOK/CodingMaster --comment "MVP-04 구현과 검증을 완료했습니다. Supabase 브라우저 클라이언트 헬퍼와 공개 환경변수 예시를 추가했고, 비로그인 사용자가 실행·제출·힌트를 누르면 로그인 필요 안내가 표시됩니다."
gh issue view 5 --repo sungwonBOK/CodingMaster --json state,url
```

Expected: `main...origin/main`, only `AGENTS.md` remains untracked, both design and feature commits are present, and issue #5 is `CLOSED`.
