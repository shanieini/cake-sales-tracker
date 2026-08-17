import { createClient } from "@supabase/supabase-js";

// No generated `Database` type here (no codegen step in this app), so the
// client is typed loosely (`any` schema) rather than pretending to know
// table shapes it doesn't — `src/lib/store.ts`'s `toRow`/`fromRow`
// functions are what actually keep reads/writes honest about column names.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createClient<any>> | null = null;

/**
 * Lazily-created singleton browser Supabase client. This app is entirely
 * client-rendered (no server components/actions touch data), so a plain
 * `@supabase/supabase-js` client is enough — no `@supabase/ssr` cookie
 * plumbing needed. The session itself is persisted by the client in the
 * browser's own storage, separate from the `cake-sales:*` keys this app
 * already uses for its data (see `src/lib/store.ts`).
 */
export function getSupabaseClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY " +
          "— see the README's \"Setting up Supabase\" section.",
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client = createClient<any>(url, anonKey);
  }
  return client;
}
