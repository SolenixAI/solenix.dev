// fresh(url): a source's answer as it is right now. Every call asks the source; nothing is cached
// for a time and nothing waits on a timer, so a number is never staler than the request reading it.
// Behind that one call:
//   - It remembers each source's last answer and its ETag, and asks "changed since this?"
//     (If-None-Match). An unchanged source answers 304 with no body: faster, and on GitHub with a
//     token a 304 does not count against the rate limit (docs.github.com, REST best practices).
//   - Identical reads already in flight share one request, so a crowd of visitors costs one call.
//   - It never throws: a source that fails gives null, and the page drops only that line.
// The memory lives in the server instance (Vercel Fluid reuses instances); a cold instance just
// makes one full read per source.

export type Get = (url: string, init: RequestInit) => Promise<Response>
type Remembered = { etag: string | null; body: unknown }

export function makeFresh(get: Get) {
  const remembered = new Map<string, Remembered>()
  const inFlight = new Map<string, Promise<unknown>>()
  return function fresh<T = unknown>(url: string, headers: Record<string, string> = {}): Promise<T | null> {
    const pending = inFlight.get(url)
    if (pending) return pending as Promise<T | null>
    const last = remembered.get(url)
    // A source that is down or rate-limited keeps its last real answer on screen; null only before the first.
    const fallback = () => last?.body ?? null
    const read = get(url, { headers: last?.etag ? { ...headers, "if-none-match": last.etag } : headers, cache: "no-store" })
      .then(async (r) => {
        if (r.status === 304 && last) return last.body
        if (!r.ok) return fallback()
        const body: unknown = await r.json()
        remembered.set(url, { etag: r.headers.get("etag"), body })
        return body
      })
      .catch(fallback)
      .finally(() => inFlight.delete(url))
    inFlight.set(url, read)
    return read as Promise<T | null>
  }
}

/** The live reader the site uses. */
export const fresh = makeFresh((url, init) => fetch(url, init))
