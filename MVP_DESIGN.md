# CodingMaster MVP Design

## Product Direction

CodingMaster helps learners understand where their coding-test reasoning breaks down. The MVP should make problem solving observable through attempts, hints, give-up behavior, failed case types, and a lightweight thinking-step analysis.

## Included

- Public landing page and problem bank.
- Public problem detail with statement, examples, and Python editor.
- Supabase login gate for hints, execution, submission, give-up, explanation, and analysis.
- Python-only runner behind a replaceable `RunnerClient` interface.
- Supabase schema and seed problem data.
- Basic review note and profile stats after the first vertical slice.

## Excluded

- Admin problem editor.
- Similar problem recommendation.
- Weekly reports.
- Analysis-quality feedback.
- AST/static code analysis.
- Multi-language execution.
- Payment.
- Study group features.

## Architecture

- `apps/web`: Next.js App Router UI, API handlers, auth gates, and Supabase helpers.
- `packages/runner`: runner boundary and local Python runner implementation.
- `supabase`: migrations and seed data.
- `docs`: decisions, plans, and local issue mirrors.

Supabase owns auth and persistence. Code execution starts with a local Python process behind the runner interface so the judge flow can later move to Docker or another sandbox without changing app-level behavior.
