"use client"

import { useState } from "react"
import { count } from "@/lib/format"

// The Agents Marketplace hero. Everything in it is read from the live tool list: the tools, their
// GitHub stars, the totals. Pick a tool and its one-line install is the command; with none picked,
// the command adds the marketplace. One action: copy the line.

export type HeroTool = { name: string; category: string; description: string; stars: number | null }
export type HeroVariant = "orbit" | "command" | "wall"

const AGENTS = {
  claude: { label: "Claude Code", add: "/plugin marketplace add SolenixAI/agents-marketplace", install: (t: string) => `/plugin install ${t}@solenix` },
  codex: { label: "Codex", add: "codex plugin marketplace add SolenixAI/agents-marketplace", install: (t: string) => `codex plugin add ${t}@solenix` },
} as const
type Agent = keyof typeof AGENTS

export function AgentsHero({ tools, variant, sun }: { tools: HeroTool[]; variant: HeroVariant; sun: string }) {
  const [agent, setAgent] = useState<Agent>("claude")
  const [pick, setPick] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const a = AGENTS[agent]
  const line = pick ? a.install(pick) : a.add
  const stars = tools.reduce((s, t) => s + (t.stars ?? 0), 0)
  const known = tools.some((t) => t.stars != null) // a number nobody has read is never shown as 0
  const choose = (name: string | null) => { setPick((p) => (p === name ? null : name)); setCopied(false) }
  const picked = tools.find((t) => t.name === pick)

  const bar = (
    <div className="ah-bar">
      <div className="ah-tabs" role="tablist" aria-label="Your agent">
        {(Object.keys(AGENTS) as Agent[]).map((k) => (
          <button key={k} role="tab" aria-selected={agent === k} onClick={() => { setAgent(k); setCopied(false) }}>{AGENTS[k].label}</button>
        ))}
      </div>
      <div className="ah-line">
        <code>{line}</code>
        <button
          className="ah-copy"
          onBlur={() => setCopied(false)}
          onClick={async () => { try { await navigator.clipboard.writeText(line); setCopied(true) } catch { setCopied(false) } }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="ah-say" aria-live="polite">
        {picked ? <>Installs <b>{picked.name}</b>: {picked.description}</> : <>Adds all {tools.length}. Or pick one{variant === "command" ? " below" : ""}.</>}
      </p>
    </div>
  )

  const text = (
    <div className="sx-hero-text">
      <h1>Agent tools in <em>one line.</em></h1>
      <p className="sx-sub">
        {tools.length} tools your agent installs itself{known ? <>, {count(stars)} GitHub stars between them, read live</> : null}. Which one first?
      </p>
      {variant !== "command" && bar}
    </div>
  )

  return (
    <header className={`sx-hero ah ah--${variant}`} data-hero>
      <div className="sx-hero-in">
        {text}
        {variant === "orbit" && <Orbit tools={tools} pick={pick} choose={choose} sun={sun} />}
        {variant === "wall" && <Wall tools={tools} pick={pick} choose={choose} />}
        {variant === "command" && (
          <div className="ah-cmd">
            {bar}
            <Chips tools={tools} pick={pick} choose={choose} />
          </div>
        )}
      </div>
      <a className="sx-cue" href="#add">Every way to add it ↓</a>
    </header>
  )
}

type Pickable = { tools: HeroTool[]; pick: string | null; choose: (n: string | null) => void }

// The marketplace is the sun; each tool orbits it, sized by its real GitHub stars.
function Orbit({ tools, pick, choose, sun }: Pickable & { sun: string }) {
  const sorted = [...tools].sort((x, y) => (y.stars ?? 0) - (x.stars ?? 0))
  const max = Math.max(1, ...sorted.map((t) => t.stars ?? 0))
  const rings = [24, 35, 46]
  const per = Math.ceil(sorted.length / rings.length)
  return (
    <div className="ah-orbit">
      <svg viewBox="-50 -50 100 100" role="group" aria-label="Tools in the marketplace, sized by GitHub stars">
        {rings.map((r) => <circle key={r} r={r} className="ah-ring" />)}
        {/* the Solenix mark, drawn on the server from its one source */}
        <g transform="translate(-16 -16)" dangerouslySetInnerHTML={{ __html: sun }} />
        {sorted.map((t, i) => {
          const ring = Math.floor(i / per), k = i % per, n = Math.min(per, sorted.length - ring * per)
          const ang = (k / n) * Math.PI * 2 - Math.PI / 2 + ring * 0.7
          const r = rings[ring], x = Math.cos(ang) * r, y = Math.sin(ang) * r
          const size = 2.2 + 3.6 * (Math.log10((t.stars ?? 0) + 1) / Math.log10(max + 1))
          const on = pick === t.name
          return (
            <g key={t.name} className={`ah-planet${on ? " on" : ""}`} role="button" tabIndex={0} aria-pressed={on}
              aria-label={`${t.name}, ${t.stars != null ? `${count(t.stars)} stars` : "no star count"}`}
              onClick={() => choose(t.name)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(t.name) } }}>
              <circle cx={x} cy={y} r={size + 3} className="ah-hit" />
              <circle cx={x} cy={y} r={size} className="ah-body" />
              <text x={x} y={y + size + 3.6} textAnchor="middle">{t.name}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Every tool as a tile with its live stars.
function Wall({ tools, pick, choose }: Pickable) {
  return (
    <div className="ah-wall">
      {tools.map((t) => (
        <button key={t.name} className="ah-tile" aria-pressed={pick === t.name} onClick={() => choose(t.name)}>
          <span className="ah-cat">{t.category}</span>
          <span className="ah-name">{t.name}</span>
          <span className="ah-stars">{t.stars != null ? `★ ${count(t.stars)}` : "—"}</span>
        </button>
      ))}
    </div>
  )
}

function Chips({ tools, pick, choose }: Pickable) {
  return (
    <div className="ah-chips">
      {tools.map((t) => (
        <button key={t.name} aria-pressed={pick === t.name} onClick={() => choose(t.name)}>
          {t.name}{t.stars != null && <span>★ {count(t.stars)}</span>}
        </button>
      ))}
    </div>
  )
}
