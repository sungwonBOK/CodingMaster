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
