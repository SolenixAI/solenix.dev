import type { CSSProperties } from "react"

/** Where a section's one light sits (DESIGN.md §4). Scoped to the section — never fixed. */
export type Light = { x: string; y: string; size: string; strength: number; orbit: string }

export const lightStyle = (l: Light) =>
  ({
    "--light-x": l.x,
    "--light-y": l.y,
    "--light-size": l.size,
    "--light-strength": l.strength,
    "--orbit-size": l.orbit,
  }) as CSSProperties

/** The hero's full sky: halo, sun, stars, three rings and three riding dots, veil. */
export function HeroSky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-halo" />
      <div className="sky-light" />
      <div className="sky-stars" />
      <svg className="sky-orbit" viewBox="0 0 800 800">
        <circle className="ring-line" cx="400" cy="400" r="250" />
        <circle className="ring-line ring-faint" cx="400" cy="400" r="330" />
        <circle className="ring-line ring-faint" cx="400" cy="400" r="395" />
        <path className="ring-arc" d="M150 400a250 250 0 0 1 250-250" />
        <g className="orbit-track"><circle className="ring-dot" cx="400" cy="150" r="6" /></g>
        <g className="orbit-track t2"><circle className="ring-dot" cx="70" cy="400" r="5" /></g>
        <g className="orbit-track t3"><circle className="ring-dot" cx="400" cy="795" r="4" /></g>
      </svg>
      <div className="sky-veil" />
    </div>
  )
}

/** A quieter sky: one arc and a faint ring behind a statement. */
export function StatementSky() {
  return (
    <div className="sky" aria-hidden="true">
      <svg className="sky-orbit" viewBox="0 0 800 800">
        <path className="ring-arc" d="M120 400a280 280 0 0 1 560 0" />
        <circle className="ring-line ring-faint" cx="400" cy="400" r="340" />
      </svg>
      <div className="sky-light" />
    </div>
  )
}

export function ClosingSky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-halo" />
      <div className="sky-light" />
      <svg className="sky-orbit" viewBox="0 0 800 800">
        <circle className="ring-line ring-faint" cx="400" cy="400" r="300" />
        <path className="ring-arc" d="M400 100a300 300 0 0 1 300 300" />
        <g className="orbit-track"><circle className="ring-dot" cx="400" cy="100" r="5" /></g>
      </svg>
    </div>
  )
}
