"use client"

import { RotateCcw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// One honest example: an owner asking her own assistant. The whole
// conversation is in the markup, so with no script or reduced motion it is
// simply already there. Example figures for a made-up bakery.

type Msg = { from: "them" | "us"; text: string; when: string }

const THREAD: Msg[] = [
  { from: "them", text: "What should I order in for next week?", when: "7:20am" },
  {
    from: "us",
    text: "I went through last month in your Shopify orders. Sourdough sold out six days in eight. The gluten-free sponge sold four. Chelsea buns barely moved — fourteen all month, and you baked forty.",
    when: "7:20am",
  },
  { from: "them", text: "So more sourdough, fewer buns.", when: "7:21am" },
  {
    from: "us",
    text: "That is what the numbers say. I have put a draft order in your Google Drive against your supplier's current price list — more flour, same on the gluten-free, buns halved. Read it and change what you like. I have not sent it; I do not send orders or spend money.",
    when: "7:21am",
  },
]

function Who({ from }: { from: Msg["from"] }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full font-mono text-2xs font-semibold",
        from === "them" ? "border border-line bg-sunken text-muted-foreground" : "bg-ember-quiet text-ember-text"
      )}
    >
      {from === "them" ? (
        "AM"
      ) : (
        <svg viewBox="0 0 32 32" width="18" height="18">
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="2" />
          <circle cx="16" cy="16" r="7" fill="url(#sun)" />
        </svg>
      )}
    </span>
  )
}

function Bubble({ m, children }: { m: Msg; children?: React.ReactNode }) {
  return (
    <div className={cn("flex max-w-[34rem] items-start gap-3", m.from === "us" ? "flex-row-reverse self-end" : "self-start")}>
      <Who from={m.from} />
      <div
        className={cn(
          "flex min-w-0 flex-col gap-2 rounded-lg px-4 py-3 text-sm [overflow-wrap:anywhere]",
          m.from === "them"
            ? "rounded-tl-xs border border-line bg-sunken"
            : "rounded-tr-xs border border-line-strong bg-surface-solid shadow-sm"
        )}
      >
        {children ?? (
          <>
            <span className="sr-only">{m.from === "them" ? "Anna:" : "Assistant:"}</span>
            <p>{m.text}</p>
            <span className="font-mono text-2xs text-muted-foreground">{m.when}</span>
          </>
        )}
      </div>
    </div>
  )
}

export function AssistantDemo() {
  const panel = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(THREAD.length) // server render: everything visible
  const [typing, setTyping] = useState(false)
  const [sweeping, setSweeping] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(THREAD.length)
      return
    }
    setSweeping(false)
    requestAnimationFrame(() => setSweeping(true))
    setShown(0)
    let t = 400
    THREAD.forEach((m, i) => {
      if (m.from === "us") {
        timers.current.push(setTimeout(() => setTyping(true), t))
        t += 1500
      }
      timers.current.push(setTimeout(() => { setTyping(false); setShown(i + 1) }, t))
      t += 1100
    })
  }, [])

  useEffect(() => {
    const el = panel.current
    if (!el || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { io.disconnect(); play() } },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => { io.disconnect(); timers.current.forEach(clearTimeout) }
  }, [play])

  return (
    <div
      ref={panel}
      className={cn("glass sweepable p-6 md:p-8", sweeping && "sweeping")}
      onAnimationEnd={() => setSweeping(false)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
          <div>
            <p className="label">Maple &amp; Rye Bakery · Monday, 7:20am</p>
            <p className="mt-1 text-xs text-faint">Anna asking her own assistant, before opening</p>
          </div>
          <Badge variant="example">Example</Badge>
        </div>

        <ul aria-label="What this assistant can read" className="flex flex-wrap gap-x-3 gap-y-2">
          {["Shopify orders", "Google Docs and Sheets", "The shop inbox"].map((s) => (
            <li key={s} className="inline-flex items-center gap-2 rounded-pill border border-line bg-sunken px-3 py-1.5 font-mono text-2xs font-semibold tracking-label text-muted-foreground uppercase">
              <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" />
              {s}
            </li>
          ))}
        </ul>

        <div className="flex min-h-88 flex-col gap-4 sm:min-h-76" aria-live="polite">
          {THREAD.slice(0, shown).map((m, i) => (
            <div key={i} className="flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-(--dur-slow) motion-reduce:animate-none">
              <Bubble m={m} />
            </div>
          ))}
          {typing && (
            <div aria-hidden="true" className="flex flex-col">
              <Bubble m={{ from: "us", text: "", when: "" }}>
                <span className="typing inline-flex items-center gap-1 py-1"><i /><i /><i /></span>
              </Bubble>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="max-w-[46ch] text-xs text-faint">
            Example figures for a made-up bakery. A real one reads your own orders, your own files and your own
            inbox. It does the reading, the sums and the first draft — you check it and you decide. It never sends,
            buys or commits to anything on its own.
          </p>
          <Button variant="secondary" size="sm" onClick={play}>
            <RotateCcw />
            Play it again
          </Button>
        </div>
      </div>
    </div>
  )
}
