# Product

<!-- impeccable:product-schema 1 -->

The one record of what Solenix is, for every person and agent who designs, builds or markets it.
Impeccable reads it as PRODUCT.md; Corey Haines' marketing skills read their own file,
`.agents/product-marketing.md`, and the gate (scripts/sot-check.ts) keeps its one-liner and audience equal to this file. Visual decisions live in DESIGN.md; user journeys
in design/journeys.md. Confirmed with Jager on 2026-10-08; anything not yet decided says so.

## North star

Solenix bridges the gap between all the best technology that exists and the people who need it: minimum effort, maximum value, by design. (Jager, 2026-10-09)

## Platform

web

## Users

Each surface serves its own person, with its own purpose; each page gets its own brief.

| Surface | Person | Their job |
|---|---|---|
| Homepage `/` | A small-business owner in Newfoundland and Labrador | Understand in seconds what Solenix would change in their week, and book a call |
| Articles `/articles` and each article | A curious reader from a social post, often on a phone, who knows nothing about the topic | Get what happened and play with it, then remember who made it |
| Agents Marketplace `/agents` | Anyone who uses AI, developer or not, and AI agents themselves | Set up a tool's whole world in their AI with one copy-paste: everything its makers built for AI |
| Solenix platform `/app` | Anyone who taps the nav's platform button | Learn it is being rebuilt, then book a call |

## Product Purpose

Solenix is one tech expert for small businesses, based in St. John's, Newfoundland and Labrador. It puts one AI at the centre of the tools a business already uses, cuts the tools it does not need, teaches the team, and builds the website. Success: the owner gets hours back every week, and the business runs without them chasing tools.

Marketing and selling are the point of every surface: work that nobody knows exists has no value. Each page is made to be found, shared and acted on.

## Positioning

The gap Solenix closes, in everything it builds: on one side, all the best technology that already exists for a problem; on the other, the people who need it. Solenix closes the gap by design: minimum effort for them, maximum value. It builds only the experience and stands on proven open-source tools and services for everything underneath. (Jager, 2026-10-09)

"Your business is a three-body problem." Revenue, costs and time pull apart across a dozen tools; Solenix finds the stable orbit with one AI at the centre. The proof is the work itself: live, interactive pages built with AI, shown rather than described.

## Operating Context

- A call first: "From one call to a stable orbit." Book a call opens a real booking page.
- Price: "A fixed price, in writing. Agreed on the call. No surprise invoice." No public prices; value-based per initiative.
- The Solenix platform (`/app`) is being rebuilt from scratch. Until it opens, /app says so and offers Book a call.
- Open source: the Agents Marketplace (SolenixAI/agents-marketplace) holds the worlds we stand behind; one sentence in any AI sets one up, the makers' way. solenix.dev/agents renders it live.

## Goals

Each surface, and each section inside it, has its own purpose, value and impact, measured by its own number. Calls come first when goals pull apart. (Jager, 2026-10-09)

| Surface | Purpose | Success measured as | Target |
|---|---|---|---|
| Homepage `/` | Sell AI and websites to small-business owners, from Solenix as their AI and software consultant: everything is possible almost instantly with AI and the right foundation | Booked calls per week (Book a call clicks, then booked calls): the money goal | not set yet |
| Articles | Show what AI makes possible, so people read it and pass it on | Reads and shares per article | not set yet |
| Agents Marketplace `/agents` | Set up any tool's world in any AI with one copy-paste | Copies, installs and downloads per world: the reach goal | not set yet |

## Capabilities and Constraints

- The site is dark; the platform follows the device.
- Every page fits any screen, loads nothing from another host, and derives its values live from one source (scripts/check.sh enforces it).
- The repo is public: everything in it is written to be published.
- Undecided: a public "from" price; client results to show.

## Brand Commitments

- Name: Solenix. Mark: a sun, one orbit ring, one agent dot (lib/site-nav.ts).
- Phrases that stay word for word on the homepage: design/approved.md.
- Voice: plain words, short sentences, claims that land on time or money; banned words in DESIGN.md (Voice).
- "Agents Marketplace", never "Tools we use". "Solenix platform" for the nav button to /app.

## Evidence on Hand

- Our own builds: The Proof Flood (articles/proof-flood), the homepage's 3D three-body world, the by-hand versus just-ask races.
- Open-source numbers: Agents Marketplace tools with live GitHub stars and update dates (lib/marketplace.ts).
- Live data wherever it exists: real numbers read at view time, never typed in.
- Not yet: client results, testimonials, a founder photo ("Photo to come"). Never invent them.

## Product Principles

1. Show the thing, live; text only where nothing else can carry the meaning.
2. Real-time and derived: every number and state is read from its source when it is shown.
3. One source for everything; no copy can drift.
4. Every first screen is a complete, designed hero on any screen.
5. Ready to publish at every step.
6. Visitors see outcomes in their own words, never the machinery. No command, repo path, file name or tool jargon shows on screen. The machinery travels in what they copy, and an expert can open it on request.

## Accessibility & Inclusion

Readable by someone who knows nothing about the topic; works on any device and in any app's browser; reduced motion respected; keyboard and screen reader reachable.
