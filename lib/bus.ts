/**
 * Bus: tell every open page, on any server instance, that something changed. Redis (from the
 * Vercel Marketplace, REDIS_URL) carries the message between instances; each instance keeps one
 * subscription per channel and hands every message to all of its open pages. Without REDIS_URL it
 * is off: publish does nothing and subscribe gives null, so pages fall back to reading on load.
 */
export type Listener = (message: string) => void
/** What the hub needs from Redis: one connection that publishes, one that subscribes. */
export type Wire = {
  publish: (channel: string, message: string) => Promise<unknown>
  subscribe: (channel: string, listener: Listener) => Promise<unknown>
  unsubscribe: (channel: string) => Promise<unknown>
}

export function makeHub(connect: () => Promise<Wire>) {
  let wire: Promise<Wire> | null = null
  const open = () => (wire ??= connect().catch((e) => { wire = null; throw e }))
  const listeners = new Map<string, Set<Listener>>()
  return {
    async publish(channel: string, message: string) {
      await (await open()).publish(channel, message)
    },
    /** Starts hearing a channel; the returned function stops. The first listener opens the channel, the last closes it. */
    async subscribe(channel: string, listener: Listener): Promise<() => void> {
      let set = listeners.get(channel)
      if (!set) {
        const fresh = new Set<Listener>()
        listeners.set(channel, (set = fresh))
        await (await open()).subscribe(channel, (m) => fresh.forEach((l) => l(m)))
      }
      set.add(listener)
      return () => {
        set.delete(listener)
        if (set.size === 0 && listeners.get(channel) === set) {
          listeners.delete(channel)
          open().then((w) => w.unsubscribe(channel), () => {})
        }
      }
    },
  }
}

export type Hub = ReturnType<typeof makeHub>

// Only a real Redis address turns the bus on (Vercel writes a placeholder while a database is still being made).
const url = /^rediss?:\/\//.test(process.env.REDIS_URL ?? "") ? process.env.REDIS_URL : undefined
/** The site's hub, or null when no Redis is connected. */
export const bus: Hub | null = url
  ? makeHub(async () => {
      const { createClient } = await import("redis")
      const pub = createClient({ url })
      const sub = pub.duplicate()
      // node-redis ends the process on a connection error with no listener; it reconnects by itself.
      for (const c of [pub, sub]) c.on("error", (e: Error) => console.error(`bus: ${e.message}`))
      await Promise.all([pub.connect(), sub.connect()])
      return {
        publish: (c, m) => pub.publish(c, m),
        subscribe: (c, l) => sub.subscribe(c, l),
        unsubscribe: (c) => sub.unsubscribe(c),
      }
    })
  : null
