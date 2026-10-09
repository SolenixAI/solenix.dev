"use client"

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react"
import { flushSync } from "react-dom"
import { useRouter } from "next/navigation"
import type { Entry } from "@/lib/marketplace"

// Opens any world in place. Every link to a world (a card, a planet in the sky: a[data-world]) is a
// real link that works without script; with script it opens the world in a native dialog (Escape,
// focus and Back all work as people expect), growing out of what was clicked with a same-page view
// transition. Everything inside streams from the live marketplace.

export type Card = { entry: Entry; inside: ReactNode }

const transition = (update: () => void) => {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update()
  document.startViewTransition(() => flushSync(update))
}

export function Worlds({ cards, initial, version }: { cards: Card[]; initial: string | null; version: string | null }) {
  const [open, setOpen] = useState<string | null>(initial && cards.some((c) => c.entry.id === initial) ? initial : null)
  const dialog = useRef<HTMLDialogElement>(null)
  const origin = useRef<HTMLElement | null>(null)
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
    const onPop = () => {
      const world = new URLSearchParams(location.search).get("world")
      if (location.pathname === "/agents") transition(() => setOpen(world)); else setOpen(world)
    }
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
  // The world grows out of whatever opened it, and shrinks back into it.
  const from = (id: string) => (origin.current?.dataset.world === id ? origin.current : document.querySelector<HTMLElement>(`.wd-card[data-world="${id}"]`))
  const morph = (id: string, opening: boolean, update: () => void) => {
    const el = from(id)
    if (el) el.style.viewTransitionName = opening ? `world-${id}` : "none"
    transition(() => { update(); if (el) el.style.viewTransitionName = opening ? "none" : `world-${id}` })
    if (el && !opening) requestAnimationFrame(() => requestAnimationFrame(() => { el.style.viewTransitionName = "" }))
  }
  const show = (id: string) => { history.pushState({ world: id }, "", `?world=${id}`); morph(id, true, () => setOpen(id)) }
  const hide = () => {
    if (history.state?.world) history.back()
    else { history.replaceState(null, "", location.pathname); if (open) morph(open, false, () => setOpen(null)) }
  }
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>("a[data-world]")
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !cards.some((c) => c.entry.id === a.dataset.world)) return
      e.preventDefault()
      origin.current = a
      show(a.dataset.world!)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  })

  return (
    <dialog ref={dialog} className="wd-dialog" aria-labelledby="wd-title" onCancel={(e) => { e.preventDefault(); hide() }} onClick={(e) => { if (e.target === e.currentTarget) hide() }}
        style={{ viewTransitionName: world ? `world-${world.id}` : "none" }}>
      {card && <WorldView card={card} onClose={hide} />}
    </dialog>
  )
}

function WorldView({ card, onClose }: { card: Card; onClose: () => void }) {
  const world = card.entry
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  // The inline action has scrolled off (a long level on a phone): a sticky copy bar stands in for it.
  const [away, setAway] = useState(false)
  const run = useRef<HTMLDetailsElement>(null)
  const sentence = useRef<HTMLParagraphElement>(null)
  const action = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const el = action.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([entry]) => setAway(!entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(world.sentence)
      setState("copied")
    } catch {
      // No clipboard here (some in-app browsers): open the full text and select it, so one copy command takes it.
      if (run.current) run.current.open = true
      run.current?.scrollIntoView({ block: "center" })
      const range = document.createRange()
      if (sentence.current) range.selectNodeContents(sentence.current)
      getSelection()?.removeAllRanges()
      getSelection()?.addRange(range)
      setState("failed")
    }
  }
  const label = state === "copied" ? "Copied. Paste it into your AI" : "Copy for your AI"
  // The visible line says only what the AI does for the visitor. The full text, with its command, sits behind "See what it runs".
  const outcome = world.part === "toolkit"
    ? "After you paste it, your AI gets the basics it needs and shows you it works."
    : `After you paste it, your AI sets up ${world.name} for you and shows you it works.`
  return (
    <div className="wd-view">
      <button className="wd-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      <div className="wd-top">
        <h2 id="wd-title" className="wd-big">{world.name}</h2>
        <p className="wd-lede">{world.for}</p>
        <div className="wd-copy">
          <p className="wd-outcome">{outcome}</p>
          <button ref={action} type="button" className="wd-action" onBlur={() => setState((s) => (s === "copied" ? "idle" : s))} onClick={copy}>{label}</button>
          <details ref={run} className="wd-run">
            <summary>See what it runs</summary>
            <p ref={sentence} className="wd-run-text">{world.sentence.split("`").map((part, i) => (i % 2 ? <code key={i}>{part.split(" ").map((word, j) => <Fragment key={j}>{j > 0 && " "}<span className="wd-tok">{word}</span></Fragment>)}</code> : part))}</p>
          </details>
          <p role="status" className={state === "failed" ? "wd-copy-note" : "sy-sr"}>
            {state === "failed" ? "Couldn't copy. We opened the full text and selected it. Copy it now." : state === "copied" ? "Copied. Paste it into your AI" : ""}
          </p>
        </div>
      </div>
      {card.inside}
      {away && (
        <div className="wd-pin">
          <button type="button" className="wd-action" onClick={copy}>{label}</button>
        </div>
      )}
    </div>
  )
}

// A command's last flag stays with its value on one line: "--skill toolkit" never breaks at the hyphen or the space.
const flagNoWrap = (text: string) => {
  const at = text.search(/ --\S+ \S+$/)
  return at < 0 ? text : <>{text.slice(0, at + 1)}<span className="wd-nowrap">{text.slice(at + 1)}</span></>
}
// The hero's one action. The button copies the full sentence, every time, and answers the press and the copy (a data
// attribute drives the motion; reduced motion stops it). Its status line says what happened. One quiet line says the
// steps are public, and its toggle shows the sentence for anyone who wants to read it first.
export function HeroAsk({ sentence, repo }: { sentence: string; repo: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  const [open, setOpen] = useState(false)
  const copied = state === "copied" ? "true" : undefined
  return (
    <div className="wd-ask">
      <button type="button" className="wd-action" data-copied={copied} onBlur={() => setState("idle")}
        onClick={async () => { try { await navigator.clipboard.writeText(sentence); setState("copied") } catch { setState("failed") } }}>
        Copy for your AI
      </button>
      <span className="wd-ask-status" role="status" data-copied={copied}>
        {state === "copied" ? "Copied. Paste it into your AI" : state === "failed" ? "Couldn't copy. Open ‘See what it runs’ and select the text." : ""}
      </span>
      <p className="wd-quiet">
        Open source. Read every step on <a href={repo}>GitHub</a>.{" "}
        <button type="button" className="wd-quiet-toggle" aria-expanded={open} aria-controls="wd-what" onClick={() => setOpen((o) => !o)}>
          See what it runs {open ? "−" : "+"}
        </button>
      </p>
      <p id="wd-what" className="wd-ask-sentence" hidden={!open}>
        {sentence.split("`").map((part, i) => (i % 2 ? <code key={i}>{flagNoWrap(part)}</code> : part))}
      </p>
    </div>
  )
}

// A card's one action: copy its sentence for your AI, without opening the world. A link cannot hold a button, so
// this sits beside the card's link and copies what the dialog copies. With no clipboard, it opens the world, where
// the sentence is on screen to select.
export function CopyCard({ id, name, sentence }: { id: string; name: string; sentence: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2600)
    return () => clearTimeout(t)
  }, [copied])
  return (
    <button type="button" className="wd-card-copy" data-state={copied ? "copied" : "idle"} aria-label={`Copy for your AI: ${name}`}
      onClick={async () => { try { await navigator.clipboard.writeText(sentence); setCopied(true) } catch { location.assign(`?world=${id}`) } }}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {copied ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></>}
      </svg>
      <span aria-live="polite">{copied ? "Copied. Paste it into your AI" : "Copy for your AI"}</span>
    </button>
  )
}

// The sentence the how-it-works steps point to: the core toolkit's, copied from a ghost pill, so this section adds
// no second solid fill (the hero keeps the page's one).
export function SentenceCopy({ sentence }: { sentence: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  return (
    <div className="wd-say">
      <p className="wd-say-text">One paste installs the Solenix basics into your AI.</p>
      <button type="button" className="wd-say-copy" data-state={state} onBlur={() => setState("idle")}
        onClick={async () => { try { await navigator.clipboard.writeText(sentence); setState("copied") } catch { setState("failed") } }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {state === "copied" ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></>}
        </svg>
        <span aria-live="polite">{state === "copied" ? "Copied. Paste it into your AI" : state === "failed" ? "Couldn't copy. Open “See what it runs” and copy it there." : "Copy for your AI"}</span>
      </button>
      <details className="wd-say-more">
        <summary>See what it runs</summary>
        <p className="wd-say-raw">{sentence.split("`").map((part, i) => (i % 2 ? <code key={i}>{part.split(" ").map((word, j) => <Fragment key={j}>{j > 0 && " "}<span className="wd-tok">{word}</span></Fragment>)}</code> : part))}</p>
      </details>
    </div>
  )
}
