# MVP-04 Supabase Login Gate Design

## Goal

Complete GitHub issue #5 by adding the minimum Supabase browser client setup and a clear login-required response for protected problem actions.

## Scope

- Add a browser Supabase client helper using the current `@supabase/ssr` API.
- Document the required public Supabase URL and publishable key in `.env.example`.
- Keep the problem detail page server-rendered.
- Move only the code editor and protected controls into a client component.
- Show a Korean login-required notice when an unauthenticated user clicks Run, Submit, or Hint.

Actual sign-in screens, OAuth providers, callback handling, server session cookies, and route protection are out of scope for this issue.

## Architecture

`app/problems/[slug]/page.tsx` continues to load public problem data and renders a `ProblemWorkspace` client component with the problem slug and starter code. The workspace owns editor state and login-gate presentation state. A small pure login-gate module maps each protected action to the shared notice model, keeping behavior independently testable without converting the page or repository layer to client-side code.

`lib/supabase/client.ts` exports a browser-client factory based on `createBrowserClient`. It reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only when called, so builds remain possible before live project credentials are supplied. Missing configuration produces an explicit setup error rather than constructing a broken client.

## Interaction Flow

1. A public visitor opens a problem detail page and can read the statement and edit the starter code.
2. The visitor clicks Run, Submit, or Hint.
3. The workspace records the requested protected action and renders the login-required notice.
4. No execution, submission, hint retrieval, or Supabase network request occurs in MVP-04.

## Error Handling and Security

- Only public browser variables are documented; no live keys or service-role secrets are committed.
- Supabase configuration errors identify the missing variable without printing credential values.
- The UI gate is an MVP affordance, not an authorization boundary. Later issues must enforce authenticated ownership on server and database operations.

## Testing and Verification

- TDD starts with failing Node tests for the protected-action model and missing Supabase configuration.
- Implement the smallest production code needed to pass each failing test.
- Run the complete web test suite, ESLint, and the production build.
- Start the app and verify in a browser that Run, Submit, and Hint each reveal the login-required notice while public problem content remains available.
- Review the final diff and ensure the local-only `AGENTS.md` is not included in either commit.

## Completion Evidence

- `apps/web/lib/supabase/client.ts` provides the browser client helper.
- `apps/web/.env.example` lists both required public variables.
- The rendered problem workspace exposes Run, Submit, and Hint controls and shows the login-required notice for each.
- All automated checks pass and GitHub issue #5 is closed after the verified commits are pushed.
