export type DifficultyMeta = {
  key: string;
  label: string;
  rank: number;
  tone: string;
};

export type DisplayTag = {
  key: string;
  label: string;
  group: string;
};

export type ProblemSummary = {
  slug: string;
  title: string;
  difficulty: DifficultyMeta;
  algorithmTags: DisplayTag[];
  thinkingStepTags: DisplayTag[];
};

export type PublicExample = {
  input: string;
  expectedOutput: string;
  caseType: string;
};

export type ProblemDetail = ProblemSummary & {
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraintsText: string;
  publicExamples: PublicExample[];
  editor: {
    language: "python";
    starterCode: string;
  };
};

export function getDifficultyMeta(key: string): DifficultyMeta;
export function toDisplayTag(key: string, group: string): DisplayTag;
export function listProblemSummaries(): ProblemSummary[];
export function getProblemDetail(slug: string): ProblemDetail | null;
