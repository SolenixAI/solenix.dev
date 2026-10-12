import { securityTxt } from "@/lib/security-txt"

// /.well-known/security.txt (https://securitytxt.org): the file a researcher reads to find where to report a security
// problem. Its text is lib/security-txt.ts.
export const dynamic = "force-static"

export function GET() {
  return new Response(securityTxt(), { headers: { "content-type": "text/plain; charset=utf-8" } })
}
