import type { Metadata } from "next";
import { GITHUB_ICON, SiteFooter, SiteHeader, Sky } from "../chrome";
import { Cmd, CopyButtons, Tools } from "./tools";

export const metadata: Metadata = {
  title: "Agents Marketplace · SolenixAI",
  description:
    "Agent tools we use and trust, each the vendor's own plugin. Add the SolenixAI marketplace once, then install any of them.",
  openGraph: {
    title: "Agents Marketplace · SolenixAI",
    description: "Agent tools we use and trust. Add one marketplace, install any of them.",
    url: "https://solenix.dev/agents",
  },
};

const MARKETPLACE_FILE = "https://github.com/SolenixAI/agents-marketplace/blob/main/.agents/plugins/marketplace.json";

export default function Agents() {
  return (
    <>
      <Sky />
      <SiteHeader current="agents" />

      <main>
        <div className="wrap">
          <section className="hero hero-sm">
            <p className="eyebrow reveal d1">Open source · Agents Marketplace</p>
            <h1 className="reveal d2">Agent tools that install in <em>one line.</em></h1>
            <p className="lede reveal d3">Agent tools we use and trust, from all over. Add our marketplace once, then install any of them with your agent&apos;s own plugin system. Each tool is its vendor&apos;s own plugin, maintained by the vendor.</p>
            <div className="actions reveal d4">
              <a className="btn btn-primary" href="https://github.com/SolenixAI/agents-marketplace">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={GITHUB_ICON} /></svg>
                View on GitHub
              </a>
              <a className="btn btn-ghost" href="https://github.com/SolenixAI/agents-marketplace/issues/new?template=2-suggest-a-tool.yml">Suggest a tool</a>
            </div>
          </section>

          <section className="section" aria-labelledby="toolkit">
            <h2 className="section-title" id="toolkit">Our toolkit, set up by any agent</h2>
            <p className="section-lede">Give this sentence to any agent, in any app, with no other context. It sets up the tools our agents use, walks you through the sign-ins, and proves each one works.</p>
            <article className="card">
              <Cmd text="Read https://github.com/SolenixAI/agents-marketplace/blob/main/SETUP.md and install and set up everything in it." />
              <p className="muted-note"><a href="https://github.com/SolenixAI/agents-marketplace/blob/main/SETUP.md">Read SETUP.md →</a></p>
            </article>
          </section>

          <section className="section" aria-labelledby="add">
            <h2 className="section-title" id="add">Add the marketplace</h2>
            <p className="section-lede">Add it once, then install any tool below from inside your agent.</p>
            <div className="grid3">
              <article className="card">
                <h3><a href="https://code.claude.com/docs/en/plugin-marketplaces">Claude Code</a></h3>
                <p className="cmd-label">Add</p>
                <Cmd text="/plugin marketplace add SolenixAI/agents-marketplace" />
                <p className="cmd-label">Remove</p>
                <Cmd text="/plugin marketplace remove solenix" />
              </article>
              <article className="card">
                <h3><a href="https://developers.openai.com/plugins/build/plugins">Codex / ChatGPT</a></h3>
                <p className="cmd-label">Add</p>
                <Cmd text="codex plugin marketplace add SolenixAI/agents-marketplace" />
                <p className="cmd-label">Remove</p>
                <Cmd text="codex plugin marketplace remove solenix" />
              </article>
              <article className="card">
                <h3>Other agents</h3>
                <p>The marketplace is one open <a href="https://agent-plugins.org/specification">Agent Plugins</a> file. Agents that read that format can add <strong>SolenixAI/agents-marketplace</strong> the same way.</p>
                <p className="muted-note"><a href={MARKETPLACE_FILE}>The marketplace file →</a></p>
              </article>
            </div>
          </section>

          <section className="section" aria-labelledby="tools-title">
            <h2 className="section-title" id="tools-title">Tools</h2>
            <p className="section-lede">Each tool is its vendor&apos;s own plugin. This list is read live from the <a href={MARKETPLACE_FILE}>marketplace file</a>.</p>
            <Tools />
            <noscript>
              <p className="muted-note">This list needs JavaScript. You can also read it on <a href={MARKETPLACE_FILE}>GitHub</a>.</p>
            </noscript>
          </section>
        </div>
      </main>

      <SiteFooter />
      <CopyButtons />
    </>
  );
}
