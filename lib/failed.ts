// One way to report a read that failed: one log line naming the source and the reason, then null.
// The page keeps what it has (each caller decides its fallback); the line shows an outage or a rate
// limit in the runtime logs the same day. Use it only where a read failed; an optional value that is
// simply absent stays silent.

export function failed(source: string, reason: unknown): null {
  // One line, at most 300 characters: an error from an HTML body can hold newlines and a whole page.
  const why = (reason instanceof Error ? reason.message : String(reason)).replace(/\s+/g, " ").trim()
  const line = `read failed · ${source} · ${why}`
  console.warn(line.length > 300 ? `${line.slice(0, 299)}…` : line)
  return null
}
