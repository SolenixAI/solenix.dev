// Reading other people's facts (GitHub, npm, the MCP registry) through Next's data cache, for lib/marketplace.ts.
// A source that fails, or answers with something that is not JSON, gives null and logs why (lib/failed):
// it drops only its own facts. `optional`: a 404 means the fact does not exist (a repo with no release), so
// it gives null quietly. `get` is the seam: the site passes fetch, a test passes a fake.

import { failed } from "./failed.ts"
import type { Get } from "./fresh.ts"

export function makeFacts(get: Get, cached: { revalidate: number; tags: string[] }) {
  return (url: string, headers: Record<string, string> = {}, { optional = false } = {}): Promise<any> =>
    new Promise<Response>((resolve) => resolve(get(url, { headers, next: cached } as RequestInit)))
      .then((r) => (r.ok ? r.json() : optional && r.status === 404 ? null : failed(url, `HTTP ${r.status}`)))
      .catch((e: unknown) => failed(url, e))
}
