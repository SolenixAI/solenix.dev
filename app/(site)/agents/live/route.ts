import { bus } from "@/lib/bus"
import { catalogVersion, MARKETPLACE_REF } from "@/lib/marketplace"

// An open /agents page listens here (Server-Sent Events, same origin). It first hears which catalog
// is current, so a page that was away (asleep, offline, reconnecting) catches up at once; then it
// hears every change the moment GitHub reports it (app/api/github → lib/bus). The browser's own
// EventSource reconnects when the function's time runs out. Without Redis there is nothing to hear:
// 204 tells the browser not to try again.
export const maxDuration = 800

export async function GET(req: Request) {
  if (!bus) return new Response(null, { status: 204 })
  const hub = bus
  const version = await catalogVersion()
  const encode = (v: string) => new TextEncoder().encode(`event: version\ndata: ${v}\n\n`)
  let stop = () => {}
  const stream = new ReadableStream<Uint8Array>({
    async start(c) {
      c.enqueue(new TextEncoder().encode("retry: 1000\n\n"))
      if (version) c.enqueue(encode(version))
      try { stop = await hub.subscribe(`marketplace:${MARKETPLACE_REF}`, (v) => c.enqueue(encode(v))) }
      catch (e) { console.error(`bus: ${(e as Error).message}`); c.close(); return } // the browser retries
      req.signal.addEventListener("abort", () => { stop(); try { c.close() } catch {} })
    },
    cancel: () => stop(),
  })
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", "x-accel-buffering": "no" } })
}
