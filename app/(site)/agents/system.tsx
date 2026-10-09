"use client"

import { avatar } from "@/lib/avatar"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ago, count } from "@/lib/format"
import { flushSync } from "react-dom"
import type { Kind, Orbit, Part, Source } from "@/lib/marketplace"

// A world as a small solar system: the maker is the sun, each piece a planet on one orbit ring (the
// Solenix mark: a sun, one ring, one agent dot). Pick any body and its sub-world opens beside it:
// what it is in its makers' words, its live numbers, what is inside, and every source to check.

const compact = (n: number) => new Intl.NumberFormat("en-CA", { notation: "compact", maximumFractionDigits: 1 }).format(n)
// A position from trigonometry, rounded to the precision the browser keeps: the server's markup and the
// browser's style then read the same string, so hydration never sees a mismatch.
const pct = (v: number) => `${+v.toFixed(4)}%`

type Drawn = Exclude<Kind, "maker" | "tool"> | "skill" | "agent" | "command"
const PATHS: Record<Exclude<Drawn, "skill">, ReactNode> = {
  agent: <><rect x="5" y="8" width="14" height="11" rx="3" /><path d="M12 4.5V8M9.5 13h.01M14.5 13h.01M9.5 16h5" /></>,
  command: <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="m10.5 15 3-6" /></>,
  plugin: <path d="M9 3.5h6v3a1.5 1.5 0 0 0 3 0V6h2.5v5.5H19a1.5 1.5 0 0 0 0 3h1.5V20h-5.5v-1.5a1.5 1.5 0 0 0-3 0V20H6.5v-5.5H8a1.5 1.5 0 0 0 0-3H6.5V6H9z" />,
  skills: <><path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z" /><path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3" /><path d="m11 8 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></>,
  connector: <><path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0z" /><path d="M12 16v5" /></>,
  cli: <><rect x="3" y="4.5" width="18" height="15" rx="2.5" /><path d="m7 10 3 2.5L7 15M12.5 15H17" /></>,
  api: <path d="M8.5 4.5C6 4.5 6 6 6 8s-.5 3.5-2 4c1.5.5 2 2 2 4s0 3.5 2.5 3.5M15.5 4.5C18 4.5 18 6 18 8s.5 3.5 2 4c-1.5.5-2 2-2 4s0 3.5-2.5 3.5" />,
}
export function KindIcon({ kind }: { kind: Kind | Part["kind"] }) {
  const d = kind in PATHS ? PATHS[kind as keyof typeof PATHS] : PATHS.skills
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="sy-icon">{d}</svg>
}
const Icon = ({ d }: { d: ReactNode }) => <svg viewBox="0 0 24 24" aria-hidden="true" className="sy-glyph">{d}</svg>
export const StarIcon = () => <Icon d={<path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />} />
const ForkIcon = () => <Icon d={<><circle cx="6.5" cy="5.5" r="2" /><circle cx="17.5" cy="5.5" r="2" /><circle cx="12" cy="19" r="2" /><path d="M6.5 7.5c0 4 5.5 3.5 5.5 9.5M17.5 7.5c0 4-5.5 3.5-5.5 9.5" /></>} />
export const DownIcon = () => <Icon d={<path d="M12 4v12m-5-5 5 5 5-5M5 20h14" />} />
const ClockIcon = () => <Icon d={<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>} />
const ScaleIcon = () => <Icon d={<path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z" />} />
const CheckIcon = () => <Icon d={<path d="m5 12.5 4.5 4.5L19 7.5" />} />
const OutIcon = () => <Icon d={<path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" />} />

/** What a planet says at a glance: one number or version, never a sentence. */
function tag(s: Source) {
  if (s.kind === "maker" || s.kind === "tool") return s.repo?.stars != null ? compact(s.repo.stars) : null
  if (s.kind === "skills") return s.items.length ? String(s.items.length) : null
  if (s.kind === "api") return "docs"
  return s.version ? `v${s.version.replace(/^v/, "")}` : null
}

/** The body's face: the maker's own avatar where a repo has one, otherwise the piece's drawn icon. */
function Face({ s, size }: { s: Source; size: number }) {
  if ((s.kind === "maker" || s.kind === "tool") && s.repo?.avatar) return <img className="sy-face" src={avatar(s.repo.avatar, size * 2)} width={size} height={size} alt="" />
  return <KindIcon kind={s.kind} />
}

/** The small system on each card: the sun, its ring, one dot per piece. Pure picture. */
export function MiniOrbit({ orbit }: { orbit: Orbit }) {
  const n = orbit.planets.length
  return (
    <span className="sy-mini" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <circle className="sy-ring" cx="50" cy="50" r="38" />
        {orbit.planets.map((p, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2
          return <circle key={p.id} className="sy-dot" cx={50 + 38 * Math.cos(a)} cy={50 + 38 * Math.sin(a)} r="5" />
        })}
        <g className="sy-agent"><circle cx="50" cy="12" r="2.6" /></g>
      </svg>
      <span className="sy-mini-halo" />
      <span className="sy-mini-sun">{orbit.sun.repo?.avatar ? <img src={avatar(orbit.sun.repo.avatar, 96)} width={48} height={48} alt="" /> : null}</span>
    </span>
  )
}

/** A sentence with its numbers made the thing you see first. */
const Gives = ({ text }: { text: string }) => (
  <p className="sy-gives">{text.split(/(\d[\d,.]*)/).map((t, i) => (i % 2 ? <b key={i}>{t}</b> : t))}</p>
)

// The dive: a click flies into the body it names (its world grows out of where it sat) and the
// trail flies back out. One same-page view transition; the motion explains where you went.
function dive(from: HTMLElement | null, direction: "in" | "out", update: () => void) {
  const map = from?.closest(".sy")?.querySelector(".sy-map")
  if (from && map) {
    const a = from.getBoundingClientRect(), b = map.getBoundingClientRect()
    document.documentElement.style.setProperty("--dive-x", `${a.left + a.width / 2 - b.left}px`)
    document.documentElement.style.setProperty("--dive-y", `${a.top + a.height / 2 - b.top}px`)
  }
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update()
  // Typed transitions (the object form) exist only where ViewTransitionTypeSet does. Elsewhere, or if the
  // object form throws, the same update runs as a plain crossfade: the dive never becomes an error.
  if ("ViewTransitionTypeSet" in window) {
    try {
      document.startViewTransition({ update: () => flushSync(update), types: [`dive-${direction}`] })
      return
    } catch { /* fall through to the plain crossfade */ }
  }
  document.startViewTransition(() => flushSync(update))
}

type Level = { kind: "world" } | { kind: "piece"; piece: Source } | { kind: "part"; piece: Source; part: Part }

/** A world you can dive into: the world, then any piece's own world, then any part inside it. */
export function System({ orbit, world, initial }: { orbit: Orbit; world: string; initial?: string | null }) {
  const pieceOf = (id: string | null | undefined) => orbit.planets.find((p) => p.id === id)
  const [path, setPath] = useState<string[]>(() => (pieceOf(initial) ? [initial!] : []))
  const stage = useRef<HTMLDivElement>(null)
  const moved = useRef(false) // set by a drill-down; the first render does not move focus
  // The server hands over only the piece, so a link with a part lands on the piece here, then steps in.
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    const part = q.get("part")
    if (q.get("world") !== world || !part) return
    setPath((p) => (p.length === 1 && pieceOf(p[0])?.parts.some((x) => x.id === part) ? [p[0], part] : p))
  }, [])
  // Focus follows the drill-down: the new level's heading takes it, so a keyboard or screen reader reader keeps their place.
  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    stage.current?.querySelector<HTMLElement>("[data-level-title]")?.focus({ preventScroll: true })
  }, [path])
  const piece = pieceOf(path[0])
  const part = piece?.parts.find((x) => x.id === path[1])
  const level: Level = part && piece ? { kind: "part", piece, part } : piece ? { kind: "piece", piece } : { kind: "world" }
  // The address names where you are (?world=vercel&piece=skills&part=ai-sdk), so a link lands there.
  // It replaces the entry rather than adding one: Back still closes the world.
  const go = (next: string[], from: HTMLElement | null) => {
    // A new level opens at its top: on a phone the title, the trail and the copy action are what a reader needs first.
    const dialog = from?.closest("dialog")
    moved.current = true
    dive(from, next.length >= path.length ? "in" : "out", () => { setPath(next); dialog?.scrollTo({ top: 0 }) })
    const q = new URLSearchParams(location.search)
    if (q.get("world") !== world) return
    q.delete("piece"); q.delete("part")
    if (next[0]) q.set("piece", next[0])
    if (next[1]) q.set("part", next[1])
    history.replaceState(history.state, "", `?${q}`)
  }
  const crumbs: { label: string; to: string[] }[] = [
    { label: orbit.sun.name, to: [] },
    ...(piece ? [{ label: piece.name, to: [piece.id] }] : []),
    ...(part && piece ? [{ label: part.name, to: [piece.id, part.id] }] : []),
  ]
  return (
    <div className="sy">
      {/* The trail shows once you are inside a piece: at the world level it would be one lone name. */}
      {crumbs.length > 1 && (
        <nav className="sy-crumbs" aria-label="Where you are">
          {crumbs.map((c, i) => i < crumbs.length - 1
            ? <button key={c.label} type="button" onClick={(e) => go(c.to, e.currentTarget)}>{c.label}</button>
            : <span key={c.label} aria-current="location">{c.label}</span>)}
        </nav>
      )}
      <div className="sy-stage" ref={stage} key={path.join("/") || "world"}>
        {level.kind === "world" && (
          <>
            <Map center={<Face s={orbit.sun} size={44} />} label={orbit.sun.name}
              rings={[orbit.planets.map((p) => ({ id: p.id, name: p.name, tag: tag(p), face: <Face s={p} size={28} />, onPick: (el: HTMLElement) => go([p.id], el) }))]} />
            <SubWorld s={orbit.sun} />
          </>
        )}
        {level.kind === "piece" && (
          <>
            <Map center={<Face s={level.piece} size={44} />} label={level.piece.name} rings={rings(level.piece, (x, el) => go([level.piece.id, x.id], el))} />
            <SubWorld s={level.piece} onPart={(x, el) => go([level.piece.id, x.id], el)} />
          </>
        )}
        {level.kind === "part" && (
          <>
            {/* Arrived: the part sits in a large warm orb, and the piece it belongs to rides the ring, one click up. */}
            <Map variant="part" center={<KindIcon kind={level.part.kind} />} label={level.part.name}
              rings={[[{ id: level.piece.id, name: level.piece.name, tag: null, face: <Face s={level.piece} size={28} />, onPick: (el: HTMLElement) => go([level.piece.id], el) }]]} />
            <PartView part={level.part} piece={level.piece} />
          </>
        )}
      </div>
    </div>
  )
}

type Planet = { id: string; name: string; tag: string | null; face: ReactNode; onPick: (el: HTMLElement) => void }
/** A piece's parts on rings by kind: agents nearest, then commands, then skills. Many become dots. */
function rings(piece: Source, pick: (x: Part, el: HTMLElement) => void): Planet[][] {
  const order: Part["kind"][] = ["agent", "command", "skill"]
  return order.map((k) => piece.parts.filter((x) => x.kind === k)).filter((r) => r.length > 0)
    .map((r) => r.map((x) => ({ id: x.id, name: x.name, tag: null, face: <KindIcon kind={x.kind} />, onPick: (el: HTMLElement) => pick(x, el) })))
}

function Map({ center, label, rings, variant }: { center: ReactNode; label: string; rings: Planet[][]; variant?: "part" }) {
  const radii = variant === "part" ? [42] : rings.length <= 1 ? [36] : rings.length === 2 ? [26, 41] : [22, 32, 43]
  // Many bodies: names move to the list beside the map; the map keeps their shape and count.
  const crowded = rings.reduce((n, r) => n + r.length, 0) > 12
  return (
    <div className={`sy-map${variant === "part" ? " sy-map-part" : ""}`} role="group" aria-label={`${label}, and what it holds`}>
      <svg className="sy-art" viewBox="0 0 100 100" aria-hidden="true">
        {rings.map((_, i) => <circle key={i} className="sy-ring" cx="50" cy="50" r={radii[i]} />)}
        {rings.length > 0 && <g className="sy-agent"><circle cx="50" cy={50 - radii.at(-1)!} r="1.1" /></g>}
      </svg>
      <span className="sy-body sy-sun" style={{ left: "50%", top: "50%" }}><span className="sy-orb">{center}</span></span>
      {rings.map((ring, r) => ring.map((p, i) => {
        const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2 + r * 0.4
        const dot = ring.length > 10, quiet = crowded && !dot
        return (
          <button key={p.id} type="button" className={`sy-body${dot ? " sy-dot-body" : quiet ? " sy-quiet-body" : ""}`}
            style={{ left: pct(50 + radii[r] * Math.cos(a)), top: pct(50 + radii[r] * Math.sin(a)) }} onClick={(e) => p.onPick(e.currentTarget)}>
            <span className="sy-orb">{p.face}</span>
            {dot || quiet ? <span className="sy-sr">{p.name}</span> : <span className="sy-label">{p.name}{p.tag && <small>{p.tag}</small>}</span>}
          </button>
        )
      }))}
    </div>
  )
}

/** Relative time, worked out where it is read, so it is never stale. */
function Ago({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => setNow(Date.now()), [])
  const ms = Date.parse(iso)
  return <time dateTime={iso} suppressHydrationWarning>{ago(ms, now)}</time>
}

function SubWorld({ s, onPart }: { s: Source; onPart?: (x: Part, el: HTMLElement) => void }) {
  const stats = [
    s.repo?.stars != null && <li key="s"><StarIcon />{count(s.repo.stars)}<span>stars</span></li>,
    s.repo?.forks != null && <li key="f"><ForkIcon />{count(s.repo.forks)}<span>forks</span></li>,
    s.weekly != null && <li key="w"><DownIcon />{count(s.weekly)}<span>installs last week</span></li>,
    s.updated && <li key="u"><ClockIcon /><span>updated</span><Ago iso={s.updated} /></li>,
    s.repo?.license && <li key="l"><ScaleIcon />{s.repo.license}</li>,
  ].filter(Boolean)
  const groups = (["agent", "command", "skill"] as const).map((k) => ({ k, xs: s.parts.filter((x) => x.kind === k) })).filter((g) => g.xs.length)
  return (
    <section className="sy-world" aria-label={s.name}>
      <header className="sy-world-head">
        <span className="sy-orb sy-orb-sm"><Face s={s} size={28} /></span>
        <h3 tabIndex={-1} data-level-title>{s.name}</h3>
        {s.version && <code className="sy-ver">{s.version.startsWith("v") ? s.version : `v${s.version}`}</code>}
      </header>
      {s.gives && <Gives text={s.gives} />}
      {s.repo && <a className="sy-slug" href={`https://github.com/${s.repo.slug}`}>{s.repo.slug}</a>}
      {s.blurb && s.blurb !== s.gives && <p className="sy-blurb">{s.blurb}</p>}
      {stats.length > 0 && <ul className="sy-stats">{stats}</ul>}
      {s.works.length > 0 && <p className="sy-works"><span>Packaged for</span>{s.works.map((w) => <i key={w}>{w}</i>)}</p>}
      {onPart && groups.map((g) => (
        <div key={g.k} className="sy-group">
          <p className="sy-group-head"><KindIcon kind={g.k} /><b>{g.xs.length}</b> {g.k}{g.xs.length === 1 ? "" : "s"}</p>
          <ul className="sy-items">
            {g.xs.map((x) => <li key={x.id}><button type="button" onClick={(e) => onPart(x, e.currentTarget)}>{x.name}</button></li>)}
          </ul>
        </div>
      ))}
      {s.kind === "cli" && s.items.length > 0 && <ul className="sy-items">{s.items.map((it) => <li key={it}><code>{it}</code></li>)}</ul>}
      <ul className="sy-refs">
        {s.refs.map((r) => <li key={r.href}><a href={r.href}>{r.label}<OutIcon /></a></li>)}
      </ul>
    </section>
  )
}

const KIND_WORD: Record<Part["kind"], string> = { skill: "Skill", agent: "Specialist agent", command: "Command" }
function PartView({ part, piece }: { part: Part; piece: Source }) {
  return (
    <section className="sy-world" aria-label={part.name}>
      <header className="sy-world-head">
        <span className="sy-orb sy-orb-sm"><KindIcon kind={part.kind} /></span>
        <h3 tabIndex={-1} data-level-title>{part.name}</h3>
        <code className="sy-ver">{KIND_WORD[part.kind]}</code>
      </header>
      {part.blurb ? <p className="sy-part-blurb">{part.blurb}</p> : <p className="sy-blurb">Its makers haven&apos;t described it yet.</p>}
      {piece.repo && <a className="sy-slug" href={part.href}>{piece.repo.slug} / {part.id}</a>}
      <ul className="sy-refs"><li><a href={part.href}>Read it on GitHub<OutIcon /></a></li></ul>
    </section>
  )
}
