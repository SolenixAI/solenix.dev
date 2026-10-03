import "server-only"
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/env"

/**
 * Which sign-in providers Supabase has switched on, read from Supabase itself,
 * so the sign-in page never offers a button that would fail.
 */
export async function enabledProviders(): Promise<{ google: boolean; email: boolean }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_PUBLIC_KEY },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(String(res.status))
    const { external } = (await res.json()) as { external: Record<string, boolean> }
    return { google: Boolean(external.google), email: external.email !== false }
  } catch {
    return { google: false, email: true }
  }
}
