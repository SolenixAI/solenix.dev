"use client"

import type { CSSProperties } from "react"
import type { Entry, Orbit, Source } from "@/lib/marketplace"
import { avatar } from "@/lib/avatar"
import { KindIcon } from "./system"

// The whole marketplace as one solar system: Solenix's core toolkit is the sun at the centre, and each world
// is a planet on the ring with its pieces as moons. It grows by itself as the catalog grows. Every body is a
// link to its world (?world=id), so it works without script and the page's dialog opens it in place. The
// toolkit's own tools live inside the sun's world, not as planets: shown on the ring under their package names
// and parent-org logos they read as worlds they are not. Each body's name and live number are one tag, set
// beside the body it names: a planet's tag sits outside the orbit line, the sun's tag sits under the sun.

export type Body = { entry: Pick<Entry, "id" | "part" | "name">; orbit: Orbit }

const compact = (n: number) => new Intl.NumberFormat("en-CA", { notation: "compact", maximumFractionDigits: 1 }).format(n)
const pct = (v: number) => `${+v.toFixed(3)}%`
const px = (v: number) => `${+v.toFixed(2)}px`
const RING = 39 // the orbit's radius in the sky's 100-unit art: 39% of the sky's width
const PIECE_R = 66 // px from a planet's centre to its pieces: inside the ring, clear of the orbit line, the sun and the logo
const PIECE_STEP = 26 // degrees between neighbouring pieces on their arc

// The first world starts up and to the right of the sun (-72 degrees), so its tag fits beside it on a 390px phone.
// The rest spread round the ring from there.
const place = (i: number, n: number) => {
  const a = (-72 * Math.PI) / 180 + (i / n) * Math.PI * 2
  return { x: Math.cos(a), y: Math.sin(a) }
}
// A tag sits on the side of its planet that faces away from the sun, so it never reaches the orbit line.
const side = (u: { x: number; y: number }) => (u.x >= 0.3 ? "r" : u.x <= -0.3 ? "l" : u.y < 0 ? "t" : "b")

// A planet's pieces ride one arc on the sun's side of it.
function pieces(planets: Source[], u: { x: number; y: number }) {
  const inward = Math.atan2(-u.y, -u.x)
  const step = Math.min(PIECE_STEP, 110 / Math.max(1, planets.length - 1))
  return planets.map((piece, k) => {
    const a = inward + ((k - (planets.length - 1) / 2) * step * Math.PI) / 180
    return { piece, dx: PIECE_R * Math.cos(a), dy: PIECE_R * Math.sin(a) }
  })
}

function Face({ s, size }: { s: Source; size: number }) {
  return s.repo?.avatar ? <img src={avatar(s.repo.avatar, size * 2)} width={size} height={size} alt="" /> : <KindIcon kind={s.kind} />
}

export function Sky({ bodies }: { bodies: Body[] }) {
  const core = bodies.find((b) => b.entry.part === "toolkit")
  const worlds = bodies.filter((b) => b.entry.part === "world")
  const weekly = core ? core.orbit.planets.reduce((sum, p) => sum + (p.weekly ?? 0), 0) : 0
  return (
    <div className="sk" role="group" aria-label="The marketplace: the core toolkit and every world">
      <svg className="sk-art" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="sy-ring" cx="50" cy="50" r={RING} />
        <g className="sy-agent"><circle cx="50" cy={50 - RING} r=".9" /></g>
      </svg>
      <div className="sk-moons" aria-hidden="true">
        {worlds.flatMap((w, i) => {
          const u = place(i, worlds.length)
          return pieces(w.orbit.planets, u).map(({ piece, dx, dy }) => (
            <span
              key={`${w.entry.id}-${piece.id}`}
              className="sk-moon"
              title={piece.name}
              style={{ left: `calc(${pct(50 + RING * u.x)} + ${px(dx)})`, top: `calc(${pct(50 + RING * u.y)} + ${px(dy)})` }}
            >
              <KindIcon kind={piece.kind} />
            </span>
          ))
        })}
      </div>
      {core ? (
        <a href={`?world=${core.entry.id}`} data-world={core.entry.id} className="sk-sun">
          <span className="sk-halo" />
          <span className="sk-tag sk-tag-sun">
            <span className="sk-name">{core.entry.name}</span>
            {weekly > 0 && <span className="sk-num">{compact(weekly)} downloads a week</span>}
          </span>
        </a>
      ) : (
        <span className="sk-sun" aria-hidden="true"><span className="sk-halo" /></span>
      )}
      {worlds.map((w, i) => {
        const u = place(i, worlds.length)
        const stars = w.orbit.sun.repo?.stars
        return (
          <a
            key={w.entry.id}
            href={`?world=${w.entry.id}`}
            data-world={w.entry.id}
            className="sk-body"
            style={{ left: pct(50 + RING * u.x), top: pct(50 + RING * u.y), "--ux": u.x.toFixed(3), "--uy": u.y.toFixed(3) } as CSSProperties}
          >
            <span className="sk-orb"><Face s={w.orbit.sun} size={44} /></span>
            <span className={`sk-tag sk-tag-${side(u)}`}>
              <span className="sk-name">{w.entry.name}</span>
              {stars != null && <span className="sk-num">{compact(stars)} stars</span>}
            </span>
          </a>
        )
      })}
    </div>
  )
}
