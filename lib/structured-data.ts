import { NAV } from "./site-nav.ts"
import { HOME_URL, SITE_URL } from "./site-meta.ts"

// Structured data (schema.org, JSON-LD) for the pages a search engine or an AI agent reads. Every value comes from the
// source the page shows: the homepage's address and contact (NAV), and each article's own title, description, date and cover.

/** The JSON-LD text for a <script type="application/ld+json">. A "<" is written as <, so no value can end the script. */
export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c")

/** The homepage: the business, its address and the area it serves. */
export const homeStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Solenix",
  url: HOME_URL,
  areaServed: "St. John's, Newfoundland and Labrador",
  // The address the homepage and the footer show as contact text (NAV.contact).
  email: NAV.contact.label,
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
