import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const migrationPath = join(rootDir, "supabase", "migrations", "0001_initial_schema.sql");
const seedPath = join(rootDir, "supabase", "seed", "problems.json");

const requiredTables = [
  "problems",
  "test_cases",
  "hints",
  "submissions",
  "hint_usages",
  "give_up_events",
  "thinking_step_analyses",
  "review_notes"
];

const ownerScopedTables = [
  "submissions",
  "hint_usages",
  "give_up_events",
  "thinking_step_analyses",
  "review_notes"
];

const requiredProblemFields = [
  "slug",
  "title",
  "difficulty",
  "statement",
  "inputDescription",
  "outputDescription",
  "constraintsText",
  "algorithmTags",
  "thinkingStepTags",
  "failurePatternTags",
  "testCases",
  "hints",
  "explanation",
  "answerCode"
];

function assertContains(haystack, needle, message) {
  assert.ok(haystack.includes(needle), message);
}

function assertPattern(haystack, pattern, message) {
  assert.match(haystack, pattern, message);
}

const sql = readFileSync(migrationPath, "utf8").toLowerCase();

for (const table of requiredTables) {
  assertPattern(sql, new RegExp(`create\\s+table\\s+public\\.${table}\\b`), `${table} table is missing`);
  assertPattern(sql, new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`), `${table} RLS is missing`);
}

assertPattern(sql, /create\s+policy\s+"public can read problems"/, "public problems select policy is missing");
assertPattern(sql, /create\s+policy\s+"public can read public test cases"/, "public test case select policy is missing");
assertPattern(sql, /create\s+policy\s+"authenticated can read hints"/, "authenticated hints select policy is missing");

for (const table of ownerScopedTables) {
  assertPattern(sql, new RegExp(`create\\s+policy\\s+"users can read own ${table}"[\\s\\S]+?on\\s+public\\.${table}[\\s\\S]+?for\\s+select[\\s\\S]+?to\\s+authenticated[\\s\\S]+?using\\s*\\(\\s*\\(select\\s+auth\\.uid\\(\\)\\)\\s*=\\s*user_id\\s*\\)`), `${table} owner select policy is missing`);
  assertPattern(sql, new RegExp(`create\\s+policy\\s+"users can insert own ${table}"[\\s\\S]+?on\\s+public\\.${table}[\\s\\S]+?for\\s+insert[\\s\\S]+?to\\s+authenticated[\\s\\S]+?with\\s+check\\s*\\(\\s*\\(select\\s+auth\\.uid\\(\\)\\)\\s*=\\s*user_id\\s*\\)`), `${table} owner insert policy is missing`);
}

assertContains(sql, "grant select on public.problems to anon, authenticated", "problems grant is missing");
assertContains(sql, "grant select on public.test_cases to anon, authenticated", "test_cases grant is missing");
assertContains(sql, "grant select on public.hints to authenticated", "hints grant is missing");

const problems = JSON.parse(readFileSync(seedPath, "utf8"));
assert.ok(Array.isArray(problems), "seed must be an array");

const slugs = new Set(problems.map((problem) => problem.slug));
assert.ok(slugs.has("sum-of-numbers"), "sum-of-numbers seed is missing");
assert.ok(slugs.has("two-sum-exists"), "two-sum-exists seed is missing");

for (const problem of problems) {
  for (const field of requiredProblemFields) {
    assert.ok(Object.hasOwn(problem, field), `${problem.slug ?? "unknown"} is missing ${field}`);
  }

  assert.ok(Array.isArray(problem.algorithmTags), `${problem.slug} algorithmTags must be an array`);
  assert.ok(Array.isArray(problem.thinkingStepTags), `${problem.slug} thinkingStepTags must be an array`);
  assert.ok(Array.isArray(problem.failurePatternTags), `${problem.slug} failurePatternTags must be an array`);
  assert.ok(Array.isArray(problem.testCases) && problem.testCases.length > 0, `${problem.slug} needs test cases`);
  assert.ok(Array.isArray(problem.hints) && problem.hints.length > 0, `${problem.slug} needs hints`);

  for (const testCase of problem.testCases) {
    assert.equal(typeof testCase.input, "string", `${problem.slug} test case input must be string`);
    assert.equal(typeof testCase.expectedOutput, "string", `${problem.slug} test case expectedOutput must be string`);
    assert.equal(typeof testCase.isPublic, "boolean", `${problem.slug} test case isPublic must be boolean`);
    assert.equal(typeof testCase.caseType, "string", `${problem.slug} test case caseType must be string`);
  }
}

const twoSum = problems.find((problem) => problem.slug === "two-sum-exists");
const twoSumCaseTypes = new Set(twoSum.testCases.map((testCase) => testCase.caseType));
assert.ok(twoSumCaseTypes.has("large_input"), "two-sum-exists needs a large_input test case");
assert.ok(twoSumCaseTypes.has("duplicate_data"), "two-sum-exists needs a duplicate_data test case");

console.log("mvp02 validation ok");
