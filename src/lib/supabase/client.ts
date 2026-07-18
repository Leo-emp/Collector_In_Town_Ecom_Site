import { createBrowserClient as createClient } from "@supabase/ssr";
import type { Database } from "./types";

// Browser-side Supabase client — used in client components
// Respects RLS policies based on the logged-in user's session
export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
