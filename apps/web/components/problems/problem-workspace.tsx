"use client";

import { useState } from "react";
import {
  getLoginRequiredNotice,
  type LoginRequiredNotice,
  type ProtectedAction,
} from "@/lib/auth/login-gate.mjs";

type ProblemWorkspaceProps = {
  problemSlug: string;
  starterCode: string;
};

const protectedActions: Array<{
  action: ProtectedAction;
  label: string;
  primary?: boolean;
}> = [
  { action: "run", label: "Run" },
  { action: "submit", label: "Submit", primary: true },
  { action: "hint", label: "Hint" },
];

export function ProblemWorkspace({
  problemSlug,
  starterCode,
}: ProblemWorkspaceProps) {
  const [code, setCode] = useState(starterCode);
  const [notice, setNotice] = useState<LoginRequiredNotice | null>(null);
  const textareaId = `code-${problemSlug}`;

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <label className="mb-3 block text-sm font-semibold" htmlFor={textareaId}>
        Python Code
      </label>
      <textarea
        className="h-80 w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 outline-none focus:border-blue-500"
        id={textareaId}
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {protectedActions.map(({ action, label, primary }) => (
          <button
            className={
              primary
                ? "rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
            }
            key={action}
            type="button"
            onClick={() => setNotice(getLoginRequiredNotice(action))}
          >
            {label}
          </button>
        ))}
      </div>
      {notice ? (
        <div
          className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"
          role="alert"
        >
          <p className="font-semibold">{notice.title}</p>
          <p className="mt-1">{notice.message}</p>
        </div>
      ) : null}
    </aside>
  );
}
