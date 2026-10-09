import type { Metadata } from "next"
import { Suspense } from "react"
import { GithubIcon } from "@/components/brand/github-icon"
import { count } from "@/lib/format"
import { getCatalog, MARKETPLACE_REPO, orbit, type Entry } from "@/lib/marketplace"
import { OG_IMAGE } from "@/lib/site-meta"
import { HERO_CSS } from "@/lib/site-hero"
import { DownIcon, MiniOrbit, StarIcon, System } from "./system"
import { Worlds, type Card } from "./worlds"
import { WORLDS_CSS } from "./worlds-css"

// solenix.dev/agents: the core toolkit and the worlds Solenix stands behind. The catalog is read live
// from the marketplace (SolenixAI/agents-marketplace, worlds.json) on every visit, so a world added
// there appears here on the next load with no change to this page. Each world's system (its maker
// and pieces, with their live numbers) streams in as its sources answer; it never holds up the page.

async function Glance({ entry }: { entry: Entry }) {
  const o = await orbit(entry)
  // A world shows its maker's stars; the toolkit, how many people installed its tools last week.
  const weekly = o.planets.reduce((sum, p) => sum + (p.weekly ?? 0), 0)
  const lead = entry.part === "toolkit"
    ? weekly > 0 && <span><DownIcon />{count(weekly)}</span>
    : o.sun.repo?.stars != null && <span><StarIcon />{count(o.sun.repo.stars)}</span>
  return (
    <>
      <MiniOrbit orbit={o} />
      <span className="wd-stat">
        {lead}
        <span>{entry.part === "toolkit" ? "installs a week" : "stars"}</span>
      </span>
    </>
  )
}
async function Inside({ entry, piece }: { entry: Entry; piece: string | null }) {
  return <System orbit={await orbit(entry)} world={entry.id} initial={piece} />
}
// While a world's sources answer, its place is held by the bare ring, so nothing jumps when they land.
const Ring = ({ big }: { big?: boolean }) => (
  <span className={big ? "sy-map sy-wait" : "sy-mini sy-wait"} aria-hidden="true">
    <svg viewBox="0 0 100 100"><circle className="sy-ring" cx="50" cy="50" r={big ? 36 : 38} /></svg>
  </span>
)

// A shared world link (?world=vercel) previews that world: its name and its one line, read live.
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ world?: string }> }): Promise<Metadata> {
  const { world } = await searchParams
  const entry = world ? (await getCatalog())?.find((e) => e.id === world) : undefined
  const title = entry ? `${entry.name} for your AI` : "Agents Marketplace"
  const description = entry ? `${entry.for} One sentence sets it up in any AI agent, the makers' way.` : "Set up your AI the makers' way: one sentence installs everything a tool's makers built for AI, in any AI agent."
  const url = `https://solenix.dev/agents${entry ? `?world=${entry.id}` : ""}`
  return {
    title, description,
    alternates: { canonical: url, types: { "application/json": "/agents/worlds.json" } },
    openGraph: { title: `${title} · Solenix`, description, url, images: [OG_IMAGE] },
  }
}

const SPEC_NAMES: Record<string, string> = { skills: "Agent Skills", mcp: "Model Context Protocol", plugin: "Agent Plugins" }

export default async function Agents({ searchParams }: { searchParams: Promise<{ world?: string; piece?: string }> }) {
  const [catalog, { world, piece }] = await Promise.all([getCatalog(), searchParams])
  const card = (entry: Entry): Card => ({
    entry,
    glance: <Suspense fallback={<Ring />}><Glance entry={entry} /></Suspense>,
    inside: <Suspense fallback={<Ring big />}><Inside entry={entry} piece={entry.id === world ? piece ?? null : null} /></Suspense>,
  })
  const specs = Object.entries(catalog?.[0]?.specs ?? {})
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS + WORLDS_CSS }} />
      <header className="sx-hero wd-hero" data-hero>
        <div className="sx-hero-in">
          <div className="sx-hero-text">
            <h1>Your AI, set up <em>the makers&apos; way.</em></h1>
            <p className="sx-sub">Paste one sentence. Your AI installs everything a tool&apos;s makers built for it.</p>
          </div>
          {catalog && catalog.length > 0 ? (
            <Worlds cards={catalog.map(card)} initial={world ?? null} />
          ) : (
            <div className="wd-grid">
              <a className="wd-card" href={MARKETPLACE_REPO}>
                <span className="wd-for">{catalog ? "The first world is on its way." : "We couldn't load the worlds just now."}</span>
                <span className="wd-name">See them on GitHub</span>
              </a>
            </div>
          )}
        </div>
        <a className="sx-cue" href="#how">How it works ↓</a>
      </header>

      <div className="mx-auto flex w-full max-w-wide flex-col gap-(--space-section) px-(--gutter) pb-(--space-section)">
        <section id="how" aria-labelledby="how-title">
          <h2 id="how-title" className="mb-8 font-display text-h2 font-brand">How it works</h2>
          <ol className="wd-steps">
            <li><b>Paste</b><span>one sentence into any AI agent</span></li>
            <li><b>Install</b><span>the makers&apos; own plugin, skills, connector and tools</span></li>
            <li><b>Prove</b><span>it signs you in and shows you it works</span></li>
          </ol>
        </section>
        <section aria-label="Open standards and source" className="wd-foot">
          {specs.length > 0 && (
            <p><span>Built on open standards</span>{specs.map(([k, href]) => <a key={k} href={href}>{SPEC_NAMES[k] ?? k}</a>)}</p>
          )}
          <p>
            <a className="wd-gh" href={MARKETPLACE_REPO}><GithubIcon />The marketplace on GitHub</a>
            <a href={`${MARKETPLACE_REPO}/issues/new?template=2-suggest-a-world.yml`}>Suggest a world</a>
          </p>
        </section>
      </div>
    </>
  )
}
