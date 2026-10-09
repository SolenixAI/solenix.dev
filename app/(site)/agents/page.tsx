import type { Metadata } from "next"
import { GithubIcon } from "@/components/brand/github-icon"
import { HeroSky, lightStyle } from "@/components/site/sky"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ago, count } from "@/lib/format"
import { getTools, MARKETPLACE_FILE, MARKETPLACE_REPO as REPO, type Tool } from "@/lib/marketplace"
import { OG_IMAGE } from "@/lib/site-meta"
import { Cmd } from "./tools"

export const metadata: Metadata = {
  title: "Agents Marketplace",
  description:
    "Agents and tools that work with any AI, each the vendor's own plugin. Add the Solenix marketplace once, then install any of them.",
  openGraph: {
    title: "Agents Marketplace · Solenix",
    description: "Agents and tools that work with any AI. Add one marketplace, install any of them.",
    url: "https://solenix.dev/agents",
    images: [OG_IMAGE],
  },
}

/** Stars, last update and licence, read live from the tool's GitHub repo. */
function Signals({ tool }: { tool: Tool }) {
  const s = tool.stats
  if (!s || !tool.repo) return null
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <a className="text-foreground" href={`https://github.com/${tool.repo}/stargazers`} title={`Stars on ${tool.repo}`}>
        ★ {count(s.stars)}
      </a>
      {s.pushedAt > 0 && <span>Updated {ago(s.pushedAt)}</span>}
      {s.license && <span>{s.license}</span>}
      {s.archived && <span>Archived</span>}
    </p>
  )
}

function Tools({ tools }: { tools: Tool[] | null }) {
  if (!tools || tools.length === 0) {
    return (
      <Card className="items-start border-dashed bg-sunken shadow-none">
        <CardTitle>{tools ? "No tools listed yet" : "We could not load the list"}</CardTitle>
        <a className="text-sm text-ember-text" href={MARKETPLACE_FILE}>See it on GitHub →</a>
      </Card>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((t, i) => (
        <Card key={t.name + i}>
          <Badge variant="plain">{t.category}</Badge>
          <CardTitle>{t.name}</CardTitle>
          <Signals tool={t} />
          <p className="text-sm text-muted-foreground">{t.description}</p>
          <p className="label">Claude Code</p>
          <Cmd text={`/plugin install ${t.name}@solenix`} />
          <p className="label">Codex / ChatGPT</p>
          <Cmd text={`codex plugin add ${t.name}@solenix`} />
          <a className="mt-auto text-sm text-ember-text" href={t.source}>Source →</a>
        </Card>
      ))}
    </div>
  )
}

function Head({ id, title, lede }: { id: string; title: string; lede: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h2 id={id} className="font-display text-h2 font-brand">{title}</h2>
      <p className="max-w-measure text-sm text-muted-foreground">{lede}</p>
    </div>
  )
}

export const revalidate = 3600

export default async function Agents() {
  const tools = await getTools()
  return (
    <>
      <section className="lit pt-(--space-hero) pb-(--space-section)" style={lightStyle({ x: "84%", y: "-10%", size: "26rem", strength: 0.45, orbit: "56rem" })}>
        <HeroSky />
        <div className="texture" aria-hidden="true" />
        <div className="content relative mx-auto w-full max-w-wide px-(--gutter)">
          <p className="eyebrow">Open source · Agents Marketplace</p>
          <h1 className="mt-4 mb-5 max-w-[22ch] font-display text-display leading-display font-bold tracking-display">
            Agent tools that install in <em className="lit-text">one line.</em>
          </h1>
          <p className="max-w-measure text-lede text-muted-foreground">
            Agents and tools that work with any AI, from all over. Add our marketplace once, then install any of them with your
            agent&apos;s own plugin system. Each tool is its vendor&apos;s own plugin, maintained by the vendor.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href={REPO}><GithubIcon />View on GitHub</a>
            </Button>
            <Button asChild variant="ghost">
              <a href={`${REPO}/issues/new?template=2-suggest-a-tool.yml`}>Suggest a tool</a>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-wide flex-col gap-(--space-section) px-(--gutter) pb-(--space-section)">
        <section aria-labelledby="toolkit">
          <Head
            id="toolkit"
            title="Our toolkit, set up by any agent"
            lede="Give this sentence to any agent, in any app, with no other context. It sets up the tools our agents use, walks you through the sign-ins, and proves each one works."
          />
          <Card>
            <Cmd text={`Read ${REPO}/blob/main/SETUP.md and install and set up everything in it.`} />
            <a className="text-sm text-ember-text" href={`${REPO}/blob/main/SETUP.md`}>Read SETUP.md →</a>
          </Card>
        </section>

        <section aria-labelledby="add">
          <Head id="add" title="Add the marketplace" lede="Add it once, then install any tool below from inside your agent." />
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardTitle><a className="text-ember-text" href="https://code.claude.com/docs/en/plugin-marketplaces">Claude Code</a></CardTitle>
              <p className="label">Add</p>
              <Cmd text="/plugin marketplace add SolenixAI/agents-marketplace" />
              <p className="label">Remove</p>
              <Cmd text="/plugin marketplace remove solenix" />
            </Card>
            <Card>
              <CardTitle><a className="text-ember-text" href="https://developers.openai.com/plugins/build/plugins">Codex / ChatGPT</a></CardTitle>
              <p className="label">Add</p>
              <Cmd text="codex plugin marketplace add SolenixAI/agents-marketplace" />
              <p className="label">Remove</p>
              <Cmd text="codex plugin marketplace remove solenix" />
            </Card>
            <Card>
              <CardTitle>Other agents</CardTitle>
              <p className="text-sm text-muted-foreground">
                The marketplace is one open <a className="text-ember-text" href="https://agent-plugins.org/specification">Agent Plugins</a> file.
                Agents that read that format can add <strong className="text-foreground">SolenixAI/agents-marketplace</strong> the same way.
              </p>
              <a className="text-sm text-ember-text" href={MARKETPLACE_FILE}>The marketplace file →</a>
            </Card>
          </div>
        </section>

        <section aria-labelledby="tools-title">
          <Head
            id="tools-title"
            title="Tools"
            lede={<>Each tool is its vendor&apos;s own plugin. This list and each tool&apos;s GitHub stars are read live from the <a className="text-ember-text" href={MARKETPLACE_FILE}>marketplace file</a>.</>}
          />
          <Tools tools={tools} />
        </section>
      </div>
    </>
  )
}
