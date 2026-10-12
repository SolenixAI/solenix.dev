import "server-only"
import { cache } from "react"
import { githubHeaders } from "@/lib/github"
import { makeMarketplace } from "@/lib/marketplace/read"
import { MARKETPLACE_SLUG } from "@/lib/site-meta"

/**
 * The Agents Marketplace, for the site: the read model (lib/marketplace/read.ts) wired to Next.
 * - The catalog is kept in Next's data cache under its branch's tag. A push to that branch expires it (app/api/github),
 *   so an open page hears the change within about a second (app/(site)/agents/live). A missed webhook still heals within a minute.
 * - Every other fact is kept in Next's data cache for at most an hour, under FACTS_TAG. A push refreshes it behind the page.
 * - React's cache gives each request one read of the catalog and of each orbit.
 */
export const MARKETPLACE_REPO = `https://github.com/${MARKETPLACE_SLUG}`
// The branch the page reads. main in production; a preview can point at a branch under review.
export const MARKETPLACE_REF = process.env.MARKETPLACE_REF ?? "main"
export { catalogKey, FACTS_TAG } from "@/lib/marketplace/read"
export type { Entry, Kind, Orbit, Part, Piece } from "@/lib/marketplace/read"

// Every marketplace read goes through this one get, so each has a time limit: a source that hangs is a failed read
// (lib/fresh gives its last answer), never a page that waits. /agents once waited 30 s on one read.
const READ_LIMIT_MS = 5000
const get = (url: string, init: RequestInit) => fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(READ_LIMIT_MS) })
const market = makeMarketplace({ get, headers: githubHeaders, marketplace: MARKETPLACE_SLUG, ref: MARKETPLACE_REF })

/** Which version of the catalog a branch holds right now (its file's git hash); null when unreadable. */
export const catalogVersion = market.catalogVersion
/** The catalog as the data cache holds it (a push to its branch refreshes it); null when it can't be read. */
export const getCatalog = cache(market.getCatalog)
/** A world as a system: its maker at the centre, every piece around it, each read live from its own source. */
export const orbit = cache(market.orbit)
