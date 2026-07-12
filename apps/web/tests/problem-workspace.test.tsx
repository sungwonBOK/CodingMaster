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
  const [{ cleanup, fireEvent, render, screen, waitFor }, { ProblemWorkspace }] =
    await Promise.all([
      import("@testing-library/react"),
      import("../components/problems/problem-workspace"),
    ]);

  return { cleanup, fireEvent, render, screen, waitFor, ProblemWorkspace };
}

afterEach(async () => {
  const { cleanup } = await import("@testing-library/react");
  cleanup();
  window.localStorage.clear();
});

describe("ProblemWorkspace", () => {
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
