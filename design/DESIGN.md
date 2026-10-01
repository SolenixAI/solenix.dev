---
name: "Solenix"
category: Brands
surface: web
colors:
  night: "#0b0d12"
  glass: "#141820"
  paper: "#f4f2ee"
  stone: "#a39e97"
  hairline: "#1e222b"
  ember: "#f59e0b"
  sun-gold: "#fbbf24"
---

# Solenix

> Category: Brands

> Surface: web

*One tech expert for small businesses in Newfoundland & Labrador. Your business is a three-body problem — we find the stable orbit.*

The system behind solenix.dev. Solenix is one tech expert for small businesses in St. John's, Newfoundland and Labrador: we rebuild the website, host and look after it monthly, and set up AI (for example Claude for a law firm). The visual world is a night sky — deep blue-black grounds, one warm light source, orbit lines, glass panels — and the story is chaos settling into the figure-eight orbit. Dark throughout, on both surfaces: the marketing site (the three.js night-sky hero where three suns settle into a figure-eight is the signature) and the client portal (Overview, Initiatives, Billing). Calm, confident, a little expensive-looking. Plain Canadian English.


## Decisions (Jager's, binding on every page — read before every change)

- **Audience:** small business owners who have barely used AI. Plain words. Every claim lands on time saved, money saved or money made.
- **The offer:** one AI (Claude or ChatGPT) at the centre of the business, connected to the tools they already use, plus teaching; we also cut unused tools, move them off outdated software, bring scattered information together, and build and look after their website. You don't need to be an expert anymore.
- **The journey (a movie, 2–3 minutes, five scenes, one continuous camera voyage through the universe — the owner is the hero, Solenix the guide):** 1) Chaos — Revenue, Costs and Time tumble through deep space, their tools pulling them apart. 2) The guide — one AI ignites at the centre; "you don't need to be an expert anymore". 3) The flybys — the camera passes real tool worlds (Shopify, Meta Ads, QuickBooks, Gmail, Excel, HubSpot) and each SHOWS (never just states) the same real task as a side-by-side race in real time: on one side the by-hand path clicking through that tool's actual screens with a running stopwatch, on the other the owner typing the plain-English ask and the connected AI's answer arriving, the stopwatch stopping. Steps, prompts and times come only from design/before-after.md; data in the replays is labelled as an example. 4) The plan — "From one call to a stable orbit": the five stops travelling around the real figure-eight, one at a time, as in the committed version Jager liked (keep its five-section rhythm), with the four promises in writing. 5) Stable orbit — the bodies lock into the figure-eight; Book a call.
- **The story:** Revenue, Costs and Time are three bodies tumbling erratically through an endless universe; the AI at the centre is what settles them into the stable figure-eight. The 3D world runs through the whole site, top to bottom — every section happens inside it, never on flat panels, cards or diagrams laid over it.
- **Dark site.** The website is dark (the night-sky scene is the experience). The portal follows the visitor's device, light or dark, with a manual choice, because owners read it every week and many read better in light. No Motion switch (the OS reduced-motion setting is the control, and reduced motion still follows the scroll smoothly). No dashboards or readout widgets nobody asked for.
- **Navigation:** nav links go to real pages, never jump-scrolling around one page. No industry pages (no "Law firms" or similar) — Solenix is for small business owners in general; pages are about what we do and how, not who.
- **Tools are shown as their real logos** (official marks, unaltered, "the tools you already use", no implied partnership, small trademark note), not generic words.
- **Pricing:** no prices anywhere public. "Two numbers. Both in writing." Value-based per initiative: what it's worth to the client + three options, highest first; monthly care plan per client.
- **ROI:** no on-page calculator or "Your numbers, not ours" section on the website. Numbers only from design/roi-model.md, shown per initiative in the portal (Before → Now → $ → payback) and worked out with the owner on the call.
- **Book a call** is a real booking page (Google Calendar appointment schedule), never a mailto link.
- **Portal words:** *Initiatives* are Solenix's consulting projects with the client (Linear projects), never "your initiatives". *Billing* is Solenix billing the client — never imply we manage their bills. Tabs: Overview · Initiatives · Billing. Solenix is the first client (dogfood).
- **Agents page (/agents):** linked everywhere as "Agents Marketplace" (never "Tools we use"). for any AI agent, not one vendor. Every tool has one "Copy for any AI" button — a short plain-language prompt with its link and install command that any agent can follow (e.g. `npx skills add <repo>` for skills); client-specific commands sit behind it. Open-source tools show live usefulness signals from GitHub and package registries — stars, last updated, official/first-party, weekly downloads where they exist — never hand-typed numbers. Same dark 3D world as the homepage.
- **Sign-in:** passkey, Google, email link (opens a Continue page). Invite-only. No Apple.

## Color Palette

| Role | Name | Hex | Usage |
| --- | --- | --- | --- |
| background | Night | `#0b0d12` | Page floor (--bg) on every surface. The sky ground runs Night → Night far (#11141b) as a radial away from the light source. Never a light section. |
| surface | Glass | `#141820` | Cards, nav, panels (--surface-solid). As glass it is used at 84% alpha with an 18px blur and a lit top edge (inset 0 1px 0 paper 16%). The 84% is the measured minimum for AA through the panel. |
| foreground | Paper | `#f4f2ee` | Headings and body (--text). 17.4:1 on Night, 15.9:1 on Glass. |
| muted | Stone | `#a39e97` | Secondary prose, nav links at rest, status words (--muted). 7.3:1 on Night. Captions and metadata may drop to Faint #8f8983 (5.6:1) — never anything a reader acts on. |
| border | Hairline | `#1e222b` | Solid hairlines and SVG rules (--line-solid). In CSS use --line (paper 9%) over surfaces and --line-strong (paper 20%) for ghost buttons, inputs and anything that must read as a boundary. |
| accent | Ember | `#f59e0b` | Action ember: the one solid fill per screen (Book a call), with ink #1a1206 at 8.6:1. Light ember is unlimited: eyebrows, links, focus rings, orbit strokes, glows, chart series one. 9.1:1 on Night. |
| accent-secondary | Sun gold | `#fbbf24` | The sun's bright stop (--sun1) and the ember hover/accent-text (--accent-hover, --accent-text). Hover on an accent fill moves lighter, so contrast goes up (11.1:1 with ink). Paired with Sun ember #f97316 for the mark gradient, the headline gradient and the scene's suns. |

## Typography
- **Display:** Sora — weights 500, 600, 650, 700, 800 — fallbacks: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif (Geometric grotesque whose round bowls echo the mark. Headlines, statements, the lockup (650), stat numerals (700, tabular-nums). Tracking tightens as size grows: -0.015em headings, -0.03em display, -0.04em statement, -0.045em hero, -0.055em beat. Line height 1.04 display, 0.98 hero/beat. Self-hosted in fonts/ (SIL OFL 1.1). Display sizes grow 1.5–2× from phone to desktop and stop at 5rem (80px); the scale is the same at 1440, 1920 and 2560. Scale: hero clamp(2.6rem, 1.9rem + 3vw, 5rem); statement clamp(2.5rem, 1.85rem + 2.8vw, 4.75rem); display clamp(2.2rem, 1.7rem + 2.2vw, 3.75rem); h1 clamp(1.9rem, 5vw, 2.6rem); h2 clamp(1.4rem, 3.4vw, 1.75rem); h3 1.2rem; h4 1.02rem.)
- **Body:** ui-sans-serif — weights 400, 500, 600 — fallbacks: -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif (The system grotesque carries body, UI and buttons. 1rem at 1.5 line height, lede clamp(1.05rem, 2.6vw, 1.25rem), small 0.92rem. Prose capped at 34rem. text-wrap: balance on headings, pretty on paragraphs.)
- **Mono:** ui-monospace — weights 400, 600 — fallbacks: SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace (Does real work: eyebrows (0.8rem, caps, +0.14em), labels, badges (0.72rem, +0.12em — the floor, nothing smaller), numbers, table headers, status words, HUD readouts. Numbers are always tabular-nums.)

## Voice & Tone

- **Adjectives:** calm, confident, plain-spoken, honest, warm, a little expensive-looking
- **Tone:** Like a competent neighbour who explains things properly. Warm, direct, never salesy, never talking down. The reader runs a shop, a clinic, a law firm or a trade — smart and busy, not technical. Short sentences, one idea each, no paragraph past two lines. Second person, active voice, sentence case, Canadian spelling.

### Messaging pillars
- You don't need to be an expert anymore — not in Excel, not in Shopify, not in ads. The owner brings the intent and the judgement; the AI, connected to their tools, brings the expertise. ("Just say what you want." / "Stop learning ten tools. Talk to one.")
- The offer: one AI at the center of your business. We set up Claude or ChatGPT for your team and connect it to the tools you already use (shop, books, ads, email, files), so you just ask and it gets done in those systems — then we teach you to use it. The tools are the bodies pulling on each other; the AI at the center is what makes the orbit stable. For owners who have barely used AI: plain words only. Along the way we cut the tools they pay for but barely use, move them off outdated, expensive software, and bring scattered information into one place they can just ask.
- Every claim lands on one of three things an owner cares about: **time saved, money saved, or money made** (cost × latency). Say which one, in their numbers where we have them.
- Your business is a three-body problem: a dozen tools pulling on each other. We find the stable orbit and keep it there.
- One tech expert for small businesses in Newfoundland & Labrador — we rebuild your website, host it and look after it every month.
- AI your team actually uses: we set it up inside the tools you already have and teach you and your staff to get real value from it every day.
- True trust only: fixed price in writing, you own everything, based in St. John's. No invented numbers, no testimonials we don't have, no scarcity.
- One place to see it all: the client portal — Overview, Initiatives, Billing. Nothing to chase.

### Vocabulary
- **Use:** set up, website, we look after it, takes the job off your plate, it's working / it's down, what it costs, talk to us, Book a call, fixed price in writing, you own everything, Live · Building · Down, amount to confirm, colour, centre, licence (Canadian spelling)
- **Avoid:** provision, onboard, deploy, web presence, digital experience, managed service, maintenance retainer, automates the workflow, agentic infrastructure, operational / degraded, investment, pricing structure, book a discovery call, Learn more, Get started, Submit, leveraging, cutting-edge, transformative, unlock, 10× faster, 99.9% uptime or any invented metric, limited spots, deadlines, first come — any scarcity, AI replaces your lawyer / accountant, we're excited to announce, let's dive in, users, the client (say you)

## Imagery

- **Style:** Made of light, not photographs: a night sky with one warm light source, orbit rings, a 32px hairline grid and a sparse starfield, glass panels catching light on their top edge. The signature is the real-physics three.js scene — three plasma suns over a spacetime grid, settling from chaos into the Chenciner–Montgomery figure-eight.
- **Subjects:** the mark — sun, one orbit ring, one agent dot, the figure-eight orbit drawn from real simulation path data, the three-body night-sky scene (hero only, one per page), real UI of the client portal in settling glass panels, status boards, sparklines and timelines with real or Example-labelled data
- **Treatment:** Ambient light is positioned absolute inside a clipped, isolated section — never fixed. Light core never passes under text; only the dim halo may. Texture fades out under a veil before it reaches prose. Scene sections are dark and carry text only on the --scene-veil. Every page may open in chaos but ends settled.
- **Avoid:** stock photography or stock faces, illustrations of people, gradient blobs and purple AI washes, glassmorphism card grids as decoration, AI sparkle icons, an ∞ glyph or a hand-drawn lemniscate in place of the figure-eight, fake client logos or testimonials, light sections

## Layout

- **Radius:** 12px
- **Border weight:** 1px
- **Spacing:** 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128

### Posture rules
- Radius pairing is the silhouette: buttons, badges and nav links are pills (999px); cards are 20px; full-bleed panels and bento cells 28px; inputs, icon chips and code wells 12px. Never square either off, never round further.
- Containers: 64rem default, 78rem for bento/split/full-bleed/demo, prose capped at 34rem. Gutter 16px, 32px from 640px. 375px is a designed floor; nothing scrolls sideways.
- One action per page — Book a call — as the only solid ember fill in view; everything else is a ghost pill (transparent, --line-strong border, --text label) or a link. Sticky on phones only when no inline primary is on screen.
- No two adjacent sections share an archetype: night-sky hero, full-bleed feature, split with visual, bento, big statement, live demo panel, card grid. The night sky and big statement are one per page.
- Three depth layers in fixed order: light and orbit (z 0), texture (z 1), content and glass (z 2). A glass panel at rest carries shadow-md plus the lit inset edge.
- Every state is a colour and a word: Live (#34d399), Building (#fbbf24), Down (#fb7185). Charts: five series max, baseline at zero, every series labelled in words.
- 44px minimum tap target on every control; focus is 2px solid ember at a 3px offset on :focus-visible. Hover never greys text — glow grows, lift -1px (buttons) or -3px (cards).
- Motion explains, then stops: orbits at 90/140/200s, one light sweep, first-time reveals, count-ups. No on-page Motion switch; the operating system's prefers-reduced-motion setting freezes everything with every value still on screen.
- Numbers you don't have yet are a dashed 'to confirm' chip; sample data wears an Example tag; a missing photo is a dashed 'Photo to come' circle.
