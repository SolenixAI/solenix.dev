import "server-only";
import { headers } from "next/headers";

/** The origin this request came in on — solenix.dev, a preview URL or localhost. */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Only same-site paths under /app are allowed as a post-sign-in destination. */
export function safeNext(next: string | null | undefined, fallback = "/app") {
  if (!next || !next.startsWith("/app") || next.startsWith("//")) return fallback;
  return next;
}
