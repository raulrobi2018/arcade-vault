import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client for Client Components.
// Env vars are read as literals so Next can inline them in the bundle.
export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_URL");
    if (!key) {
        throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    }

    return createBrowserClient(url, key);
}
