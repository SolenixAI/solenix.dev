"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { flushSync } from "react-dom"
import { useRouter } from "next/navigation"
import type { Entry } from "@/lib/marketplace"

// The toolkit and the worlds as cards. A card opens into its world (a native dialog: Escape, focus
// and the back button all work as people expect), growing out of the card with a same-page view
// transition, like the article windows. Everything shown comes from the live marketplace; each
// world's system (glance on the card, inside in the dialog) streams in when its sources answer.

export type Card = { entry: Entry; glance: ReactNode; inside: ReactNode }

const transition = (update: () => void) => {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update()
  document.startViewTransition(() => flushSync(update))
}

const Arrow = () => <svg viewBox="0 0 24 24" aria-hidden="true" className="wd-arrow"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>

export function Worlds({ cards, initial, version }: { cards: Card[]; initial: string | null; version: string | null }) {
  const [open, setOpen] = useState<string | null>(initial && cards.some((c) => c.entry.id === initial) ? initial : null)
  const dialog = useRef<HTMLDialogElement>(null)
  const card = cards.find((c) => c.entry.id === open) ?? null
  const world = card?.entry ?? null

  // Live: the page hears which catalog is current (app/(site)/agents/live). When it differs from the
  // one this page shows, the page re-reads in place: the open world, scroll and focus all stay.
  const router = useRouter()
  useEffect(() => {
    const live = new EventSource("/agents/live")
    live.addEventListener("version", (e) => { if ((e as MessageEvent<string>).data !== version) router.refresh() })
    return () => live.close()
  }, [version, router])

  // The dialog follows the address (?world=id), so Back closes it and a shared link opens it.
  useEffect(() => {
    const onPop = () => transition(() => setOpen(new URLSearchParams(location.search).get("world")))
    addEventListener("popstate", onPop)
    return () => removeEventListener("popstate", onPop)
  }, [])
  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (world && !d.open) { d.showModal(); d.querySelector<HTMLElement>(".wd-action")?.focus() } // focus the one action
    if (!world && d.open) d.close()
  }, [world])

  // Opened here: its own history step, so Back (or close) returns to the list. Opened from a shared
  // link: closing just drops the world from the address, so it never leaves the site.
  const show = (id: string) => { history.pushState({ world: id }, "", `?world=${id}`); transition(() => setOpen(id)) }
  const hide = () => {
    if (history.state?.world) history.back()
    else { history.replaceState(null, "", location.pathname); transition(() => setOpen(null)) }
  }

  return (
    <>
      <div className="wd-grid">
        {cards.map(({ entry: w, glance }) => (
          <a key={w.id} href={`?world=${w.id}`} className="wd-card" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); show(w.id) }} style={{ viewTransitionName: open === w.id ? "none" : `world-${w.id}` }} aria-haspopup="dialog">
            <span className="wd-glance">{glance}</span>
            <span className="wd-name">{w.name}<Arrow /></span>
            <span className="wd-for">{w.for}</span>
          </a>
        ))}
      </div>
      <dialog ref={dialog} className="wd-dialog" aria-labelledby="wd-title" onCancel={(e) => { e.preventDefault(); hide() }} onClick={(e) => { if (e.target === e.currentTarget) hide() }}
        style={{ viewTransitionName: world ? `world-${world.id}` : "none" }}>
        {card && <WorldView card={card} onClose={hide} />}
      </dialog>
    </>
  )
}

function WorldView({ card, onClose }: { card: Card; onClose: () => void }) {
  const world = card.entry
  const [copied, setCopied] = useState(false)
  return (
    <div className="wd-view">
      <button className="wd-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      <div className="wd-top">
        <h2 id="wd-title" className="wd-big">{world.name}</h2>
        <p className="wd-lede">{world.for}</p>
        <div className="wd-copy">
          <p>{world.sentence.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}</p>
          <button className="wd-action" onBlur={() => setCopied(false)}
            onClick={async () => { try { await navigator.clipboard.writeText(world.sentence); setCopied(true) } catch { setCopied(false) } }}>
            {copied ? "Copied. Paste it into your AI" : "Copy for your AI"}
          </button>
        </div>
      </div>
      {card.inside}
    </div>
  )
}
