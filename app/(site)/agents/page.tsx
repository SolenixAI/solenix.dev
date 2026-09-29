import type { Metadata } from "next"
import { GithubIcon } from "@/components/brand/github-icon"
import { HeroSky, lightStyle } from "@/components/site/sky"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Cmd, Tools } from "./tools"

export const metadata: Metadata = {
  title: "Agents Marketplace",
  description:
    "Agent tools we use and trust, each the vendor's own plugin. Add the Solenix marketplace once, then install any of them.",
  openGraph: {
    title: "Agents Marketplace · Solenix",
    description: "Agent tools we use and trust. Add one marketplace, install any of them.",
    url: "https://solenix.dev/agents",
  },
}

const REPO = "https://github.com/SolenixAI/agents-marketplace"
const MARKETPLACE_FILE = `${REPO}/blob/main/.agents/plugins/marketplace.json`

function Head({ id, title, lede }: { id: string; title: string; lede: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h2 id={id} className="font-display text-h2 font-brand">{title}</h2>
      <p className="max-w-measure text-sm text-muted-foreground">{lede}</p>
    </div>
  )
}

export default function Agents() {
  return (
    <>
      <section className="lit pt-(--space-hero) pb-(--space-section)" style={lightStyle({ x: "84%", y: "-10%", size: "26rem", strength: 0.45, orbit: "56rem" })}>
        <HeroSky />
        <div className="texture" aria-hidden="true" />
        <div className="content relative mx-auto w-full max-w-wide px-(--gutter)">
          <p className="eyebrow reveal" style={{ "--i": 0 } as React.CSSProperties}>Open source · Agents Marketplace</p>
          <h1 className="reveal mt-4 mb-5 max-w-[22ch] font-display text-display leading-display font-bold tracking-display" style={{ "--i": 1 } as React.CSSProperties}>
            Agent tools that install in <em className="lit-text">one line.</em>
          </h1>
          <p className="reveal max-w-measure text-lede text-muted-foreground" style={{ "--i": 2 } as React.CSSProperties}>
            Agent tools we use and trust, from all over. Add our marketplace once, then install any of them with your
            agent&apos;s own plugin system. Each tool is its vendor&apos;s own plugin, maintained by the vendor.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3" style={{ "--i": 3 } as React.CSSProperties}>
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
            lede={<>Each tool is its vendor&apos;s own plugin. This list is read live from the <a className="text-ember-text" href={MARKETPLACE_FILE}>marketplace file</a>.</>}
          />
          <Tools />
        </section>
      </div>
    </>
  )
}
