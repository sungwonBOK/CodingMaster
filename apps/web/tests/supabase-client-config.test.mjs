import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { readSupabaseBrowserConfig } = await import(
  "../lib/supabase/browser-client-config.mjs"
);

describe("Supabase browser client configuration", () => {
  it("returns the public URL and publishable key", () => {
    assert.deepEqual(
      readSupabaseBrowserConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
      {
        url: "https://example.supabase.co",
        publishableKey: "sb_publishable_example",
      },
    );
  });

  it("identifies a missing public URL without exposing values", () => {
    assert.throws(
      () =>
        readSupabaseBrowserConfig({
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
        }),
      /NEXT_PUBLIC_SUPABASE_URL is required/,
    );
  });

  it("identifies a missing publishable key without exposing values", () => {
    assert.throws(
      () =>
        readSupabaseBrowserConfig({
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        }),
      /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required/,
    );
  });
});
