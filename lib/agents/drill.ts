// The drill-down of an agents world: where a path lands (the level), the trail back up (the crumbs), the address that
// names it, and which way a dive moves. Pure: a path and the address in, the same answer out. The page keeps the DOM,
// the history and the motion (app/(site)/agents/system.tsx).
//   node --test lib/agents/drill.test.ts

import type { Orbit, Part, Piece } from "@/lib/marketplace"

/** [] is the world, [piece] a piece's world, [piece, part] a part inside it. */
export type Path = string[]
export type Level = { kind: "world" } | { kind: "piece"; piece: Piece } | { kind: "part"; piece: Piece; part: Part }
export type Crumb = { label: string; to: Path }

/** The piece with this id in the orbit, or undefined for an unknown or missing id. */
const pieceOf = (orbit: Orbit, id: string | null | undefined): Piece | undefined => orbit.planets.find((p) => p.id === id)

/** Where a path lands: an unknown piece is the world; an unknown part leaves you at its piece. */
export function levelOf(orbit: Orbit, path: Path): Level {
  const piece = pieceOf(orbit, path[0])
  const part = piece?.parts.find((x) => x.id === path[1])
  return part && piece ? { kind: "part", piece, part } : piece ? { kind: "piece", piece } : { kind: "world" }
}

/** The trail back up: the sun always, then the piece, then the part. Each crumb names the path it returns to. */
export function crumbsOf(orbit: Orbit, path: Path): Crumb[] {
  const level = levelOf(orbit, path)
  return [
    { label: orbit.sun.name, to: [] },
    ...(level.kind !== "world" ? [{ label: level.piece.name, to: [level.piece.id] }] : []),
    ...(level.kind === "part" ? [{ label: level.part.name, to: [level.piece.id, level.part.id] }] : []),
  ]
}

/** The path a page opens on: the piece named in the address, when the orbit holds it; otherwise the world. */
export const initialPath = (orbit: Orbit, initial: string | null | undefined): Path =>
  initial && pieceOf(orbit, initial) ? [initial] : []

/** A link with a part lands on its piece, then steps in to the part, when the orbit holds both. Anything else is unchanged. */
export function enterPart(orbit: Orbit, path: Path, world: string, search: string): Path {
  const q = new URLSearchParams(search)
  const part = q.get("part")
  if (q.get("world") !== world || !part) return path
  return path.length === 1 && pieceOf(orbit, path[0])?.parts.some((x) => x.id === part) ? [path[0], part] : path
}

/** The address for a path (?world=…&piece=…&part=…). An address names only its own world, so another world's page gets null. Other parameters stay. */
export function addressFor(world: string, search: string, path: Path): string | null {
  const q = new URLSearchParams(search)
  if (q.get("world") !== world) return null
  q.delete("piece")
  q.delete("part")
  if (path[0]) q.set("piece", path[0])
  if (path[1]) q.set("part", path[1])
  return `?${q}`
}

/** A dive flies in when the path gets as deep as it was or deeper, and out when it gets shallower. */
export const diveOf = (from: Path, to: Path): "in" | "out" => (to.length >= from.length ? "in" : "out")
