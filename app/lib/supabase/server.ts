import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client (Server Components, route handlers, actions).
// Uses only the publishable key; access control belongs in RLS policies.
export async function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_URL");
    if (!key) {
        throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    }

    const cookieStore = await cookies();

    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                // Cookies cannot be set while rendering a Server Component.
                // Ignored there; route handlers and actions can set them.
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options),
                    );
                } catch {}
            },
        },
    });
}
