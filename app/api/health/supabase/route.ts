import { createClient } from "@/app/lib/supabase/server";

type HealthResponse = { ok: true } | { ok: false; error: string };

// There are no tables yet, so the probe queries one that does not exist.
// A valid key makes PostgREST answer PGRST205 (table not found); a bad or
// missing key is rejected earlier with a 401.
const TABLE_NOT_FOUND = "PGRST205";

function fail(error: string) {
    return Response.json({ ok: false, error } satisfies HealthResponse, {
        status: 503,
    });
}

export async function GET() {
    let supabase;
    try {
        supabase = await createClient();
    } catch {
        return fail("Supabase is not configured");
    }

    try {
        const { error } = await supabase.from("_health").select("*").limit(1);

        if (error && error.code !== TABLE_NOT_FOUND) {
            return fail("Supabase rejected the request");
        }
    } catch {
        return fail("Could not reach Supabase");
    }

    return Response.json({ ok: true } satisfies HealthResponse);
}
