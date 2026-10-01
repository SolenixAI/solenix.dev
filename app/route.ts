import { readFile } from "node:fs/promises"
import path from "node:path"
import { POSTHOG_SNIPPET, SPEED_INSIGHTS_SNIPPET } from "@/lib/analytics"

// The homepage is the Open Design file design/home.html, served as-is.
// That file is the one source of truth; edit it in Open Design, never here.
// The only things added at serve time are measurement (lib/analytics.ts).
export const dynamic = "force-static"

export async function GET() {
  const html = await readFile(path.join(process.cwd(), "design/home.html"), "utf8")
  return new Response(html.replace("</head>", `${POSTHOG_SNIPPET}${SPEED_INSIGHTS_SNIPPET}</head>`), {
    headers: { "content-type": "text/html; charset=utf-8" },
  })
}
