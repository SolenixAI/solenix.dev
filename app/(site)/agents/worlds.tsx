"use client"

import { Fragment, useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react"
import { flushSync } from "react-dom"
import { useRouter } from "next/navigation"
import type { Entry } from "@/lib/marketplace"
import { COPIED, FAILED } from "@/lib/copy-for-ai"
import { useCopyForAi } from "./use-copy-for-ai"

// Opens any world in place. Every link to a world (a card, a planet in the sky: a[data-world]) is a
// real link that works without script; with script it opens the world in a native dialog (Escape,
// focus and Back all work as people expect), growing out of what was clicked with a same-page view
// transition. Everything inside streams from the live marketplace.

export type Card = { entry: Entry; inside: ReactNode }

// A card whose copy fails asks for its world to open with the sentence selected (CopyCard sends this).
const OPEN_WORLD = "agents:open-world"

const transition = (update: () => void) => {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update()
  document.startViewTransition(() => flushSync(update))
}

// The pieces of a command, each one unbreakable: a word, or a `--flag value` pair, so a line never breaks inside a word
// or between a flag and its value. Joined with spaces, the pieces give the command back exactly.
function commandPieces(command: string): string[] {
  const words = command.split(" ")
  const pieces: string[] = []
  for (let i = 0; i < words.length; i++) {
    if (words[i].startsWith("--") && i + 1 < words.length && !words[i + 1].startsWith("--")) {
      pieces.push(`${words[i]} ${words[i + 1]}`)
      i++
    } else pieces.push(words[i])
  }
  return pieces
}

// A sentence a visitor copies, with its command in code. The screen shows it only after a failed copy, selected for a
// copy by hand; every surface renders it here (worlds-css.ts keeps each piece whole), so a line breaks only at a space
// between two pieces.
function Sentence({ text }: { text: string }) {
  return (
    <span className="wd-sentence">
      {text.split("`").map((part, i) => (i % 2 ? <code key={i}>{commandPieces(part).map((piece, j) => <Fragment key={j}>{j > 0 && " "}<span className="wd-tok">{piece}</span></Fragment>)}</code> : part))}
    </span>
  )
}

export function Worlds({ cards, initial, version }: { cards: Card[]; initial: string | null; version: string | null }) {
  const [open, setOpen] = useState<string | null>(initial && cards.some((c) => c.entry.id === initial) ? initial : null)
  // The world that opens after a failed copy on its card: it opens with the sentence selected.
  const [failedOpen, setFailedOpen] = useState<string | null>(null)
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
      setFailedOpen(null)
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
  const show = (id: string, failed = false) => {
    history.pushState({ world: id }, "", `?world=${id}`)
    setFailedOpen(failed ? id : null)
    morph(id, true, () => setOpen(id))
  }
  const hide = () => {
    setFailedOpen(null)
    if (history.state?.world) history.back()
    else { history.replaceState(null, "", location.pathname); if (open) morph(open, false, () => setOpen(null)) }
  }
  // One listener each for the page's life; useEffectEvent lets them read the current cards without rebinding.
  const onClick = useEffectEvent((e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>("a[data-world]")
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !cards.some((c) => c.entry.id === a.dataset.world)) return
    e.preventDefault()
    origin.current = a
    show(a.dataset.world!)
  })
  const onOpen = useEffectEvent((e: Event) => {
    const { id, failed } = (e as CustomEvent<{ id: string; failed: boolean }>).detail
    if (cards.some((c) => c.entry.id === id)) show(id, failed)
  })
  useEffect(() => {
    const click = (e: MouseEvent) => onClick(e), open = (e: Event) => onOpen(e)
    document.addEventListener("click", click)
    document.addEventListener(OPEN_WORLD, open)
    return () => { document.removeEventListener("click", click); document.removeEventListener(OPEN_WORLD, open) }
  }, [])

  return (
    <dialog ref={dialog} className="wd-dialog" aria-labelledby="wd-title" onCancel={(e) => { e.preventDefault(); hide() }} onClick={(e) => { if (e.target === e.currentTarget) hide() }}
        style={{ viewTransitionName: world ? `world-${world.id}` : "none" }}>
      {card && <WorldView key={card.entry.id} card={card} onClose={hide} failedOnOpen={failedOpen === card.entry.id} />}
    </dialog>
  )
}

function WorldView({ card, onClose, failedOnOpen }: { card: Card; onClose: () => void; failedOnOpen: boolean }) {
  const world = card.entry
  // A failed copy shows the full sentence, selected and in view, so one copy command takes it.
  const { status, shown, text, copy, fail, blur } = useCopyForAi<HTMLParagraphElement>(world.sentence)
  // The inline action has scrolled off (a long level on a phone): a sticky copy bar stands in for it.
  const [away, setAway] = useState(false)
  const action = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const el = action.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([entry]) => setAway(!entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // The card's copy failed, so this world opens failed: the same as a failed copy here, with no second copy attempt.
  useEffect(() => {
    if (!failedOnOpen) return
    const frame = requestAnimationFrame(fail)
    return () => cancelAnimationFrame(frame)
  }, [])
  const label = status === "copied" ? COPIED : "Copy for your AI"
  // The visible line says only what the AI does for the visitor. The full text, with its command, travels in the copy.
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
          <p className="wd-outcome">Your AI explains each step, and asks before it installs anything system-wide.</p>
          <button ref={action} type="button" className="wd-action" onBlur={blur} onClick={copy}>{label}</button>
          <p ref={text} className="wd-copy-sentence" hidden={!shown}><Sentence text={world.sentence} /></p>
          <p role="status" className={status === "failed" ? "wd-copy-note" : "sy-sr"}>
            {status === "failed" ? FAILED : status === "copied" ? COPIED : ""}
          </p>
        </div>
      </div>
      {card.inside}
      {away && (
        <div className="wd-pin">
          <button type="button" className="wd-action" onBlur={blur} onClick={copy}>{label}</button>
        </div>
      )}
    </div>
  )
}

// The hero's one action. The button copies the full sentence, every time, and answers the press and the copy (a data
// attribute drives the motion; reduced motion stops it). Its status line says what happened. One quiet line says the
// steps are public on GitHub; the sentence itself shows only after a failed copy.
export function HeroAsk({ sentence, repo }: { sentence: string; repo: string }) {
  const { status, shown, text, copy, blur } = useCopyForAi<HTMLParagraphElement>(sentence)
  const copied = status === "copied" ? "true" : undefined
  return (
    <div className="wd-ask">
      <button type="button" className="wd-action" data-copied={copied} onBlur={blur} onClick={copy}>
        Copy for your AI
      </button>
      <span className="wd-ask-status" role="status" data-copied={copied}>
        {status === "copied" ? COPIED : status === "failed" ? FAILED : ""}
      </span>
      <p className="wd-quiet">
        Open source. Read every step on <a href={repo}>GitHub</a>.
      </p>
      <p className="wd-quiet">
        Using a chat in a browser? It can't run the setup. <a href="/book" className="whitespace-nowrap">Book a call</a> and we set it up with you.
      </p>
      <p ref={text} className="wd-ask-sentence" hidden={!shown}>
        <Sentence text={sentence} />
      </p>
    </div>
  )
}

// A card's one action: copy its sentence for your AI, without opening the world. A link cannot hold a button, so
// this sits beside the card's link. When the copy fails, the card opens its world, where the sentence is selected.
export function CopyCard({ id, name, sentence }: { id: string; name: string; sentence: string }) {
  const { status, copy, blur } = useCopyForAi(sentence, () => {
    document.dispatchEvent(new CustomEvent(OPEN_WORLD, { detail: { id, failed: true } }))
  })
  const copied = status === "copied"
  return (
    <button type="button" className="wd-card-copy" data-state={copied ? "copied" : "idle"} aria-label={`Copy for your AI: ${name}`} onBlur={blur} onClick={copy}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {copied ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></>}
      </svg>
      <span aria-live="polite">{copied ? COPIED : "Copy for your AI"}</span>
    </button>
  )
}

// The sentence the how-it-works steps point to: the core toolkit's, copied from a ghost pill, so this section adds
// no second solid fill (the hero keeps the page's one).
export function SentenceCopy({ sentence }: { sentence: string }) {
  const { status, shown, text, copy, blur } = useCopyForAi<HTMLParagraphElement>(sentence)
  return (
    <div className="wd-say">
      <p className="wd-say-text">One paste installs the Solenix basics into your AI.</p>
      <button type="button" className="wd-say-copy" data-state={status} onBlur={blur} onClick={copy}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {status === "copied" ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></>}
        </svg>
        <span aria-live="polite">{status === "copied" ? COPIED : "Copy for your AI"}</span>
      </button>
      {status === "failed" && <p className="wd-say-note" role="status">{FAILED}</p>}
      <p ref={text} className="wd-say-raw" hidden={!shown}><Sentence text={sentence} /></p>
    </div>
  )
}
