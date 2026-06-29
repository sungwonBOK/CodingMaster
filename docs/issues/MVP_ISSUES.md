# CodingMaster MVP Issues

## [MVP-00] Initialize repository and project tooling

Acceptance criteria:
- README, `.gitignore`, `MVP_DESIGN.md`, and the implementation plan are committed.
- Local issue mirror exists under `docs/issues`.
- Repository has a GitHub remote and the initial commit is pushed.

## [MVP-01] Scaffold Next.js app shell

Acceptance criteria:
- `apps/web` is a Next.js App Router app using TypeScript, Tailwind CSS, and ESLint.
- Landing page exists.
- Placeholder routes exist for `/problems`, `/problems/[slug]`, and `/me`.
- Web build completes successfully.

## [MVP-02] Add Supabase schema and seed problem format

Acceptance criteria:
- Initial migration creates `problems`, `test_cases`, `hints`, `submissions`, `hint_usages`, `give_up_events`, `thinking_step_analyses`, and `review_notes`.
- RLS allows public reads for problems and public test cases.
- User-owned records are readable and writable only by their owner.
- Seed JSON includes at least `sum-of-numbers` and `two-sum-exists`.

## [MVP-03] Implement public problem bank list/detail

Acceptance criteria:
- `/problems` lists seed problem title, difficulty, algorithm tags, and thinking-step tags.
- `/problems/[slug]` shows statement, input/output description, public examples, and Python textarea.
- Hints, explanation, and answer code are not visible before the gated flow.

## [MVP-04] Add Supabase Auth login gates

Acceptance criteria:
- Supabase client helpers exist.
- `.env.example` documents required public Supabase values.
- Login-gated actions clearly show login-required feedback when the user is signed out.

## [MVP-05] Add code editor and local draft preservation

Acceptance criteria:
- Problem workspace has a Python editor.
- Drafts persist per problem slug in local storage.
- Refreshing the page restores the draft.

## [MVP-06] Implement runner boundary and Python example execution

Acceptance criteria:
- `@codingmaster/runner` exposes `RunnerClient`.
- Local Python runner supports stdin, stdout, stderr, timeout, and output limit handling.
- Runner tests cover successful execution and timeout.

## [MVP-07] Implement submit judging and submission storage

Acceptance criteria:
- Judge service runs all cases in order and stops on first failure.
- Judge result distinguishes accepted, wrong answer, timeout, and runtime error.
- Submission records are persisted for logged-in users.

## [MVP-08] Implement hints and hint usage tracking

Acceptance criteria:
- Logged-in users can reveal hints in level order.
- Hint usage is persisted with problem and user ownership.
- Signed-out users see login-required feedback.

## [MVP-09] Implement give-up flow, explanation, and answer reveal

Acceptance criteria:
- Logged-in users can give up on a problem.
- Give-up event is persisted.
- Explanation and answer code are shown only after give-up.

## [MVP-10] Implement evidence-based thinking-step analysis

Acceptance criteria:
- Give-up analysis uses viewed hint level, attempt count, failed case type, and problem tags.
- Analysis returns weak step, confidence, evidence, and explanation.
- Tests cover at least a large-input complexity case.

## [MVP-11] Implement simple review note and my page stats

Acceptance criteria:
- Logged-in users can save a short review note per problem.
- `/me` shows basic solved, attempted, hint, and give-up stats.
- User-owned review records are protected by RLS.

## [MVP-12] Polish UX, empty states, and build verification

Acceptance criteria:
- Core pages have usable empty, loading, and error states.
- Mobile layout remains readable.
- `pnpm test` and `pnpm build` pass before MVP handoff.
