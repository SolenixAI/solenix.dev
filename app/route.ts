import { readFile } from "node:fs/promises"
import path from "node:path"
import { POSTHOG_SNIPPET, SPEED_INSIGHTS_SNIPPET } from "@/lib/analytics"
import { headTags } from "@/lib/site-meta"

// The homepage is the Open Design file design/home.html, served as-is.
// That file is the one source of truth; edit it in Open Design, never here.
// The only things added at serve time are measurement (lib/analytics.ts) and the tab icon and
// link-preview tags (lib/site-meta.ts), built from the page's own title and description.
export const dynamic = "force-static"

export async function GET() {
  const html = await readFile(path.join(process.cwd(), "design/home.html"), "utf8")
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "Solenix"
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ""
  const head = headTags({ title, description, path: "/" }) + POSTHOG_SNIPPET + SPEED_INSIGHTS_SNIPPET
  return new Response(html.replace("</head>", `${head}</head>`), {
    headers: { "content-type": "text/html; charset=utf-8" },
  })
}
