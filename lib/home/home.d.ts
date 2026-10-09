// Types the homepage's modules share (lib/home/ui.ts, races.ts, scene.ts). Ambient on purpose: this file has no
// import or export, so each name is global. It is types only.

/** What the scroll story sets: one number each, blended between two keyframes (lib/home/ui.ts, KEYS). */
interface HomeSceneParams {
  k: number; free: number; order: number; ink: number; third: number
  el: number; az: number; dist: number; ox: number; oy: number; poy: number
  calm: number; dim: number; labels: number; conn: number; agent: number; stops: number
  tx: number; tz: number; fly: number; wsel: number; hero: number; lens: number
  rf: number; rs: number; sp: number; rw: number; shl: number
}

/** A tool world the camera flies to: its place, its view, and where the three bodies roam beside it. */
interface HomeFlyWorld {
  id: string; tx: number; tz: number; el: number; dist: number
  a: [number, number]; b: [number, number]; sp: number; rw: number
}

/** The page's shared state: written by lib/home/ui.ts, read by lib/home/scene.ts. */
interface Solenix {
  p: number
  motion: boolean
  vh: number
  scene: HomeSceneParams
  sceneIdx: number
  smooth: (a: number, b: number, x: number) => number
  hero: { el: number; dist: number; lens: number }
  fly: HomeFlyWorld[]
  /** The selector of the section the scroll is in. */
  sec: string
  stops: HTMLElement[]
  pingN: number
  prCur?: number
  retAlpha: number
  jCur: number
}

interface Window {
  solenix: Solenix
}
