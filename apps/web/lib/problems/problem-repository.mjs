import { readFileSync } from "node:fs";
import { join } from "node:path";

const seedPath = join(process.cwd(), "..", "..", "supabase", "seed", "problems.json");
const seedProblems = JSON.parse(readFileSync(seedPath, "utf8"));

const difficultyDefinitions = {
  easy: { label: "Easy", rank: 1, tone: "green" },
  medium: { label: "Medium", rank: 2, tone: "amber" },
  hard: { label: "Hard", rank: 3, tone: "red" },
};

function titleizeKey(key) {
  return key
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function getDifficultyMeta(key) {
  const definition = difficultyDefinitions[key] ?? {
    label: titleizeKey(key),
    rank: 99,
    tone: "slate",
  };

  return {
    key,
    ...definition,
  };
}

export function toDisplayTag(key, group) {
  return {
    key,
    label: titleizeKey(key),
    group,
  };
}

function toSummary(problem) {
  return {
    slug: problem.slug,
    title: problem.title,
    difficulty: getDifficultyMeta(problem.difficulty),
    algorithmTags: problem.algorithmTags.map((tag) => toDisplayTag(tag, "algorithm")),
    thinkingStepTags: problem.thinkingStepTags.map((tag) => toDisplayTag(tag, "thinkingStep")),
  };
}

function toPublicExample(testCase) {
  return {
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    caseType: testCase.caseType,
  };
}

function toDetail(problem) {
  return {
    ...toSummary(problem),
    statement: problem.statement,
    inputDescription: problem.inputDescription,
    outputDescription: problem.outputDescription,
    constraintsText: problem.constraintsText,
    publicExamples: problem.testCases.filter((testCase) => testCase.isPublic).map(toPublicExample),
    editor: {
      language: "python",
      starterCode: "# Write your solution here\n",
    },
  };
}

export function listProblemSummaries() {
  return seedProblems.map(toSummary).sort((a, b) => a.difficulty.rank - b.difficulty.rank || a.title.localeCompare(b.title));
}

export function getProblemDetail(slug) {
  const problem = seedProblems.find((candidate) => candidate.slug === slug);
  return problem ? toDetail(problem) : null;
}
