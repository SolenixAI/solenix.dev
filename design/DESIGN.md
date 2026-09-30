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
- **Display:** Sora — weights 500, 600, 650, 700, 800 — fallbacks: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif (Geometric grotesque whose round bowls echo the mark. Headlines, statements, the lockup (650), stat numerals (700, tabular-nums). Tracking tightens as size grows: -0.015em headings, -0.03em display, -0.04em statement, -0.045em hero, -0.055em beat. Line height 1.04 display, 0.98 hero/beat. Self-hosted in fonts/ (SIL OFL 1.1). Scale: hero clamp(2.6rem, 7.4vw, 8.25rem); statement clamp(2.75rem, 10vw, 6rem); display clamp(2.4rem, 7.2vw, 4.5rem); h1 clamp(1.9rem, 5vw, 2.6rem); h2 clamp(1.4rem, 3.4vw, 1.75rem); h3 1.2rem; h4 1.02rem.)
- **Body:** ui-sans-serif — weights 400, 500, 600 — fallbacks: -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif (The system grotesque carries body, UI and buttons. 1rem at 1.5 line height, lede clamp(1.05rem, 2.6vw, 1.25rem), small 0.92rem. Prose capped at 34rem. text-wrap: balance on headings, pretty on paragraphs.)
- **Mono:** ui-monospace — weights 400, 600 — fallbacks: SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace (Does real work: eyebrows (0.8rem, caps, +0.14em), labels, badges (0.72rem, +0.12em — the floor, nothing smaller), numbers, table headers, status words, HUD readouts. Numbers are always tabular-nums.)

## Voice & Tone

- **Adjectives:** calm, confident, plain-spoken, honest, warm, a little expensive-looking
- **Tone:** Like a competent neighbour who explains things properly. Warm, direct, never salesy, never talking down. The reader runs a shop, a clinic, a law firm or a trade — smart and busy, not technical. Short sentences, one idea each, no paragraph past two lines. Second person, active voice, sentence case, Canadian spelling.

### Messaging pillars
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
