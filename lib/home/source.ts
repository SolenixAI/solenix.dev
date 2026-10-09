import { readFile } from "node:fs/promises";
import path from "node:path";
import { fillSiteMarkers } from "@/lib/site-nav";

// The homepage's source, read from design/home.html, the one source of its markup and CSS: its title and description,
// its stylesheet, and its body markup. The 3D world is not in the body: the site layout mounts it
// (components/space/world.tsx), and the homepage's own scripts are lib/home/*.ts.
export async function homeSource() {
  const html = await readFile(path.join(process.cwd(), "design/home.html"), "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "Solenix";
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? "";
  return { title, description, css, body: fillSiteMarkers(body) };
}
