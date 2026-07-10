import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseBrowserConfig } from "./browser-client-config.mjs";

export function createClient() {
  const { url, publishableKey } = readSupabaseBrowserConfig({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  return createBrowserClient(url, publishableKey);
}
