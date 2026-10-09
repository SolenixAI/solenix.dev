"use client"

import { getImageProps } from "next/image"
import { useEffect, useState, type ReactNode } from "react"
import { ago, count } from "@/lib/format"
import type { Kind, Orbit, Source } from "@/lib/marketplace"

// A world as a small solar system: the maker is the sun, each piece a planet on one orbit ring (the
// Solenix mark: a sun, one ring, one agent dot). Pick any body and its sub-world opens beside it:
// what it is in its makers' words, its live numbers, what is inside, and every source to check.

const compact = (n: number) => new Intl.NumberFormat("en-CA", { notation: "compact", maximumFractionDigits: 1 }).format(n)
/** A GitHub avatar, served through this site's own image optimiser (nothing loads from another host). */
export const avatar = (src: string, size: number) => getImageProps({ src, width: size, height: size, alt: "" }).props.src

const PATHS: Record<Exclude<Kind, "maker" | "tool">, ReactNode> = {
  plugin: <path d="M9 3.5h6v3a1.5 1.5 0 0 0 3 0V6h2.5v5.5H19a1.5 1.5 0 0 0 0 3h1.5V20h-5.5v-1.5a1.5 1.5 0 0 0-3 0V20H6.5v-5.5H8a1.5 1.5 0 0 0 0-3H6.5V6H9z" />,
  skills: <><path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z" /><path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3" /><path d="m11 8 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></>,
  connector: <><path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0z" /><path d="M12 16v5" /></>,
  cli: <><rect x="3" y="4.5" width="18" height="15" rx="2.5" /><path d="m7 10 3 2.5L7 15M12.5 15H17" /></>,
  api: <path d="M8.5 4.5C6 4.5 6 6 6 8s-.5 3.5-2 4c1.5.5 2 2 2 4s0 3.5 2.5 3.5M15.5 4.5C18 4.5 18 6 18 8s.5 3.5 2 4c-1.5.5-2 2-2 4s0 3.5-2.5 3.5" />,
}
export function KindIcon({ kind }: { kind: Kind }) {
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
      <span className="sy-mini-sun">{orbit.sun.repo?.avatar ? <img src={avatar(orbit.sun.repo.avatar, 96)} width={48} height={48} alt="" /> : null}</span>
    </span>
  )
}

/** The interactive system inside a world: pick a body, see its sub-world. */
export function System({ orbit, world, initial }: { orbit: Orbit; world: string; initial?: string | null }) {
  const bodies = [orbit.sun, ...orbit.planets]
  const [pick, setPick] = useState(() => (bodies.some((b) => b.id === initial) ? initial! : orbit.sun.id))
  const body = bodies.find((b) => b.id === pick) ?? orbit.sun
  // The address names the open body (?world=vercel&piece=skills), so a link opens straight to it.
  // It replaces the entry rather than adding one: Back still closes the world.
  const choose = (id: string) => {
    setPick(id)
    const q = new URLSearchParams(location.search)
    if (q.get("world") !== world) return
    if (id === orbit.sun.id) q.delete("piece"); else q.set("piece", id)
    history.replaceState(history.state, "", `?${q}`)
  }
  const n = orbit.planets.length
  return (
    <div className="sy">
      <div className="sy-map" role="radiogroup" aria-label="What this world is made of">
        <svg className="sy-art" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="sy-ring" cx="50" cy="50" r="36" />
          <g className="sy-agent"><circle cx="50" cy="14" r="1.2" /></g>
        </svg>
        <Body s={orbit.sun} x={50} y={50} sun on={pick === orbit.sun.id} choose={choose} />
        {orbit.planets.map((p, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2
          return <Body key={p.id} s={p} x={50 + 36 * Math.cos(a)} y={50 + 36 * Math.sin(a)} on={pick === p.id} choose={choose} />
        })}
      </div>
      <SubWorld key={body.id} s={body} />
    </div>
  )
}

function Body({ s, x, y, sun, on, choose }: { s: Source; x: number; y: number; sun?: boolean; on: boolean; choose: (id: string) => void }) {
  const t = tag(s)
  return (
    <button type="button" role="radio" aria-checked={on} className={`sy-body${sun ? " sy-sun" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => choose(s.id)}>
      <span className="sy-orb"><Face s={s} size={sun ? 44 : 28} /></span>
      <span className="sy-label">{s.name}{t && <small>{t}</small>}</span>
    </button>
  )
}

/** Relative time, worked out where it is read, so it is never stale. */
function Ago({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => setNow(Date.now()), [])
  const ms = Date.parse(iso)
  return <time dateTime={iso} suppressHydrationWarning>{ago(ms, now)}</time>
}

const SHOWN = 12

function SubWorld({ s }: { s: Source }) {
  const [all, setAll] = useState(false)
  const items = all ? s.items : s.items.slice(0, SHOWN)
  const stats = [
    s.repo?.stars != null && <li key="s"><StarIcon />{count(s.repo.stars)}<span>stars</span></li>,
    s.repo?.forks != null && <li key="f"><ForkIcon />{count(s.repo.forks)}<span>forks</span></li>,
    s.weekly != null && <li key="w"><DownIcon />{count(s.weekly)}<span>installs last week</span></li>,
    s.updated && <li key="u"><ClockIcon /><span>updated</span><Ago iso={s.updated} /></li>,
    s.repo?.license && <li key="l"><ScaleIcon />{s.repo.license}</li>,
  ].filter(Boolean)
  return (
    <section className="sy-world" aria-live="polite" aria-label={s.name}>
      <header className="sy-world-head">
        <span className="sy-orb sy-orb-sm"><Face s={s} size={28} /></span>
        <h3>{s.name}</h3>
        {s.version && <code className="sy-ver">{s.version.startsWith("v") ? s.version : `v${s.version}`}</code>}
      </header>
      {s.repo && <a className="sy-slug" href={`https://github.com/${s.repo.slug}`}>{s.repo.slug}</a>}
      {s.blurb && <p className="sy-blurb">{s.blurb}</p>}
      {stats.length > 0 && <ul className="sy-stats">{stats}</ul>}
      {s.contents.length > 0 && (
        <ul className="sy-inside" aria-label="Inside">
          {s.contents.map((c) => <li key={c.label}>{c.label === "connector" || c.label === "hooks" ? <CheckIcon /> : <b>{c.n}</b>}{c.label}</li>)}
        </ul>
      )}
      {s.works.length > 0 && <p className="sy-works"><span>Packaged for</span>{s.works.map((w) => <i key={w}>{w}</i>)}</p>}
      {items.length > 0 && (
        <ul className="sy-items" aria-label={s.kind === "cli" ? "Install" : "Skills"}>
          {items.map((it) => <li key={it}><code>{it}</code></li>)}
          {!all && s.items.length > SHOWN && <li><button type="button" onClick={() => setAll(true)}>+{s.items.length - SHOWN} more</button></li>}
        </ul>
      )}
      <ul className="sy-refs">
        {s.refs.map((r) => <li key={r.href}><a href={r.href}>{r.label}<OutIcon /></a></li>)}
      </ul>
    </section>
  )
}
