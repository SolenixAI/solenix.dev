"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin, safeNext } from "@/lib/origin";

export type LinkState = { status: "idle" | "sent" | "invalid" | "error"; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function sendMagicLink(_prev: LinkState, form: FormData): Promise<LinkState> {
  const email = String(form.get("email") ?? "").trim();
  if (!EMAIL.test(email)) return { status: "invalid", email };

  const next = safeNext(String(form.get("next") ?? ""));
  const origin = await requestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Only people we have invited get a link. Anyone else is told the same
      // thing, so the form never reveals who has a portal.
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/app/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error && !/signups not allowed|not found/i.test(error.message)) {
    console.error("magic link", error.message);
    return { status: "error", email };
  }
  return { status: "sent", email };
}

export async function signInWithGoogle(form: FormData) {
  const next = safeNext(String(form.get("next") ?? ""));
  const origin = await requestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/app/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/app/login?error=google");
  redirect(data.url);
}
