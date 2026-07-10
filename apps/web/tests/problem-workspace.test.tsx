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

async function loadWorkspaceTestTools() {
  const [{ cleanup, fireEvent, render, screen }, { ProblemWorkspace }] =
    await Promise.all([
      import("@testing-library/react"),
      import("../components/problems/problem-workspace"),
    ]);

  return { cleanup, fireEvent, render, screen, ProblemWorkspace };
}

afterEach(async () => {
  const { cleanup } = await import("@testing-library/react");
  cleanup();
});

describe("ProblemWorkspace", () => {
  it("renders the starter code without an initial login notice", async () => {
    const { ProblemWorkspace, render, screen } =
      await loadWorkspaceTestTools();

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
    it(`shows a login-required notice for ${button}`, async () => {
      const { ProblemWorkspace, fireEvent, render, screen } =
        await loadWorkspaceTestTools();

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
