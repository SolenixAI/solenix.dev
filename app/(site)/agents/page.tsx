import type { Metadata } from "next"
import { Suspense } from "react"
import { GithubIcon } from "@/components/brand/github-icon"
import { catalogVersion, getCatalog, MARKETPLACE_REPO, orbit, type Entry } from "@/lib/marketplace"
import { OG_IMAGE } from "@/lib/site-meta"
import { HERO_CSS } from "@/lib/site-hero"
import { Sky } from "./sky"
import { DownIcon, KindIcon, MiniOrbit, StarIcon, System } from "./system"
import { CopyCard, HeroAsk, SentenceCopy, Worlds, type Card } from "./worlds"
import { WORLDS_CSS } from "./worlds-css"

// solenix.dev/agents: the core toolkit and the worlds Solenix stands behind. The catalog is read from the
// marketplace (SolenixAI/agents-marketplace, worlds.json) through Next's data cache, which a push to it
// expires (app/api/github): a world added there appears here within a second, with no change to this page.
// The hero and the steps paint first. Each part that needs the catalog streams in after, into a place that
// already has its final size, so nothing below the hero moves when it lands.

// A card says what its world is made of, piece by piece, each with its live number.
const compact = (n: number) => new Intl.NumberFormat("en-CA", { notation: "compact", maximumFractionDigits: 1 }).format(n)
async function Chips({ entry }: { entry: Entry }) {
  const o = await orbit(entry)
  const weekly = o.planets.reduce((sum, p) => sum + (p.weekly ?? 0), 0)
  return (
    <>
      {entry.part === "toolkit"
        ? weekly > 0 && <span><DownIcon />{compact(weekly)} a week</span>
        : o.sun.repo?.stars != null && <span><StarIcon />{compact(o.sun.repo.stars)}</span>}
      {o.planets.map((p) => (
        <span key={p.id}><KindIcon kind={p.kind} />{p.kind === "skills" && p.parts.length ? `${p.parts.length} skills` : p.name}</span>
      ))}
    </>
  )
}
// The card's picture: its world as a small system, the maker as the sun and one dot per piece (system.tsx).
async function Glance({ entry }: { entry: Entry }) {
  return <MiniOrbit orbit={await orbit(entry)} />
}
async function Inside({ entry, piece }: { entry: Entry; piece: string | null }) {
  return <System orbit={await orbit(entry)} world={entry.id} initial={piece} />
}
async function SkyNow({ catalog }: { catalog: Entry[] }) {
  return <Sky bodies={await Promise.all(catalog.map(async (e) => ({ entry: { id: e.id, part: e.part, name: e.name }, orbit: await orbit(e) })))} />
}
// While sources answer, places are held by bare rings, so nothing jumps when they land.
const Ring = ({ sky }: { sky?: boolean }) => (
  <span className={sky ? "sk sk-wait" : "sy-map sy-wait"} aria-hidden="true">
    <svg className="sk-art" viewBox="0 0 100 100">{sky ? <><circle className="sy-ring" cx="50" cy="50" r="21" /><circle className="sy-ring" cx="50" cy="50" r="39" /></> : <circle className="sy-ring" cx="50" cy="50" r="36" />}</svg>
  </span>
)

// The places the catalog fills hold their final size in both states (streaming in, and filled), so nothing
// moves when it lands. The list holds one row of two cards on a desktop and two stacked on a phone; the specs
// hold one row of pills on a desktop and three stacked on a phone. Each size is at least what the catalog
// fills today: a catalog that grows past it moves the page down, never up.
const WAIT_CSS = `
:root{--wd-list-h:24.625rem;--wd-specs-h:2.5rem}
@media (max-width:639px){:root{--wd-list-h:36.25rem;--wd-specs-h:8.5rem}}
.wd-list-hold{min-height:var(--wd-list-h)}
.wd-specs-hold{min-height:var(--wd-specs-h)}
.wd-card-wait{pointer-events:none}
.wd-card-wait:hover{transform:none;box-shadow:none}
.wd-bar{display:block;border-radius:var(--radius-pill);background:var(--line-strong);opacity:.6}
.wd-bar-name{width:9rem;height:1.1em}
.wd-bar-for{width:min(100%,18rem);height:.9em}
.wd-card-wait .wd-chips{min-height:1.6rem}
`
// While the catalog answers: the shape of a card, with a breathing ring where its picture goes.
const OrbitWait = () => (
  <span className="sy-mini sy-wait" aria-hidden="true"><svg viewBox="0 0 100 100"><circle className="sy-ring" cx="50" cy="50" r="38" /></svg></span>
)
const ListWait = () => (
  <section id="worlds" aria-labelledby="worlds-title" className="wd-list-hold" aria-busy="true">
    <h2 id="worlds-title" className="wd-list-title font-display text-h2 font-brand">Every world</h2>
    <div className="wd-list">
      {[0, 1].map((i) => (
        <div key={i} className="wd-card wd-card-wait" aria-hidden="true">
          <span className="wd-card-top"><span className="wd-card-text"><span className="wd-bar wd-bar-name" /><span className="wd-bar wd-bar-for" /></span><OrbitWait /></span>
          <span className="wd-chips" />
        </div>
      ))}
    </div>
  </section>
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

export default function Agents({ searchParams }: { searchParams: Promise<{ world?: string; piece?: string }> }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS + WORLDS_CSS + WAIT_CSS }} />
      <header className="sx-hero wd-hero" data-hero>
        <div className="sx-hero-in">
          <div className="sx-hero-text">
            <h1>One paste sets up your AI <em>the makers&rsquo; way.</em></h1>
          </div>
          <div className="wd-hero-sky"><Suspense fallback={<Ring sky />}><HeroSky /></Suspense></div>
          <Suspense fallback={<AskWait />}><HeroPrompt /></Suspense>
        </div>
        <a className="sx-cue" href="#worlds">Every world ↓</a>
      </header>

      <div className="mx-auto flex w-full max-w-wide flex-col gap-(--space-section) px-(--gutter) pb-(--space-section)">
        <Suspense fallback={<ListWait />}><WorldList searchParams={searchParams} /></Suspense>
        <section id="how" aria-labelledby="how-title">
          <h2 id="how-title" className="mb-8 font-display text-h2 font-brand text-balance">Copy one sentence. Your AI does the rest.</h2>
          <ol className="wd-steps">
            <li><span className="wd-step-orb" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></svg></span><b>Copy</b><span>Press Copy for your AI below, or on any card above.</span></li>
            <li><span className="wd-step-orb" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="8" y="3.5" width="8" height="4" rx="1.5" /><path d="M8 5.5H6.5A1.5 1.5 0 0 0 5 7v12.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H16M9 12h6M9 16h4" /></svg></span><b>Paste into your AI</b><span>Any AI works. Open it, paste, and press send.</span></li>
            <li><span className="wd-step-orb" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.5 20 8v8l-8 4.5L4 16V8z" /><path d="m4 8 8 4.5L20 8M12 12.5v8" /></svg></span><b>Your AI is set up</b><span>It installs what each tool&apos;s company made for AI.</span></li>
          </ol>
          <Suspense fallback={<SayWait />}><StepSentence /></Suspense>
        </section>
        <section aria-labelledby="open-title" className="wd-open-band">
          <span className="wd-open-orbit" aria-hidden="true"><i /></span>
          <div className="wd-open-copy">
            <h2 id="open-title" className="wd-open-title">Read it, <em>then paste it.</em></h2>
            <p className="wd-open-lede">Each setup is one readable file on GitHub, built on open standards.</p>
            <div className="wd-open-built">
              <span className="wd-open-label">Built on</span>
              <Suspense fallback={<ul className="wd-specs wd-specs-hold" aria-hidden="true" />}><Specs /></Suspense>
            </div>
          </div>
          <div className="wd-open-actions">
            <a className="wd-pill" href={MARKETPLACE_REPO}><GithubIcon className="wd-gh-icon" />Read the setups on GitHub</a>
            <a className="wd-open-link" href={`${MARKETPLACE_REPO}/issues/new?template=2-suggest-a-world.yml`}>Suggest a world</a>
          </div>
        </section>
      </div>
    </>
  )
}

// The hero's one action: the core toolkit's one sentence, read live, and the button that copies it. Until the
// catalog answers, a place of the same shape holds the spot, so nothing below the words moves when it lands.
async function HeroPrompt() {
  const kit = (await getCatalog())?.find((e) => e.part === "toolkit")
  return kit ? <HeroAsk sentence={kit.sentence} repo={MARKETPLACE_REPO} /> : null
}
const AskWait = () => (
  <div className="wd-ask wd-ask-wait" aria-hidden="true">
    <span className="wd-bar wd-ask-bar-act" />
    <span className="wd-bar wd-quiet-bar" />
  </div>
)

// Step one's sentence: the core toolkit's, read live from the catalog, the one the hero copies. Until the catalog
// answers, a place of the same size holds the spot, so nothing below it moves when it lands.
async function StepSentence() {
  const kit = (await getCatalog())?.find((e) => e.part === "toolkit")
  return kit ? <SentenceCopy sentence={kit.sentence} /> : <SayWait />
}
const SayWait = () => (
  <div className="wd-say wd-ask-wait" aria-hidden="true">
    <p className="wd-say-text" />
    <span className="wd-bar wd-say-bar-act" />
  </div>
)

async function HeroSky() {
  const catalog = await getCatalog()
  if (catalog && catalog.length > 0) return <SkyNow catalog={catalog} />
  return (
    <a className="wd-card" href={MARKETPLACE_REPO}>
      <span className="wd-for">{catalog ? "The first world is on its way." : "We couldn't load the worlds just now."}</span>
      <span className="wd-name">See them on GitHub</span>
    </a>
  )
}

// The worlds, as a list of cards; a world opens in place (the dialog). When the catalog can't be read the
// hero says so and this place stays, empty, so the page below holds still.
async function WorldList({ searchParams }: { searchParams: Promise<{ world?: string; piece?: string }> }) {
  const [catalog, version, { world, piece }] = await Promise.all([getCatalog(), catalogVersion(), searchParams])
  if (!catalog || catalog.length === 0) return <section id="worlds" aria-label="Every world" className="wd-list wd-list-hold" aria-hidden="true" />
  const card = (entry: Entry): Card => ({
    entry,
    inside: <Suspense fallback={<Ring />}><Inside entry={entry} piece={entry.id === world ? piece ?? null : null} /></Suspense>,
  })
  return (
    <>
      <Worlds cards={catalog.map(card)} initial={world ?? null} version={version} />
      <section id="worlds" aria-labelledby="worlds-title" className="wd-list-hold">
        <h2 id="worlds-title" className="wd-list-title font-display text-h2 font-brand">Every world</h2>
        <div className="wd-list">
          {catalog.map((e) => (
            <div key={e.id} className="wd-cell">
              <a href={`?world=${e.id}`} data-world={e.id} className="wd-card">
                <div className="wd-card-top">
                  <div className="wd-card-text">
                    <h3 className="wd-name">{e.name}</h3>
                    <span className="wd-for">{e.for}</span>
                  </div>
                  <Suspense fallback={<OrbitWait />}><Glance entry={e} /></Suspense>
                </div>
                <span className="wd-chips"><Suspense fallback={<span className="wd-reading">reading live…</span>}><Chips entry={e} /></Suspense></span>
              </a>
              <CopyCard id={e.id} name={e.name} sentence={e.sentence} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

// The open standards every world is built on, as the catalog names them. An empty place when there is none yet.
async function Specs() {
  const specs = Object.entries((await getCatalog())?.[0]?.specs ?? {})
  if (specs.length === 0) return <ul className="wd-specs wd-specs-hold" aria-hidden="true" />
  return (
    <ul className="wd-specs wd-specs-hold">
      {specs.map(([k, href]) => <li key={k}><a href={href}><KindIcon kind={k === "mcp" ? "connector" : k === "plugin" ? "plugin" : "skills"} />{SPEC_NAMES[k] ?? k}</a></li>)}
    </ul>
  )
}
