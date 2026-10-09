# Product

<!-- impeccable:product-schema 1 -->

The one record of what Solenix is, for every person and agent who designs, builds or markets it.
Impeccable reads it as PRODUCT.md; Corey Haines' marketing skills read it through
`.agents/product-marketing.md`, a link to this file. Visual decisions live in DESIGN.md; user journeys
in design/journeys.md. Confirmed with Jager on 2026-10-08; anything not yet decided says so.

## Platform

web

## Users

Each surface serves its own person, with its own purpose; each page gets its own brief.

| Surface | Person | Their job |
|---|---|---|
| Homepage `/` | A small-business owner in Newfoundland and Labrador | Understand in seconds what Solenix would change in their week, and book a call |
| Articles `/articles` and each article | A curious reader from a social post, often on a phone, who knows nothing about the topic | Get what happened and play with it, then remember who made it |
| Agents Marketplace `/agents` | A developer, or an AI agent | Add the marketplace and install a tool in one line |
| Solenix platform `/app` | A client, and Jager as operator | See that everything runs, answer what waits, pay, and run clients |

## Product Purpose

Solenix is one tech expert for small businesses, based in St. John's, Newfoundland and Labrador. It puts one AI at the centre of the tools a business already uses, cuts the tools it does not need, teaches the team, and builds the website. Success: the owner gets hours back every week, and the business runs without them chasing tools.

Marketing and selling are the point of every surface: work that nobody knows exists has no value. Each page is made to be found, shared and acted on.

## Positioning

The gap Solenix closes, in everything it builds: on one side, all the best technology that already exists for a problem; on the other, the people who need it. Solenix closes the gap by design: minimum effort for them, maximum value. It builds only the experience and stands on proven open-source tools and services for everything underneath. (Jager, 2026-10-09)

"Your business is a three-body problem." Revenue, costs and time pull apart across a dozen tools; Solenix finds the stable orbit with one AI at the centre. The proof is the work itself: live, interactive pages built with AI, shown rather than described.

## Operating Context

- A call first: "From one call to a stable orbit." Book a call opens a real booking page.
- Price: "A fixed price, in writing. Agreed on the call. No surprise invoice." No public prices; value-based per initiative.
- Clients use the Solenix platform (`/app`): status, approvals, projects, tech, billing through Stripe.
- Open source: the Agents Marketplace lists tools that install with one line, for any AI.

## Capabilities and Constraints

- The site is dark; the platform follows the device.
- Every page fits any screen, loads nothing from another host, and derives its values live from one source (scripts/check.sh enforces it).
- The repo is public: everything in it is written to be published.
- Undecided: a public "from" price; client results to show.

## Brand Commitments

- Name: Solenix. Mark: a sun, one orbit ring, one agent dot (lib/site-nav.mjs).
- Phrases that stay word for word on the homepage: design/approved.md.
- Voice: plain words, short sentences, claims that land on time or money; banned words in DESIGN.md (Voice).
- "Agents Marketplace", never "Tools we use". "Solenix platform" for the client sign-in.

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

## Accessibility & Inclusion

Readable by someone who knows nothing about the topic; works on any device and in any app's browser; reduced motion respected; keyboard and screen reader reachable.
