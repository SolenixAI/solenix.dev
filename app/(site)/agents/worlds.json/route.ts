import { getCatalog, MARKETPLACE_REPO, orbit } from "@/lib/marketplace"

// The Agents Marketplace for AI agents: the same catalog the page shows, with every piece's live
// facts, as JSON. Read live on each request, like the page.
export async function GET() {
  const catalog = await getCatalog()
  if (!catalog) return Response.json({ error: "The catalog could not be read just now.", source: MARKETPLACE_REPO }, { status: 503 })
  const parts = await Promise.all(catalog.map(async (e) => {
    const { sun, planets } = await orbit(e)
    return { id: e.id, part: e.part, name: e.name, maker: e.maker, for: e.for, site: e.site, sentence: e.sentence, setup: e.setup, page: `https://solenix.dev/agents?world=${e.id}`, maker_source: sun, pieces: planets }
  }))
  return Response.json({
    about: "Paste a part's sentence into any AI agent; it installs everything that tool's makers built for AI, then proves it works.",
    source: MARKETPLACE_REPO,
    specs: catalog[0]?.specs ?? {},
    read: new Date().toISOString(),
    parts,
  })
}
