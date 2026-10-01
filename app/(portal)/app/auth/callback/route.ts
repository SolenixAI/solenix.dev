import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/origin";

// Where Google and email links land. Handles both shapes Supabase sends:
// ?code= (PKCE: Google, magic links) and ?token_hash=&type= (custom email templates).
// An email link (token_hash) is never spent on GET: mail scanners open links,
// so GET sends it to /app/auth/confirm, whose button POSTs back here.
// An invite with the default template arrives with tokens in the #fragment
// instead, which only the browser can read — /app/auth/finish handles that.

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  } else if (tokenHash && type) {
    const confirm = new URL("/app/auth/confirm", url.origin);
    confirm.search = new URLSearchParams({ token_hash: tokenHash, type, next }).toString();
    return NextResponse.redirect(confirm);
  } else {
    // No code in the query: the tokens may be in the fragment. Browsers carry
    // the fragment across this redirect.
    return NextResponse.redirect(new URL(`/app/auth/finish?next=${encodeURIComponent(next)}`, url.origin));
  }
  return NextResponse.redirect(new URL("/app/login?error=link", url.origin));
}

// The Continue button on /app/auth/confirm. Only a person submits this form.
export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  const form = await request.formData();
  const tokenHash = form.get("token_hash");
  const type = form.get("type");
  const next = safeNext(typeof form.get("next") === "string" ? (form.get("next") as string) : null);
  if (typeof tokenHash === "string" && typeof type === "string") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
    if (!error) return NextResponse.redirect(new URL(next, url.origin), 303);
  }
  return NextResponse.redirect(new URL("/app/login?error=link", url.origin), 303);
}
