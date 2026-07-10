export type SupabaseBrowserConfig = {
  url: string;
  publishableKey: string;
};

export function readSupabaseBrowserConfig(
  env: Record<string, string | undefined>,
): SupabaseBrowserConfig;
