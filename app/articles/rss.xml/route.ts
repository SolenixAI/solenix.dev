import { listArticles } from "@/lib/articles"
import { SITE_URL } from "@/lib/site-meta"

// RSS for readers and aggregators, built from the same article folders.
export const dynamic = "force-static"

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export async function GET() {
  const items = (await listArticles())
    .map(
      (a) => `<item><title>${x(a.title)}</title><link>${SITE_URL}${a.path}</link><guid>${SITE_URL}${a.path}</guid>` +
        `<description>${x(a.description)}</description>${a.date ? `<pubDate>${new Date(`${a.date}T12:00:00Z`).toUTCString()}</pubDate>` : ""}</item>`,
    )
    .join("")
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Solenix articles</title><link>${SITE_URL}/articles</link>` +
    `<description>Explorable stories about what AI can do now.</description><language>en-ca</language>${items}</channel></rss>`
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } })
}
