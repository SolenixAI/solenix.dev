import { GITHUB_ORG, OG_IMAGE, SITE_URL } from "./site-meta.ts"

// Structured data (JSON-LD, schema.org): what Solenix is, who made each article, for search engines and AI
// assistants. Every value comes from the page it describes or from lib/site-meta.ts, so nothing is typed twice.
// scripts/check.sh allows this markup on the homepage and on the articles.

const EMAIL = "hello@solenix.dev"
const LOGO = `${SITE_URL}/brand/out/apple-touch-icon.png`

/** The page's JSON, safe inside <script type="application/ld+json">: "<" is escaped, so no value can close the tag. */
export function ldJson(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

/** The homepage: the business, its founder and its site. `description` is the page's own meta description. */
export function homeSchema(description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#solenix`,
        name: "Solenix",
        url: `${SITE_URL}/`,
        description,
        logo: LOGO,
        image: `${SITE_URL}${OG_IMAGE.url}`,
        email: EMAIL,
        founder: { "@type": "Person", name: "Jager Cooper", jobTitle: "Founder" },
        areaServed: { "@type": "Place", name: "St. John's, Newfoundland and Labrador" },
        serviceType: "AI consulting for small businesses",
        sameAs: [`https://github.com/${GITHUB_ORG}`],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Solenix",
        inLanguage: "en-CA",
        publisher: { "@id": `${SITE_URL}/#solenix` },
      },
    ],
  }
}

/** An article: its own title, description and date. The article credits Solenix, as its page does ("Made by Solenix"). */
export function articleSchema(a: { title: string; description: string; date: string; path: string; cover?: string }) {
  const solenix = { "@type": "Organization", name: "Solenix", url: `${SITE_URL}/`, logo: LOGO }
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    dateModified: a.date,
    inLanguage: "en-CA",
    mainEntityOfPage: `${SITE_URL}${a.path}`,
    image: `${SITE_URL}${a.cover ?? OG_IMAGE.url}`,
    author: solenix,
    publisher: solenix,
  }
}
