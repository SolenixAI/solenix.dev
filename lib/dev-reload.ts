import { watch, type FSWatcher } from "node:fs"
import path from "node:path"

// Live reload for raw HTML pages, in development only (client/dev-reload.ts runs in the page).
// One module-level hub per dev server: a watcher on the sources those pages are built from
// (design/, articles/, and the generated client and site modules in lib/), and every open page
// listening to /dev/reload. A burst of writes from one save becomes one "change" event (50 ms).
// Production answers 404: the watchers never start there.

type Client = ReadableStreamDefaultController<Uint8Array>
type Hub = { clients: Set<Client>; started: number; timer?: ReturnType<typeof setTimeout>; watchers: FSWatcher[] }

const KEY = "__solenixDevReload"
const hubs = globalThis as typeof globalThis & { [KEY]?: Hub }
const encoder = new TextEncoder()
const LIB_FILE = /^(client\.generated\.ts|site-[\w-]+\.ts)$/
const isHidden = (file: string) => file.split(path.sep).some((part) => part.startsWith("."))

function hub(): Hub {
  if (hubs[KEY]) return hubs[KEY]
  const root = process.cwd()
  const h: Hub = { clients: new Set(), started: Date.now(), watchers: [] }
  const fire = () => {
    clearTimeout(h.timer)
    h.timer = setTimeout(() => {
      for (const c of h.clients) send(h, c, "event: change\ndata: saved\n\n")
    }, 50)
  }
  for (const dir of ["design", "articles"]) {
    h.watchers.push(watch(path.join(root, dir), { recursive: true }, (_event, file) => {
      if (file && !isHidden(String(file))) fire()
    }))
  }
  h.watchers.push(watch(path.join(root, "lib"), (_event, file) => {
    if (file && LIB_FILE.test(String(file))) fire()
  }))
  return (hubs[KEY] = h)
}

// Write one message to one page. A page that has gone away is dropped on the first failed write.
function send(h: Hub, c: Client, text: string) {
  try {
    c.enqueue(encoder.encode(text))
  } catch {
    h.clients.delete(c)
  }
}

export function devReloadResponse(): Response {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 })
  const h = hub()
  let self: Client | undefined
  let keepAlive: ReturnType<typeof setInterval> | undefined
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      self = c
      h.clients.add(c)
      send(h, c, `event: hello\ndata: ${h.started}\n\n`)
      // A comment line every 15 s keeps idle proxies from closing the stream.
      keepAlive = setInterval(() => {
        if (h.clients.has(c)) send(h, c, ": keep-alive\n\n")
        else clearInterval(keepAlive)
      }, 15_000)
    },
    cancel() {
      if (self) h.clients.delete(self)
      clearInterval(keepAlive)
    },
  })
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-store" } })
}
