import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/lib/env";

// Refreshes the Supabase session on every /app request and sends signed-out
// visitors to the sign-in page. The public site never passes through here.

const PUBLIC_APP_PATHS = ["/app/login", "/app/auth/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_APP_PATHS.some((p) => pathname === p || pathname.startsWith(p));

  if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
    // Not connected yet: the login page explains that, everything else goes there.
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/app/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() verifies the JWT; do not trust getSession() on the server.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  if (!signedIn && !isPublic) {
    const url = new URL("/app/login", request.url);
    if (pathname !== "/app") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (signedIn && pathname === "/app/login") {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
