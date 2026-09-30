import type { Metadata } from "next"
import { ArrowRight, Check, ListChecks, Star, X } from "lucide-react"
import { AssistantDemo } from "@/components/site/assistant-demo"
import { OrbitStory } from "@/components/site/orbit/orbit-story"
import { ClosingSky, StatementSky, lightStyle } from "@/components/site/sky"
import { CountUp } from "@/components/brand/motion"
import { Spark, SparkAxis, Trend } from "@/components/data/spark"
import { Timeline } from "@/components/data/timeline"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: { absolute: "Solenix · the tech person your business does not have" },
  openGraph: {
    title: "Solenix · the tech person your business does not have",
    description: "Too many tools. Too many logins. Nobody who knows. One person who knows the way, sets it up, teaches your team, and stays.",
    url: "https://solenix.dev",
  },
}

// ── Small, repeated shapes ────────────────────────────────────────────────────

const Wrap = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("content relative mx-auto w-full max-w-wide px-(--gutter)", className)}>{children}</div>
)

function SectionHead({ eyebrow, title, body, titleWidth = "34ch" }: { eyebrow: string; title: string; body?: React.ReactNode; titleWidth?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-h2 leading-heading font-brand tracking-heading" style={{ maxWidth: titleWidth }}>{title}</h2>
      {body && <p className="max-w-measure text-sm text-muted-foreground">{body}</p>}
    </div>
  )
}

const H3 = ({ children, as: As = "h3" }: { children: React.ReactNode; as?: "h3" | "p" }) => (
  <As className="font-display text-h3 leading-heading font-brand tracking-heading">{children}</As>
)

const Tile = ({ i, className, children }: { i: number; className?: string; children: React.ReactNode }) => (
  <div
    className={cn("reveal flex flex-col gap-3 rounded-xl border border-line bg-surface p-6 shadow-md", className)}
    style={{ "--i": i } as React.CSSProperties}
  >
    {children}
  </div>
)

const Section = ({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) => (
  <section id={id} className={cn("scroll-mt-nav py-(--space-section)", className)}>{children}</section>
)

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      {/* 1 · Hero and story: a live three-body system resolving into the figure-eight */}
      <OrbitStory />

      {/* 3 · What we do — bento */}
      <Section id="what">
        <Wrap>
          <SectionHead
            eyebrow="What we do"
            title="Mostly, we switch on what you already pay for"
            titleWidth="30ch"
            body="Your tools already connect to each other, and most can now be handed to AI. Nobody told you. We do the connecting."
          />
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 xl:auto-rows-[minmax(var(--bento-min),auto)] xl:grid-cols-4">
            <Tile i={0} className="justify-between xl:col-span-2 xl:row-span-2">
              <div className="flex flex-col gap-4">
                <span className="grid size-10 place-items-center rounded-md bg-ember-quiet text-ember-text" aria-hidden="true">
                  <ListChecks className="size-5" />
                </span>
                <H3>First: the list</H3>
                <p className="text-sm text-muted-foreground">
                  Every tool, login and subscription you pay for: what it does, what it costs, what it already connects
                  to. Cancelling the overlap often pays for the work. The list is yours either way.
                </p>
              </div>
              <p className="text-xs text-faint">Then we switch on what is already there, set up what is missing, and retire what is not earning its keep.</p>
            </Tile>
            <Tile i={1}>
              <p className="label">More time</p>
              <H3>AI wired into your own tools</H3>
              <p className="text-sm text-muted-foreground">Claude or ChatGPT, connected to your store, files and inbox — and a team that actually uses it.</p>
            </Tile>
            <Tile i={2}>
              <p className="label">Look professional</p>
              <H3>Email on your own domain</H3>
              <p className="text-sm text-muted-foreground">Google Workspace done properly, and a Business Profile people can find.</p>
            </Tile>
            <Tile i={3}>
              <p className="label">More money</p>
              <H3>Website and store, looked after</H3>
              <p className="text-sm text-muted-foreground">Products, prices, hours and pages kept current. Never your evening again.</p>
            </Tile>
            <Tile i={4} className="xl:col-span-2">
              <p className="label">Last resort</p>
              <H3>Build something new only when nothing fits</H3>
              <p className="text-sm text-muted-foreground">When nothing off the shelf fits, we build it — at a fixed price — and run it with everything else.</p>
            </Tile>
          </div>
        </Wrap>
      </Section>

      {/* 5 · Big statement */}
      <section className="lit py-24 text-center" style={lightStyle({ x: "50%", y: "120%", size: "26rem", strength: 0.32, orbit: "52rem" })}>
        <StatementSky />
        <div className="content relative mx-auto w-full max-w-site px-(--gutter)">
          <p className="mx-auto max-w-[26ch] font-display text-statement leading-display font-bold tracking-statement text-balance">
            You do not need an expert in everything. <em className="lit-text">You need one who knows the way.</em>
          </p>
          <p className="mx-auto mt-8 max-w-[40ch] text-sm text-muted-foreground">
            AI can do most of the everyday work now. What you need is one person who knows the shorter path.
          </p>
        </div>
      </section>

      {/* 6 · Your portal — split with visual */}
      <Section id="portal">
        <Wrap>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="flex max-w-measure flex-col gap-4">
              <p className="eyebrow">Your portal</p>
              <h2 className="font-display text-h2 leading-heading font-brand tracking-heading">Twelve logins become one</h2>
              <p className="text-sm text-muted-foreground">Everything we run for you, behind one sign-in, in plain words.</p>
              <ul className="flex flex-col gap-4">
                <li className="text-sm text-muted-foreground"><strong className="text-foreground">Your tech</strong> — every account, what it costs, who can get in.</li>
                <li className="text-sm text-muted-foreground"><strong className="text-foreground">Projects</strong> — where the work is, what is next, what needs you.</li>
                <li className="text-sm text-muted-foreground"><strong className="text-foreground">Billing</strong> — every invoice, paid in one click.</li>
              </ul>
              <div>
                <Button asChild variant="secondary" size="sm"><a href="/app">Client sign in</a></Button>
              </div>
            </div>
            <PortalPreview />
          </div>
        </Wrap>
      </Section>

      {/* 7 · One honest example — demo panel */}
      <Section id="demo">
        <Wrap>
          <SectionHead
            eyebrow="One honest example"
            title="Nothing new was built here. It just got connected."
            titleWidth="32ch"
            body="Claude, Shopify and Google — already paid for, never talking to each other. Until they were."
          />
          <AssistantDemo />
        </Wrap>
      </Section>

      {/* 8 · What we put in writing — bento */}
      <Section id="promises">
        <Wrap>
          <SectionHead eyebrow="What we put in writing" title="The four things that usually go wrong, closed off up front" />
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 xl:auto-rows-[minmax(var(--bento-min),auto)] xl:grid-cols-4">
            <Tile i={0} className="justify-between xl:col-span-2 xl:row-span-2">
              <div className="flex flex-col gap-4">
                <p className="eyebrow">How it works</p>
                <H3 as="p">One person who knows the way, not an agency and not a hire</H3>
                <p className="text-sm text-muted-foreground">
                  One expert on the hook for all of it — for a fraction of a hire, with no agency in between. Small and
                  new, and honest about it.
                </p>
              </div>
              <p className="text-xs text-faint">Based in St. John&apos;s, Newfoundland. Working with businesses anywhere.</p>
            </Tile>
            {[
              ["Fixed price up front", "Agreed in writing before work starts. A wrong estimate is ours to absorb, not yours to cover."],
              ["You own everything", "Code, accounts, domain and data, in your name from day one — not ours."],
              ["Plain-English updates", "Every change described in words you already use. No jargon, no status theatre."],
              ["No lock-in", "Leave whenever you like and take all of it. We help you move it out."],
            ].map(([t, b], i) => (
              <Tile key={t} i={i + 1}>
                <p className="label">Promise {i + 1}</p>
                <H3>{t}</H3>
                <p className="text-sm text-muted-foreground">{b}</p>
              </Tile>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* 9 · How pricing works — card grid */}
      <Section id="pricing">
        <Wrap>
          <SectionHead
            eyebrow="How pricing works"
            title="Two numbers, both agreed before anything starts"
            titleWidth="32ch"
            body={'No hourly billing, no "as needed", no surprise invoice. A fixed price for the work, and a flat monthly amount to keep it all running. Both written down before you commit.'}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <PriceCard
              kind="One-off"
              title="The project price"
              note="Quoted as one number for the whole job after the first call. If the estimate was wrong, that is ours to absorb."
              items={[
                "The written list of what you have, what it costs and what to cut",
                "Setting up and connecting every account in the plan",
                "Training sessions with you and your staff, recorded so new hires can watch them",
                "Anything built from scratch, when nothing existing fits",
              ]}
            />
            <PriceCard
              kind="Monthly, flat"
              title="The care plan"
              per
              note="The same amount every month regardless of how much we do. Cancel any month and keep everything."
              items={[
                "Hosting, domains, certificates and backups",
                "Monitoring, and fixing what breaks — usually before you notice",
                "Content and price updates on your site, store and listing",
                "Your portal, and a person who answers",
              ]}
              excluded="Not included: what each vendor bills you directly — you see those amounts in your portal"
            />
          </div>
          <p className="mt-6 text-xs text-faint">
            Both figures are still to be set — we do not print a number we have not committed to. The list of what is
            included does not change once it is in writing.
          </p>
        </Wrap>
      </Section>

      {/* 10 · Reviews — empty until real */}
      <Section id="reviews">
        <Wrap>
          <div className="grid gap-4 rounded-xl border border-dashed border-line-strong bg-sunken p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="label">Reviews</p>
              <span className="inline-flex gap-[3px] text-muted-foreground" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-[15px]" strokeWidth={1.8} />)}
              </span>
            </div>
            <H3 as="p">No reviews yet, and we will not invent any</H3>
            <p className="max-w-measure text-sm text-muted-foreground">
              This is where our Google Business Profile reviews will appear, pulled from Google rather than retyped by us.
              Until a real client has left one, it stays empty on purpose — an empty slot is worth more than a testimonial
              you cannot check.
            </p>
            <p className="text-xs text-muted-foreground">We ask every client for an honest review at the end, good or bad.</p>
          </div>
        </Wrap>
      </Section>

      {/* 11 · FAQ */}
      <Section id="faq">
        <Wrap>
          <SectionHead eyebrow="Questions" title="What owners ask first" />
          <Accordion type="multiple" className="grid max-w-[46rem] gap-3">
            {FAQ.map(([q, a]) => (
              <AccordionItem
                key={q}
                value={q}
                className="rounded-lg border border-line bg-surface last:border-b data-[state=open]:border-line-strong"
              >
                <AccordionTrigger className="min-h-tap px-5 py-4 text-base font-semibold hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="max-w-measure px-5 pb-5 text-base text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Wrap>
      </Section>

      {/* 12 · Closing CTA */}
      <section
        className="lit py-(--space-section) text-center"
        style={lightStyle({ x: "20%", y: "110%", size: "32rem", strength: 0.4, orbit: "56rem" })}
      >
        <ClosingSky />
        <div className="content relative mx-auto w-full max-w-site px-(--gutter)">
          <h2 className="mx-auto max-w-[26ch] font-display text-display leading-display font-bold tracking-display">
            Send us the list of what you are paying for.
          </h2>
          <p className="mx-auto mt-6 max-w-measure text-lede text-muted-foreground">
            One call, no charge, no pitch. You keep the list either way.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild>
              <a href="mailto:hello@solenix.dev?subject=Book%20a%20call">
                Book a call
                <ArrowRight />
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-faint">
            Or email <a href="mailto:hello@solenix.dev" className="text-ember-text">hello@solenix.dev</a>
          </p>
        </div>
      </section>
    </>
  )
}

// ── Sections with their own drawing ───────────────────────────────────────────

/** A static picture of the portal with example figures, labelled as such. */
function PortalPreview() {
  // Example series for a made-up bakery; the panel carries an Example badge.
  const series = [38, 43, 40, 49, 46, 54, 51, 59, 56, 65, 62, 72]
  return (
    <div className="glass p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="label">Maple &amp; Rye · your portal</p>
        <Badge variant="example">Example</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label">Your website</p>
          <p className="mt-1 text-sm text-muted-foreground">maple-and-rye.ca</p>
        </div>
        <Badge variant="ok" live>Live</Badge>
      </div>
      <div className="mt-4 grid gap-0.5">
        <span className="font-display text-stat leading-[1.05] font-bold tracking-stat whitespace-nowrap tabular-nums">
          <CountUp value={1248} />
          <span className="ml-1 text-[0.5em] font-semibold text-muted-foreground">visits</span>
        </span>
        <span className="text-xs text-faint">Last 30 days</span>
        <span><Trend delta={12} sentiment="good" /></span>
      </div>
      <Spark
        className="mt-2"
        series={series}
        label="Visits over the last 30 days, example data: rising from about 38 a day to about 78 a day."
      />
      <SparkAxis />

      <p className="label mt-8">Your project</p>
      <Timeline
        className="mt-3"
        steps={[
          { name: "Call", state: "done", meta: "Done · 2 Sep" },
          { name: "Plan", state: "done", meta: "Done · 11 Sep" },
          { name: "Build", state: "now", meta: "You'll see it Thursday" },
          { name: "Care", state: "next", meta: "Not started" },
        ]}
      />

      <p className="label mt-8">Your invoices</p>
      <div className="mt-2">
        {[
          ["Website build · final", "ok", "Paid", "$1,850.00"],
          ["Ordering assistant", "warn", "Due 8 Oct", "$920.00"],
        ].map(([t, v, s, amt]) => (
          <div key={t} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line py-3">
            <span className="text-sm text-muted-foreground">{t}</span>
            <span className="flex items-center gap-3">
              <Badge variant={v as "ok" | "warn"}>{s}</Badge>
              <span className="font-mono text-sm tabular-nums">{amt}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-faint">Example figures for a made-up bakery. Your portal shows your own.</p>
    </div>
  )
}

function PriceCard({ kind, title, note, items, excluded, per }: { kind: string; title: string; note: string; items: string[]; excluded?: string; per?: boolean }) {
  return (
    <Card size="lg" className="gap-4">
      <div className="flex flex-col gap-2">
        <p className="label">{kind}</p>
        <H3>{title}</H3>
        <p className="font-display text-stat leading-[1.05] font-bold tracking-stat">
          <span className="rounded-xs border border-dashed border-ember/45 bg-ember-quiet px-2 font-mono text-[0.92em] font-semibold whitespace-nowrap text-ember-text">
            amount to confirm
          </span>
          {per && <span className="text-[0.4em] font-semibold whitespace-nowrap text-muted-foreground"> /month</span>}
        </p>
        <p className="text-sm text-muted-foreground">{note}</p>
      </div>
      <ul className="mt-auto grid gap-3">
        {items.map((it) => (
          <li key={it} className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 text-sm">
            <Check className="mt-[3px] size-4 text-ember-text" strokeWidth={2.4} aria-hidden="true" />
            <span>{it}</span>
          </li>
        ))}
        {excluded && (
          <li className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 text-sm text-muted-foreground">
            <X className="mt-[3px] size-4" strokeWidth={2.4} aria-hidden="true" />
            <span>{excluded}</span>
          </li>
        )}
      </ul>
    </Card>
  )
}

const FAQ: [string, React.ReactNode][] = [
  ["I already pay for a lot of tools. Will this cost more?", "Often it costs less. The first thing we do is list what you are paying for and what each thing actually does; cancelling the overlap usually covers a meaningful part of our fee. We will tell you honestly if it does not in your case."],
  ["Do I have to throw out what I already have?", "No. Anything that works and earns its place stays. We are looking for the tools nothing depends on, the ones you pay for twice, and the ones nobody can log into — not a reason to rebuild everything."],
  ["Will AI replace my staff?", "Not in the way people mean when they ask. What it takes over is the hour someone spends retyping an order, hunting for a price, tidying a spreadsheet or writing the same email for the tenth time. Your staff still decide things, still talk to customers, still do the work that needs a person who knows your business. Every draft it produces is checked by someone before it goes anywhere. If your goal is to cut your team, we are honestly not the right fit — we are good at making the people you already have go further."],
  ["Is it safe to connect AI to my accounts?", "It is, if it is set up properly — which is most of the reason to have someone do it rather than clicking \"allow\" yourself. Every account stays in your name. We give the assistant the narrowest access that does the job: read your orders, yes; move money or send on your behalf, no. The business plans we set up on Claude and ChatGPT do not use your data to train their models, and we show you the terms and the setting that say so rather than asking you to take our word. Your portal lists who and what has access to every account, and we show you where to switch any of it off."],
  ["What does it cost?", <>Two numbers, both agreed before anything starts: a fixed price for the work and a flat monthly amount to keep it running. What each one includes is listed under <a href="#pricing" className="text-ember-text">how pricing works</a>. No hourly billing and no &quot;as needed&quot;.</>],
  ["How long does it take?", "Setting up accounts that already exist is usually days, not weeks — that is most of the work and why we start there. Anything genuinely built from scratch takes longer, and the plan gives you an actual date rather than a range."],
  ["I'm not technical. Is that a problem?", "No. You are the one who knows how the business runs, which is the part we cannot work out on our own. Everything gets explained in plain words, and we will not ask you to decide something you do not have the information for."],
  ["I already have a website. Do I have to start over?", "Usually not. If your site, store or email already works, we keep it and take over looking after it. Replacing something is a decision we argue for in writing, not a default."],
  ["Who owns the code and the accounts?", "You do. Everything is set up in your name from the start — domain, hosting, accounts, code. If we stop working together, nothing needs to be handed over, because it was never ours."],
  ["What happens if it breaks?", "We monitor it, so usually we know first and it is fixed before you ask. When something is down you get told it is down, what we are doing and when we will know more — not a status page dressing it up."],
]
