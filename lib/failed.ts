// One way to report a read that failed: one log line naming the source and the reason, then null.
// The page keeps what it has (each caller decides its fallback); the line shows an outage or a rate
// limit in the runtime logs the same day. Use it only where a read failed; an optional value that is
// simply absent stays silent.

export function failed(source: string, reason: unknown): null {
  const why = reason instanceof Error ? reason.message : String(reason)
  console.warn(`read failed · ${source} · ${why}`)
  return null
}
