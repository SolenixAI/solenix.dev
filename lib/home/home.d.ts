// Types the homepage's modules share (lib/home/ui.ts, journey.ts, scene.ts). Ambient on purpose: this file has no
// import or export, so each name is global. It is types only.

/** What the scroll story sets: one number each, blended between two keyframes (lib/home/ui.ts, KEYS). */
interface HomeSceneParams {
  k: number; free: number; order: number; ink: number; third: number
  el: number; az: number; dist: number; ox: number; oy: number; poy: number
  calm: number; dim: number; labels: number; conn: number; agent: number; stops: number
  tx: number; tz: number; fly: number; wsel: number; hero: number; lens: number
  rf: number; rs: number; sp: number; rw: number
}

/** A tool world the camera flies to: its place, its view, and where the three bodies roam beside it. */
interface HomeFlyWorld {
  id: string; tx: number; tz: number; el: number; dist: number
  a: [number, number]; sp: number; rw: number
}

/** The page's shared state: written by lib/home/ui.ts, read by lib/home/scene.ts. */
interface Solenix {
  motion: boolean
  vh: number
  scene: HomeSceneParams
  smooth: (a: number, b: number, x: number) => number
  hero: { el: number; dist: number; lens: number }
  fly: HomeFlyWorld[]
  /** The journey stop the page is at (lib/home/journey.ts); its length means the close. */
  cur: number
  /** The part of the story the page is at (lib/home/journey.ts sec), or close. */
  sec: string
  stops: HTMLElement[]
  pingN: number
  jCur: number
  /** Per tool stop, the ask the visitor's world is answering (lib/home/proof.ts); absent: not asked yet. */
  asked: Record<string, number>
  /** The ask playing now, and when it started (performance.now() ms). Null before any tool stop. */
  play: { tool: string; ask: number; at: number } | null
  /** Plays ask i of a tool (from a tap in the world or a button). */
  ask: (tool: string, i: number) => void
}

interface Window {
  solenix: Solenix
}
