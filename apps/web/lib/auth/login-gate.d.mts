export type ProtectedAction = "run" | "submit" | "hint";

export type LoginRequiredNotice = {
  title: string;
  message: string;
};

export function getLoginRequiredNotice(
  action: ProtectedAction,
): LoginRequiredNotice;
