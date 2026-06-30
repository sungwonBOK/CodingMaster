import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  getDifficultyMeta,
  getProblemDetail,
  listProblemSummaries,
  toDisplayTag,
} = await import("../lib/problems/problem-repository.mjs");

describe("problem repository", () => {
  it("lists public problem summaries with extensible difficulty and tag metadata", () => {
    const summaries = listProblemSummaries();

    assert.equal(summaries.length, 2);

    const sum = summaries.find((problem) => problem.slug === "sum-of-numbers");
    assert.ok(sum, "sum-of-numbers should be listed");
    assert.equal(sum.title, "Sum of Numbers");
    assert.deepEqual(sum.difficulty, {
      key: "easy",
      label: "Easy",
      rank: 1,
      tone: "green",
    });
    assert.deepEqual(sum.algorithmTags[0], {
      key: "implementation",
      label: "Implementation",
      group: "algorithm",
    });
    assert.deepEqual(sum.thinkingStepTags[0], {
      key: "input_parsing",
      label: "Input Parsing",
      group: "thinkingStep",
    });
    assert.equal("answerCode" in sum, false);
    assert.equal("hints" in sum, false);
    assert.equal("explanation" in sum, false);
  });

  it("returns public problem detail without leaking hidden solution content", () => {
    const problem = getProblemDetail("two-sum-exists");

    assert.ok(problem, "two-sum-exists should be found");
    assert.equal(problem.title, "Two Sum Exists");
    assert.match(problem.statement, /two different positions/i);
    assert.equal(problem.publicExamples.length, 2);
    assert.deepEqual(
      problem.publicExamples.map((testCase) => testCase.caseType),
      ["sample", "no_pair"],
    );
    assert.equal(problem.editor.language, "python");
    assert.match(problem.editor.starterCode, /Write your solution/);
    assert.equal("answerCode" in problem, false);
    assert.equal("hints" in problem, false);
    assert.equal("explanation" in problem, false);
    assert.equal("testCases" in problem, false);
  });

  it("normalizes future difficulty and tag keys without changing page code", () => {
    assert.deepEqual(getDifficultyMeta("expert"), {
      key: "expert",
      label: "Expert",
      rank: 99,
      tone: "slate",
    });

    assert.deepEqual(toDisplayTag("graph_search", "algorithm"), {
      key: "graph_search",
      label: "Graph Search",
      group: "algorithm",
    });
  });
});
