// fresh(url, headers, cached?): a source's answer, read one of two ways behind one call.
//   - Live (no cache option): every call asks the source. It remembers each source's last answer and its
//     ETag, and asks "changed since this?" (If-None-Match). An unchanged source answers 304 with no body:
//     faster, and on GitHub with a key a 304 does not count against the rate limit (docs.github.com, REST
//     best practices). Nothing is cached for a time, so a live number is never staler than its request.
//   - Cached ({ tags, revalidate }): Next keeps the answer in its data cache under those tags. It is read
//     again once `revalidate` seconds pass, or at once when the site expires one of its tags (a GitHub push
//     does, in app/api/github), so a cached answer is never older than that backstop.
// Behind both: identical reads in flight share one request; a source that fails gives its last real
// answer (null before the first); nothing here throws. The memory lives in the server instance (Vercel
// Fluid reuses instances); a cold instance just makes one full read per source.

export type Get = (url: string, init: RequestInit) => Promise<Response>
export type Cached = { tags: string[]; revalidate: number }
type Remembered = { etag: string | null; body: unknown }

export function makeFresh(get: Get) {
  const remembered = new Map<string, Remembered>()
  const inFlight = new Map<string, Promise<unknown>>()
  return function fresh<T = unknown>(url: string, headers: Record<string, string> = {}, cached?: Cached): Promise<T | null> {
    const key = `${cached ? "cached" : "live"} ${url}`
    const pending = inFlight.get(key)
    if (pending) return pending as Promise<T | null>
    const last = remembered.get(url)
    // A source that is down or rate-limited keeps its last real answer on screen; null only before the first.
    const fallback = () => last?.body ?? null
    const init = cached
      ? { headers, next: { tags: cached.tags, revalidate: cached.revalidate } } as RequestInit
      : { headers: last?.etag ? { ...headers, "if-none-match": last.etag } : headers, cache: "no-store" as const }
    const read = get(url, init)
      .then(async (r) => {
        if (r.status === 304 && last) return last.body
        if (!r.ok) return fallback()
        const body: unknown = await r.json()
        remembered.set(url, { etag: r.headers.get("etag"), body })
        return body
      })
      .catch(fallback)
      .finally(() => inFlight.delete(key))
    inFlight.set(key, read)
    return read as Promise<T | null>
  }
}

/** The reader the site uses: live by default, cached with a cache option. */
export const fresh = makeFresh((url, init) => fetch(url, init))
