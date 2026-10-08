import { readFile } from "node:fs/promises"
import path from "node:path"
import { servePage } from "@/lib/site-page"

// The homepage is the Open Design file design/home.html, served as-is.
// That file is the one source of truth for the page; edit it in Open Design, never here.
// lib/site-page.ts adds what every page shares: the nav, the head tags and measurement.
export const dynamic = "force-static"

export async function GET() {
  const html = await readFile(path.join(process.cwd(), "design/home.html"), "utf8")
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "Solenix"
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ""
  return servePage(html, { title, description, path: "/" })
}
