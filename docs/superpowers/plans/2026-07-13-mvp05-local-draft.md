# MVP-05 Local Draft Preservation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve each problem's Python editor draft in browser local storage and restore it after refresh without breaking editing when storage is unavailable.

**Architecture:** Keep persistence inside the existing `ProblemWorkspace` client component. Restore the current problem's draft before enabling writes for that storage key, and repeat that cycle when the problem slug changes.

**Tech Stack:** React 19, TypeScript, JSDOM, Testing Library, Node test runner, browser `localStorage`

## Global Constraints

- Work only in `D:\Projects\CodingMaster` on `codex/mvp05-local-draft`.
- Use the exact storage key `codingmaster:draft:${problemSlug}`.
- Treat an empty string as a valid saved draft; only a missing key falls back to starter code.
- Keep `app/problems/[slug]/page.tsx` server-rendered and preserve existing login-required behavior.
- If local storage reads or writes throw, keep the editor usable without showing a new error notice.
- Do not add dependencies, a reusable hook, database storage, account sync, save-status UI, or a reset button.
- Keep the untracked root `AGENTS.md` out of every commit.

---

### Task 1: Restore and persist problem-local editor drafts

**Files:**
- Modify: `apps/web/tests/problem-workspace.test.tsx`
- Modify: `apps/web/components/problems/problem-workspace.tsx`

**Interfaces:**
- Consumes: `ProblemWorkspace({ problemSlug: string, starterCode: string })`
- Produces: browser storage entries keyed as `codingmaster:draft:${problemSlug}`

- [ ] **Step 1: Prepare test isolation and write failing restoration tests**

In `apps/web/tests/problem-workspace.test.tsx`, add `waitFor` to the dynamically loaded Testing Library values and return it from `loadWorkspaceTestTools`:

```tsx
const [{ cleanup, fireEvent, render, screen, waitFor }, { ProblemWorkspace }] =
  await Promise.all([
    import("@testing-library/react"),
    import("../components/problems/problem-workspace"),
  ]);

return { cleanup, fireEvent, render, screen, waitFor, ProblemWorkspace };
```

Clear browser storage after every test without changing production APIs:

```tsx
afterEach(async () => {
  const { cleanup } = await import("@testing-library/react");
  cleanup();
  window.localStorage.clear();
});
```

Add these tests inside `describe("ProblemWorkspace", ...)`:

```tsx
it("restores a saved draft for the current problem", async () => {
  const { ProblemWorkspace, render, screen, waitFor } =
    await loadWorkspaceTestTools();
  window.localStorage.setItem(
    "codingmaster:draft:sum-of-numbers",
    "print('saved')",
  );

  render(
    <ProblemWorkspace
      problemSlug="sum-of-numbers"
      starterCode="# starter code"
    />,
  );

  await waitFor(() =>
    assert.equal(
      (screen.getByLabelText("Python Code") as HTMLTextAreaElement).value,
      "print('saved')",
    ),
  );
});

it("restores an intentionally empty draft", async () => {
  const { ProblemWorkspace, render, screen, waitFor } =
    await loadWorkspaceTestTools();
  window.localStorage.setItem("codingmaster:draft:sum-of-numbers", "");

  render(
    <ProblemWorkspace
      problemSlug="sum-of-numbers"
      starterCode="# starter code"
    />,
  );

  await waitFor(() =>
    assert.equal(
      (screen.getByLabelText("Python Code") as HTMLTextAreaElement).value,
      "",
    ),
  );
});
```

- [ ] **Step 2: Run the focused test file and verify RED**

Run from `apps/web`:

```powershell
corepack pnpm exec node --import tsx --test tests/problem-workspace.test.tsx
```

Expected: the two new restoration tests fail because the component still shows `starterCode`; existing tests pass.

- [ ] **Step 3: Implement minimal draft restoration**

In `problem-workspace.tsx`, change the React import and add the storage key and restoration effect:

```tsx
import { useEffect, useState } from "react";
```

```tsx
const storageKey = `codingmaster:draft:${problemSlug}`;
const [code, setCode] = useState(starterCode);
const [notice, setNotice] = useState<LoginRequiredNotice | null>(null);
const textareaId = `code-${problemSlug}`;

useEffect(() => {
  const savedDraft = window.localStorage.getItem(storageKey);
  setCode(savedDraft ?? starterCode);
}, [starterCode, storageKey]);
```

- [ ] **Step 4: Run the focused test file and verify GREEN**

Run the Step 2 command again.

Expected: all six component tests pass.

- [ ] **Step 5: Write the failing automatic-save test**

Add this test:

```tsx
it("stores editor changes under the current problem key", async () => {
  const { ProblemWorkspace, fireEvent, render, screen, waitFor } =
    await loadWorkspaceTestTools();
  render(
    <ProblemWorkspace
      problemSlug="sum-of-numbers"
      starterCode="# starter code"
    />,
  );

  fireEvent.change(screen.getByLabelText("Python Code"), {
    target: { value: "print('edited')" },
  });

  await waitFor(() =>
    assert.equal(
      window.localStorage.getItem("codingmaster:draft:sum-of-numbers"),
      "print('edited')",
    ),
  );
});
```

- [ ] **Step 6: Verify RED, then implement guarded automatic saving**

Run the focused test command. Expected: the new test fails because changes are not stored.

Add restoration ownership state beside `code`:

```tsx
const [restoredStorageKey, setRestoredStorageKey] = useState<string | null>(
  null,
);
```

At the start of the restoration effect, pause writes for the previous key, then publish the restored value and key together:

```tsx
useEffect(() => {
  setRestoredStorageKey(null);
  const savedDraft = window.localStorage.getItem(storageKey);
  setCode(savedDraft ?? starterCode);
  setRestoredStorageKey(storageKey);
}, [starterCode, storageKey]);
```

Add this effect after the restoration effect:

```tsx
useEffect(() => {
  if (restoredStorageKey !== storageKey) return;
  window.localStorage.setItem(storageKey, code);
}, [code, restoredStorageKey, storageKey]);
```

Run the focused test command again. Expected: all seven component tests pass.

- [ ] **Step 7: Add problem-change isolation coverage**

Add this regression test:

```tsx
it("switches to the next problem without reusing the previous draft", async () => {
  const { ProblemWorkspace, render, screen, waitFor } =
    await loadWorkspaceTestTools();
  window.localStorage.setItem(
    "codingmaster:draft:sum-of-numbers",
    "print('sum draft')",
  );

  const { rerender } = render(
    <ProblemWorkspace
      problemSlug="sum-of-numbers"
      starterCode="# sum starter"
    />,
  );
  await waitFor(() =>
    assert.equal(
      (screen.getByLabelText("Python Code") as HTMLTextAreaElement).value,
      "print('sum draft')",
    ),
  );

  rerender(
    <ProblemWorkspace
      problemSlug="two-sum-exists"
      starterCode="# two sum starter"
    />,
  );

  await waitFor(() =>
    assert.equal(
      (screen.getByLabelText("Python Code") as HTMLTextAreaElement).value,
      "# two sum starter",
    ),
  );
  assert.equal(
    window.localStorage.getItem("codingmaster:draft:sum-of-numbers"),
    "print('sum draft')",
  );
});
```

- [ ] **Step 8: Run the focused test file after isolation coverage**

Run the focused test command. Expected: all eight component tests pass, proving the key-aware lifecycle also handles client-side problem changes without further production code.

- [ ] **Step 9: Write failing storage-failure tests**

Add these tests. They replace only the JSDOM `Storage` boundary and assert real editor behavior, not mock calls:

```tsx
it("keeps editing available when reading local storage fails", async () => {
  const { ProblemWorkspace, fireEvent, render, screen } =
    await loadWorkspaceTestTools();
  const storagePrototype = Object.getPrototypeOf(window.localStorage) as Storage;
  const originalGetItem = storagePrototype.getItem;
  storagePrototype.getItem = () => {
    throw new Error("storage unavailable");
  };

  try {
    render(
      <ProblemWorkspace
        problemSlug="sum-of-numbers"
        starterCode="# starter code"
      />,
    );
    fireEvent.change(screen.getByLabelText("Python Code"), {
      target: { value: "print('still editable')" },
    });
    assert.equal(
      (screen.getByLabelText("Python Code") as HTMLTextAreaElement).value,
      "print('still editable')",
    );
  } finally {
    storagePrototype.getItem = originalGetItem;
  }
});

it("keeps editing available when writing local storage fails", async () => {
  const { ProblemWorkspace, fireEvent, render, screen } =
    await loadWorkspaceTestTools();
  const storagePrototype = Object.getPrototypeOf(window.localStorage) as Storage;
  const originalSetItem = storagePrototype.setItem;
  storagePrototype.setItem = () => {
    throw new Error("storage unavailable");
  };

  try {
    render(
      <ProblemWorkspace
        problemSlug="sum-of-numbers"
        starterCode="# starter code"
      />,
    );
    fireEvent.change(screen.getByLabelText("Python Code"), {
      target: { value: "print('still editable')" },
    });
    assert.equal(
      (screen.getByLabelText("Python Code") as HTMLTextAreaElement).value,
      "print('still editable')",
    );
  } finally {
    storagePrototype.setItem = originalSetItem;
  }
});
```

- [ ] **Step 10: Verify RED, then add graceful storage fallbacks**

Run the focused test command. Expected: the failure tests report uncaught storage errors.

Replace the restoration effect with:

```tsx
useEffect(() => {
  setRestoredStorageKey(null);

  let restoredCode = starterCode;
  try {
    const savedDraft = window.localStorage.getItem(storageKey);
    if (savedDraft !== null) restoredCode = savedDraft;
  } catch {
    // Keep the editor usable with starter code when storage is unavailable.
  }

  setCode(restoredCode);
  setRestoredStorageKey(storageKey);
}, [starterCode, storageKey]);
```

Replace the saving effect with:

```tsx
useEffect(() => {
  if (restoredStorageKey !== storageKey) return;

  try {
    window.localStorage.setItem(storageKey, code);
  } catch {
    // Keep in-memory editing available when persistence is unavailable.
  }
}, [code, restoredStorageKey, storageKey]);
```

Run the focused test command again. Expected: all ten component tests pass with no uncaught errors.

- [ ] **Step 11: Refactor only if needed and run full verification**

Do not extract a hook or helper for this single consumer. Run from the repository root:

```powershell
node scripts\validate-mvp02.mjs
corepack pnpm --dir apps/web test
corepack pnpm --dir apps/web lint
corepack pnpm --dir apps/web build
git diff --check
git status --short --branch
```

Expected: validator, 19 total web tests, ESLint, and production build pass; only the two MVP-05 implementation files and the untracked root `AGENTS.md` differ from the plan commit.

- [ ] **Step 12: Commit the implementation**

Stage only the implementation and test files:

```powershell
git add -- apps/web/components/problems/problem-workspace.tsx apps/web/tests/problem-workspace.test.tsx
git commit -m "feat: preserve problem drafts locally"
```

Expected: `AGENTS.md` remains untracked and absent from the commit.
