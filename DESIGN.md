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
  faint: "#8f8983"
  ember-ink: "#1a1206"
---

# Solenix

> Category: Brands

> Surface: web

*One tech expert for small businesses in Newfoundland & Labrador. Your business is a three-body problem — we find the stable orbit.*

The system behind solenix.dev. Solenix is one tech expert for small businesses in St. John's, Newfoundland and Labrador: we put one AI at the centre of the tools the business already uses, cut the tools it does not need, teach the team, and build the website. The visual world is a night sky — deep blue-black grounds, one warm light source, orbit lines — and the story is chaos settling into the figure-eight orbit. The marketing site is dark, and its signature is one three.js night-sky world that is the whole homepage, where three suns settle into a figure-eight. Calm, confident, a little expensive-looking. Plain Canadian English.


## Decisions (Jager's, binding on every page; his latest word wins)

- Homepage base: the one journey through the 3D world (#80, 2026-10-11). Never fall below it. Changes go through Impeccable, one named change at a time, and Jager judges each before the next.
- The hero opens with "Your business is a three-body problem", and a small-business owner must understand in seconds what Solenix does and want to call.
- The 3D world is the site (2026-10-11). Everything the visitor sees on the homepage lives in the world: each tool's work is 3D objects at that tool's world, and the words are type set in the space. Nothing flat is laid over the scene: no card, panel, caption or tag. Only the nav, Book a call and the screen-reader story are flat. At each tool the AI does the job live in front of the visitor, every time they arrive: the ask, the agent at work, the result, in about four seconds; scrolling on skips it. A line of words is ten words or fewer. The camera glides on one continuous path, the scroll stays native up and down, and the journey ends on the close, never the footer. The visitor has never seen AI do real work. Stops: lib/home/journey.ts; each tool's work: lib/home/proof.ts. <!-- bans: /simulated typing|race clocks?|no live runs?|answers? (shows|appears) at once|answers at once|glass cards|stack held beside|stand in a stack|captions? sit low in the sky|scene (fixed|running) behind/i in PRODUCT.md AGENTS.md GLOSSARY.md .agents/product-marketing.md .impeccable/** design/*.md design/*.html docs/** lib/home/** -->
- The work stops are roles, not tools (2026-10-11): an owner is also the receptionist, the bookkeeper, the ad manager, the stock manager and the analyst. Each stop speaks to that pain ("You're also the bookkeeper.") and shows the AI doing the job, live, on real use cases. "You don't need to be an expert" stays, on the Talk-to-one stop. <!-- bans: /expert in (QuickBooks|Gmail|Shopify|Meta Ads|Excel|\[tool\])/i in design/*.html design/*.md .impeccable/surfaces/design-home-html.md PRODUCT.md .agents/product-marketing.md lib/home/** -->
- Keep "From one call to a stable orbit": five stops, slow enough to read, visuals over text, steps never overlapping.
- The 3D world must keep getting better: never flattened, nothing flat laid over it.
- Price line: "A fixed price, in writing. Agreed on the call. No surprise invoice." No public prices; value-based per initiative.
- No on-page ROI calculator and no "your numbers, not ours".
- The site is dark only. <!-- bans: /follows? the device/i in AGENTS.md DESIGN.md -->
- No Motion switch.
- Offer: one AI agent, any one the owner chooses, at the centre of the tools they already use; cut unused tools; teach; build the website. The site never names a vendor as the AI we set up (2026-10-11). Claims land on time or money. <!-- bans: /\b(Claude|ChatGPT|OpenAI|Gemini|Copilot|Codex|Cursor)\b/ in design/*.html app/(site)/** app/articles/** lib/home/** lib/site-*.ts components/** PRODUCT.md DESIGN.md .impeccable/surfaces/design-home-html.md -->
- "Agents Marketplace" (never "Tools we use"): works with any AI, one copy-paste prompt per tool, GitHub stars for open source.
- Book a call opens a real booking page, never mailto.
- Nav: one floating glass pill on every page (homepage, Articles, each article, the React pages), with Articles in it on every screen size. Its one source is `lib/site-nav.ts`; the server adds it to each page and no page holds a copy (`scripts/sot-check.ts` fails a commit that adds one). The sign-in button is "Solenix platform" ("Platform" on phones) with a small orbiting dot. Moving between pages is seamless: no white or black frame, ever. The browser holds the old page until the new one can paint, the nav stays put, and the page beneath cross-fades with the browser's own blend (a hand-made fade-out and fade-in drift apart and flash). Nothing waits on a timer: first-screen content is never hidden for a reveal, and a page starts loading on the click. Every page declares `color-scheme: dark` first. (2026-10-09)
- What Jager approved stays word for word: design/approved.md.

## Color Palette

| Role | Name | Hex | Usage |
| --- | --- | --- | --- |
| background | Night | `#0b0d12` | Page floor (--bg) on every surface. The sky ground runs Night → Night far (#11141b) as a radial away from the light source. Never a light section. |
| surface | Glass | `#141820` | Cards, nav, panels (--surface-solid). As glass it is used at 84% alpha with an 18px blur and a lit top edge (inset 0 1px 0 paper 16%). The 84% is the measured minimum for AA through the panel. |
| foreground | Paper | `#f4f2ee` | Headings and body (--text). 17.4:1 on Night, 15.9:1 on Glass. |
| muted | Stone | `#a39e97` | Secondary prose, nav links at rest, status words (--muted). 7.3:1 on Night. Captions and metadata may drop to Faint #8f8983 (5.6:1) — never anything a reader acts on. |
| border | Hairline | `#1e222b` | Solid hairlines and SVG rules (--line-solid). In CSS use --line (paper 9%) over surfaces and --line-strong (paper 20%) for ghost buttons, inputs and anything that must read as a boundary. |
| accent | Ember | `#f59e0b` | Action ember: the one solid fill per screen (Book a call, or Copy for your AI on the marketplace), with ink #1a1206 at 8.6:1. Light ember is unlimited: links, focus rings, orbit strokes, glows, chart series one. 9.1:1 on Night. |
| accent-secondary | Sun gold | `#fbbf24` | The sun's bright stop (--sun1) and the ember hover/accent-text (--accent-hover, --accent-text). Hover on an accent fill moves lighter, so contrast goes up (11.1:1 with ink). Paired with Sun ember #f97316 for the mark gradient, the headline gradient and the scene's suns. |

## Typography
- **Display:** Sora — weights 500, 600, 650, 700, 800 — fallbacks: ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif (Geometric grotesque whose round bowls echo the mark. Headlines, statements, the lockup (650), stat numerals (700, tabular-nums). Tracking tightens as size grows: -0.015em headings, -0.03em display, -0.04em statement, -0.045em hero, -0.055em beat. Line height 1.04 display, 0.98 hero/beat. Self-hosted from @fontsource-variable/sora by scripts/vendor.ts (public/vendor/fonts.css; SIL OFL 1.1). Display sizes grow 1.5–2× from phone to desktop and stop at 5rem (80px); the scale is the same at 1440, 1920 and 2560. Scale: hero clamp(1.6rem, min(1.9rem + 3vw, 11svh), 5rem), scaled by height too so every hero fits its screen; statement clamp(2.5rem, 1.85rem + 2.8vw, 4.75rem); display clamp(2.2rem, 1.7rem + 2.2vw, 3.75rem); h1 clamp(1.9rem, 5vw, 2.6rem); h2 clamp(1.4rem, 3.4vw, 1.75rem); h3 1.2rem; h4 1.02rem.)
- **Body:** ui-sans-serif — weights 400, 500, 600 — fallbacks: -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif (The system grotesque carries body, UI and buttons. 1rem at 1.5 line height, lede clamp(1.05rem, min(2.6vw, 3.4svh), 1.25rem), small 0.92rem. Prose capped at 34rem. text-wrap: balance on headings, pretty on paragraphs.)
- **Mono:** ui-monospace — weights 400, 600 — fallbacks: SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace (Does real work: labels (0.8rem, caps, +0.14em), badges (0.75rem, +0.12em — the floor, nothing smaller), numbers, table headers, status words, HUD readouts. Numbers are always tabular-nums.)
- **Brand motion mono:** JetBrains Mono — weight 700 — fallbacks: none (drawn on a canvas). Used only in brand/motion/index.html, the three-body motion piece: the SOLENIX.DEV line and the name tags. No site page draws text in it. Self-hosted: scripts/vendor.ts writes its @font-face rules into public/vendor/fonts.css from @fontsource-variable/jetbrains-mono.

## Voice & Tone

- **Adjectives:** calm, confident, plain-spoken, honest, warm, a little expensive-looking
- **Tone:** Like a competent neighbour who explains things properly. Warm, direct, never salesy, never talking down. The reader runs a shop, a clinic, a law firm or a trade — smart and busy, not technical. Short sentences, one idea each, no paragraph past two lines. Second person, active voice, sentence case, Canadian spelling.

### Messaging pillars
- You don't need to be an expert anymore — not in Excel, not in Shopify, not in ads. The owner brings the intent and the judgement; the AI, connected to their tools, brings the expertise. ("Just say what you want." / "Stop learning ten tools. Talk to one.")
- The offer: one AI at the centre of your business. We set up the AI agent of your choice for your team and connect it to the tools you already use (shop, books, ads, email, files), so you just ask and it gets done in those systems — then we teach you to use it. The tools are the bodies pulling on each other; the AI at the centre is what makes the orbit stable. For owners with no AI knowledge: plain words only. Along the way we cut the tools they pay for but barely use, move them off outdated, expensive software, and bring scattered information into one place they can just ask.
- Every claim lands on one of three things an owner cares about: **time saved, money saved, or money made** (cost × latency). Say which one, in their numbers where we have them.
- Your business is a three-body problem: a dozen tools pulling on each other. We find the stable orbit and keep it there.
- One tech expert for small businesses in Newfoundland & Labrador — one AI at the centre of the tools you already use, the unused tools cut, your team taught, your website built.
- AI your team actually uses: we set it up inside the tools you already have and teach you and your staff to get real value from it every day.
- True trust only: fixed price in writing, you own everything, based in St. John's. No invented numbers, no testimonials we don't have, no scarcity.

### Vocabulary
- **Use:** set up, website, we look after it, takes the job off your plate, it's working / it's down, what it costs, talk to us, Book a call, fixed price in writing, you own everything, Live · Building · Down, amount to confirm, colour, centre, licence (Canadian spelling)
- **Avoid:** provision, onboard, deploy, web presence, digital experience, managed service, maintenance retainer, automates the workflow, agentic infrastructure, operational / degraded, investment, pricing structure, book a discovery call, Learn more, Get started, Submit, leveraging, cutting-edge, transformative, unlock, 10× faster, 99.9% uptime or any invented metric, limited spots, deadlines, first come — any scarcity, AI replaces your lawyer / accountant, we're excited to announce, let's dive in, users, the client (say you)

## Imagery

- **Style:** Made of light, not photographs: a night sky with one warm light source, orbit rings, a 32px hairline grid and a sparse starfield, glass panels catching light on their top edge. The signature is the real-physics three.js scene — three plasma suns over a spacetime grid, settling from chaos into the Chenciner–Montgomery figure-eight.
- **Subjects:** the mark — sun, one orbit ring, one agent dot, the figure-eight orbit drawn from real simulation path data, the three-body night-sky scene (one scene that is the whole homepage; its first-frame still stands behind the platform page), status boards, sparklines and timelines with real or Example-labelled data
- **Treatment:** On the homepage the scene is the page: the tools' work, the words and the AI agent are objects in it, lit by its light, and the camera moves through it on one continuous path (Decisions). The platform page shows the scene's still behind its words. Words in the world stay readable by their own glow and by keeping bodies and trails out from behind them, never by fading the scene or laying a panel over it. Every page may open in chaos but ends settled.
- **Avoid:** stock photography or stock faces, illustrations of people, gradient blobs and purple AI washes, glassmorphism card grids as decoration, AI sparkle icons, an ∞ glyph or a hand-drawn lemniscate in place of the figure-eight, fake client logos or testimonials, light sections

## Layout

- **Radius:** 12px
- **Border weight:** 1px
- **Spacing:** 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128

### Posture rules
- Radius pairing is the silhouette: buttons, badges and nav links are pills (999px); cards are 20px; full-bleed panels and bento cells 28px; inputs, icon chips and code wells 12px. Never square either off, never round further.
- Containers: 64rem default, 78rem for bento/split/full-bleed/demo, prose capped at 34rem. Gutter 16px, 32px from 640px. 375px is a designed floor; nothing scrolls sideways.
- No eyebrow or kicker above a heading, on any page: the heading carries itself (Impeccable's ban, Jager's choice). A label may name a list or a value, never a heading.
- One action per screen as the only solid ember fill in view: Book a call, or Copy for your AI on the Agents Marketplace; everything else is a ghost pill (transparent, --line-strong border, --text label) or a link. Sticky on phones only when no inline primary is on screen.
- On pages other than the homepage (the homepage is one 3D world): no two adjacent sections share an archetype: night-sky hero, full-bleed feature, split with visual, bento, big statement, live demo panel, card grid. The big statement is one per page.
- On pages other than the homepage, three depth layers in fixed order: light and orbit (z 0), texture (z 1), content and glass (z 2). A glass panel at rest carries shadow-md plus the lit inset edge.
- Every state is a colour and a word: Live (#34d399), Building (#fbbf24), Down (#fb7185). Charts: five series max, baseline at zero, every series labelled in words.
- 44px minimum tap target on every control; focus is 2px solid ember at a 3px offset on :focus-visible. Hover never greys text — glow grows, lift -1px (buttons) or -3px (cards).
- Motion explains: the three-body world settling into its orbit, the AI agent doing each tool's job live on every arrival, one light sweep, first-time reveals. No on-page Motion switch; the operating system's prefers-reduced-motion setting freezes everything with every value still on screen.
- Numbers you don't have yet are a dashed 'to confirm' chip; sample data says Example (on the homepage, in the world, never a flat tag); a missing photo is a dashed 'Photo to come' circle.

## Components

Each entry is what ships, read from its source file. Change the source, then this section.

### Buttons
Confident pills that lift toward you; one solid ember per screen, everything else ghost.
- **Shape:** a full pill (--radius-pill); 44px minimum target (--tap-min); the homepage's own button is 52px tall.
- **Primary (action ember):** the ember gradient (--grad-ember) with ink text (--accent-ink), semibold; the one solid fill per screen (Book a call; Copy for your AI on the marketplace). Source: components/ui/button.tsx (default), design/home.html (.btn-primary).
- **Hover / Focus:** hover turns solid --accent-hover, lifts 1px and grows the glow; focus is 2px solid ember at a 3px offset.
- **Ghost / Outline:** transparent, a --line-strong border, --text label; it never competes with the ember.

### Chips
Quiet mono tags that count what a thing is made of.
- **Style:** a pill with a 1px --line border, mono at 0.78rem, --muted text, tabular numbers; an icon in --accent-text leads. Source: app/(site)/agents/worlds-css.ts (.wd-chips).
- **State:** read-only; a chip never acts.

### Cards / Containers
Glass over the night sky, lit along the top edge.
- **Corner Style:** --radius-xl for cards, --radius-2xl for panels and windows.
- **Background:** --glass-bg (Glass at 84%) with an 18px blur; --surface-solid when nothing moves behind.
- **Shadow Strategy:** the lit inset edge (--glass-edge) plus --shadow-md at rest, --shadow-lg and a soft sun glow on hover.
- **Border:** 1px --line; on hover the border warms to ember.
- **Behaviour:** hover lifts 3px with one light sweep across the card; reduced motion removes the sweep. Source: app/articles/route.ts (.card).

### Navigation
One floating glass pill on every page, held still while the next page paints; on an article it gives way to the article's own bar as you read.
- **Style:** --glass-bg with an 18px blur, 12px from the top, as wide as the page; Sora wordmark with the mark. Source: lib/site-nav.ts.
- **States:** links rest in --muted, hover on a --line wash, and the current page reads --accent-text on --accent-quiet; "Solenix platform" ("Platform" on phones) carries a small orbiting dot.
- **Articles:** an article's own bar slides in as the site nav leaves and names the section being read (client/article-bar.ts).

### Copy for your AI (signature)
The marketplace's one action: a sentence a visitor copies and pastes into their AI agent.
- **Shape and colour:** the primary button's ember pill.
- **States:** idle; "Copied. Paste it into your AI" for 3 seconds; when copying fails, the sentence is selected and the page says how to copy it by hand. Source: lib/copy-for-ai.ts.
- **Sentence:** one renderer (Sentence in app/(site)/agents/worlds.tsx) shows commands in code only when a copy fails, never breaking inside a word or between a flag and its value.

### Live article window (signature)
The articles page's first screen: the newest article itself, live, in a window with the visitor's own screen shape.
- **Shape:** --radius-2xl glass window with a bar at its foot (a New pill, the title, a hint, and a ghost Play with it); a narrow window keeps only the action.
- **Behaviour:** the article is laid out at the visitor's screen size and scaled into the window, so its whole first screen shows; a wheel over it scrolls the page; Play with it grows the same picture to full screen. Source: app/articles/route.ts, client/articles-live.ts.
