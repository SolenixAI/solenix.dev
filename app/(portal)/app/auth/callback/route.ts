import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/origin";

// Where Google and email links land. Handles both shapes Supabase sends:
// ?code= (PKCE: Google, magic links) and ?token_hash=&type= (custom email templates).
// An invite with the default template arrives with tokens in the #fragment
// instead, which only the browser can read — /app/auth/finish handles that.

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  } else {
    // No code in the query: the tokens may be in the fragment. Browsers carry
    // the fragment across this redirect.
    return NextResponse.redirect(new URL(`/app/auth/finish?next=${encodeURIComponent(next)}`, url.origin));
  }
  return NextResponse.redirect(new URL("/app/login?error=link", url.origin));
}
