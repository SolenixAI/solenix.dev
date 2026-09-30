import { readFile } from "node:fs/promises"
import path from "node:path"

// design/home.html links "tokens.css"; serve the one design/tokens.css.
export const dynamic = "force-static"

export async function GET() {
  const css = await readFile(path.join(process.cwd(), "design/tokens.css"), "utf8")
  return new Response(css, { headers: { "content-type": "text/css; charset=utf-8" } })
}
