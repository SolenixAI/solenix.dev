// The one module for the repo facts every absolute URL is built from: the site's origin, the GitHub org and
// the marketplace repo. Each is written here once; every other file imports it (scripts/sot-check.ts enforces that).
// Tab icons and link-preview tags, one definition for the Next.js pages (app/layout.tsx)
// and for the pages served as raw HTML (the articles).
// The images come from `npm run share-images` (public/favicon.ico, public/og.png).

/**
 * The site's origin: the host every absolute link is built from. On Vercel it is the production domain, which Vercel
 * sets on every build and deployment: VERCEL_PROJECT_PRODUCTION_URL, with no protocol
 * (https://vercel.com/docs/environment-variables/system-environment-variables). Off Vercel (local dev, CI) it is the
 * one literal below.
 */
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://solenix.dev"
/** The site's host with no protocol: what the live-site checks compare a page's hostname with (lib/analytics.ts, scripts/origin-check.ts). */
export const SITE_HOST = new URL(SITE_URL).hostname
/** The GitHub org that owns Solenix's repos, its GitHub App and the Agents Marketplace. */
export const GITHUB_ORG = "SolenixAI"
/** The Agents Marketplace repo (owner/name): the catalog the site reads. */
export const MARKETPLACE_SLUG = `${GITHUB_ORG}/agents-marketplace`

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Solenix: Your business is a three-body problem",
}

export const ICONS = {
  icon: [
    { url: "/favicon.ico", sizes: "any" },
    { url: "/brand/out/logo-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    { url: "/brand/out/logo-light.svg", type: "image/svg+xml" },
  ],
  apple: "/brand/out/apple-touch-icon.png",
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

/** The same icons and preview tags as <head> markup, for a page Next.js does not render. */
export function headTags(page: { title: string; description: string; path: string; image?: string }) {
  const icons = ICONS.icon
    .map((i) => `<link rel="icon" href="${i.url}"${"sizes" in i ? ` sizes="${i.sizes}"` : ""}${"type" in i ? ` type="${i.type}"` : ""}${"media" in i ? ` media="${i.media}"` : ""}>`)
    .join("")
  const img = SITE_URL + (page.image ?? OG_IMAGE.url)
  return (
    icons +
    `<link rel="apple-touch-icon" href="${ICONS.apple}">` +
    `<meta property="og:type" content="website">` +
    `<meta property="og:site_name" content="Solenix">` +
    `<link rel="canonical" href="${SITE_URL}${page.path}">` +
    `<meta property="og:url" content="${SITE_URL}${page.path}">` +
    `<meta property="og:title" content="${esc(page.title)}">` +
    `<meta property="og:description" content="${esc(page.description)}">` +
    `<meta property="og:image" content="${img}">` +
    `<meta property="og:image:width" content="${OG_IMAGE.width}">` +
    `<meta property="og:image:height" content="${OG_IMAGE.height}">` +
    `<meta property="og:image:alt" content="${esc(page.image ? page.title : OG_IMAGE.alt)}">` +
    `<meta name="twitter:card" content="summary_large_image">` +
    `<meta name="twitter:image" content="${img}">`
  )
}
