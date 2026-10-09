import { listArticles } from "@/lib/articles"
import { getCatalog, MARKETPLACE_REPO } from "@/lib/marketplace"
import { SITE_URL } from "@/lib/site-meta"

// llms.txt (https://llmstxt.org): the site, for AI agents, in Markdown. Derived live from the same
// sources the pages read, so it lists every world and article the moment they exist.
export async function GET() {
  const [catalog, articles] = await Promise.all([getCatalog(), listArticles()])
  const worlds = (catalog ?? []).map((e) => `- [${e.name}](${SITE_URL}/agents?world=${e.id}): ${e.for} Set up: "${e.sentence}"`)
  const body = [
    "# Solenix",
    "",
    "> One tech expert for small businesses in St. John's, Newfoundland and Labrador: one AI at the centre of the tools a business already uses.",
    "",
    "## Agents Marketplace",
    "",
    `- [Catalog as JSON](${SITE_URL}/agents/worlds.json): every part, its one-sentence setup, and live facts for each piece`,
    `- [Source](${MARKETPLACE_REPO}): install with \`npx skills add SolenixAI/agents-marketplace\``,
    ...worlds,
    "",
    "## Articles",
    "",
    ...articles.map((a) => `- [${a.title}](${SITE_URL}${a.path})`),
    "",
  ].join("\n")
  return new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } })
}
