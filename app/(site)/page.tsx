import type { Metadata } from "next";
import { GITHUB_ICON, SiteFooter, SiteHeader, Sky } from "./chrome";

const description =
  "AI consulting and websites for small businesses, and open-source tools that make AI agents easy to set up.";

export const metadata: Metadata = {
  title: "SolenixAI",
  description,
  openGraph: { title: "SolenixAI", description, url: "https://solenix.dev" },
};

export default function Home() {
  return (
    <>
      <Sky />
      <SiteHeader />

      <main>
        <div className="wrap">
          <section className="hero">
            <p className="eyebrow reveal d1">AI · Websites · Open source</p>
            <h1 className="reveal d2">AI and websites that work for your <em>small business.</em></h1>
            <p className="lede reveal d3">We find the hours AI can save you and set it up so it keeps working. We build, launch and look after your website. And we make open-source tools that make AI agents easy to set up.</p>
            <div className="actions reveal d4">
              <a className="btn btn-primary" href="mailto:hello@solenix.dev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                hello@solenix.dev
              </a>
              <a className="btn btn-ghost" href="https://github.com/SolenixAI">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={GITHUB_ICON} /></svg>
                GitHub
              </a>
            </div>
            <p className="founder reveal d5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="assets/jager.jpg" alt="" width="28" height="28" loading="lazy" />
              <span>Founded by <a href="https://github.com/JagerCooper">Jager Cooper</a>, software engineer, St. John&apos;s, NL</span>
            </p>
          </section>

          <section className="cards" aria-label="What we do">
            <article className="card" id="consulting">
              <div className="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" /></svg></div>
              <p className="tag">Consulting</p>
              <h2>AI for small businesses</h2>
              <p>A short look at how you work, the tasks AI can take off your plate, and a setup your team actually keeps using.</p>
              <a href="mailto:hello@solenix.dev?subject=AI%20consulting">Start a conversation →</a>
            </article>
            <article className="card" id="websites">
              <div className="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 6.5h.01M10 6.5h.01" /></svg></div>
              <p className="tag">Websites</p>
              <h2>Websites, done for you</h2>
              <p>We design and build your site, put it live on your own domain, and keep it fast, secure and up to date, so you never have to think about it.</p>
              <a href="mailto:hello@solenix.dev?subject=Website">Get a website →</a>
            </article>
            <article className="card" id="open-source">
              <div className="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M13.5 5l-3 14" /></svg></div>
              <p className="tag">Open source</p>
              <h2>Agents Marketplace</h2>
              <p>Hand-picked tools for AI agents that install into Claude Code, Codex, Cursor or any MCP client with one line. One line removes them.</p>
              <a href="/agents">Browse the marketplace →</a>
            </article>
          </section>

          <section aria-labelledby="how">
            <h2 className="section-title" id="how">How we work</h2>
            <ol className="steps">
              <li><h3>Talk</h3><p>Tell us how your business runs, where the time goes, and what you need online.</p></li>
              <li><h3>Plan &amp; build</h3><p>We pinpoint the tasks AI can take over and design your site, with a clear plan before any work starts.</p></li>
              <li><h3>Launch &amp; look after</h3><p>We set it up in the tools you already use, put your site live, and keep both running.</p></li>
            </ol>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
