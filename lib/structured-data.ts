import { NAV } from "./site-nav.ts"
import { ARTICLES_PAGE } from "./articles-page.ts"
import { GITHUB_ORG, HOME_URL, SITE_URL } from "./site-meta.ts"

// Structured data (schema.org, JSON-LD) for the pages a search engine or an AI agent reads. Every value comes from the
// source the page shows: the homepage's contact (NAV) and description, each article's own title, description, date and
// cover, and the articles page's name and description (ARTICLES_PAGE). Nothing is typed twice.

/** The JSON-LD text for a <script type="application/ld+json">. A "<" is written as <, so no value can end the script. */
export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c")

/** The homepage: the business (its contact, locality and area, founder) and the site it publishes. `description` is the page's own. */
export const homeStructuredData = (description?: string) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#solenix`,
      name: "Solenix",
      url: HOME_URL,
      ...(description ? { description } : {}),
      // The address the homepage and the footer show as contact text (NAV.contact).
      email: NAV.contact.label,
      // The locality and region only: the repo holds no street address, so none is published.
      address: { "@type": "PostalAddress", addressLocality: "St. John's", addressRegion: "NL", addressCountry: "CA" },
      areaServed: "St. John's, Newfoundland and Labrador",
      founder: { "@type": "Person", name: "Jager Cooper", jobTitle: "Founder" },
      sameAs: [`https://github.com/${GITHUB_ORG}`],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: HOME_URL,
      name: "Solenix",
      inLanguage: "en-CA",
      publisher: { "@id": `${SITE_URL}/#solenix` },
    },
  ],
})

/** An article: its own headline, description, publication date and cover. No author: an article names no person. */
export const articleStructuredData = (a: { title: string; description: string; date: string; cover?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: a.title,
  description: a.description,
  datePublished: a.date,
  ...(a.cover ? { image: `${SITE_URL}${a.cover}` } : {}),
  publisher: { "@type": "Organization", name: "Solenix", url: HOME_URL },
})

/** The articles index: the page's own name and description, and each article in order with its title and link. */
export const articlesStructuredData = (articles: { title: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: ARTICLES_PAGE.title,
  description: ARTICLES_PAGE.description,
  url: `${SITE_URL}/articles`,
  inLanguage: "en-CA",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: articles.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}${a.path}`, name: a.title })),
  },
})

/** The Agents Marketplace: each world with its name and line. A world is a query variant of /agents (one URL per page,
 * lib/sitemap.ts), so the list names the worlds and links the page, not each query. */
export const agentsStructuredData = (entries: { name: string; for: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Agents Marketplace",
  url: `${SITE_URL}/agents`,
  itemListElement: entries.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.name, description: e.for })),
})
