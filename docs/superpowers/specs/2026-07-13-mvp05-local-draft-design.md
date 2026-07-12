# MVP-05 Local Draft Preservation Design

## Goal

Keep the existing Python editor available on every problem detail page and preserve each problem's in-progress code in the browser across refreshes.

## Scope

This issue extends the existing `ProblemWorkspace` client component. The server-rendered problem page, problem repository, login-required notices, and protected Run, Submit, and Hint actions remain unchanged.

No editor library, database persistence, account synchronization, draft reset button, save-status UI, or cross-device synchronization is included.

## Storage Model

Each problem uses the local storage key `codingmaster:draft:${problemSlug}`. The stored value is the complete editor text.

- A missing key means the starter code should be shown.
- An empty string is a valid saved draft and must be restored as an empty editor.
- Different problem slugs must never read or overwrite one another's drafts.

## Interaction Flow

`ProblemWorkspace` initially renders its existing `starterCode`. After the component mounts in the browser, it reads the current problem's storage key. If a value exists, including an empty string, the component replaces the editor content with that value. If client navigation changes `problemSlug`, the component pauses saving and repeats the same restoration cycle with the new problem's starter code and storage key.

Automatic saving begins only after the initial restoration attempt finishes. This ordering prevents the initial starter code from overwriting a previously saved draft. Every subsequent editor change stores the latest complete value under the current problem's key.

## Failure Handling

Local storage access is optional browser behavior. If reading or writing throws, the editor continues to work for the current page session and no error notice interrupts the user. Existing login-required notices remain independent and continue to work.

## Implementation Boundary

The persistence lifecycle stays inside `apps/web/components/problems/problem-workspace.tsx` because only that client component owns the controlled editor state. A small restoration flag coordinates the read-before-write ordering. No reusable hook or new dependency is introduced for this single consumer.

Tests extend `apps/web/tests/problem-workspace.test.tsx` and exercise the component through the editor UI and browser storage rather than testing React internals.

## Test Strategy

Use RED-GREEN-REFACTOR for each behavior:

1. A saved draft for the current problem replaces starter code after mount.
2. Editing writes the latest code under the current problem's key.
3. An empty saved draft restores an empty editor.
4. Drafts remain isolated by problem slug, including when the rendered slug changes.
5. Read and write failures leave the editor usable.
6. Existing starter-code and login-notice tests continue to pass.

After focused component tests pass, run the repository validator, the complete web test suite, ESLint, and the Next.js production build.
