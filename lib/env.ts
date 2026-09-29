// One place that knows the env var names. Supabase's values come from the
// Vercel Marketplace integration, which has used both the older (anon /
// service_role) and newer (publishable / secret) key names — accept either.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Server only. Bypasses row-level security — never import from a client component. */
export function supabaseSecretKey() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return key;
}

export const ADMIN_EMAIL = "jager@solenix.dev";

/** Where auth emails send people back to. Production is solenix.dev; previews use their own URL. */
export function siteOrigin(requestOrigin?: string) {
  if (requestOrigin) return requestOrigin;
  if (process.env.VERCEL_ENV === "production") return "https://solenix.dev";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const configured = {
  supabase: () => Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY),
  stripe: () => Boolean(process.env.STRIPE_SECRET_KEY),
  vercel: () => Boolean(process.env.VERCEL_API_TOKEN),
  posthog: () => Boolean(process.env.POSTHOG_PERSONAL_API_KEY && process.env.POSTHOG_PROJECT_ID),
};
