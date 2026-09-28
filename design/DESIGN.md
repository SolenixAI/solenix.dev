# SolenixAI design system · v2

The system behind [solenix.dev](https://solenix.dev). It is not a new brand — it
is the one already live, given a display voice, a signature visual language, and
permission to look expensive.

**Files**

| File | What it is |
| --- | --- |
| `DESIGN.md` | This document. Principles, tokens, voice. |
| `tokens.css` | The tokens as CSS custom properties. The only place a hex may appear. |
| `index.html` | The showcase. Every token and component, rendered, in both themes. |
| `assets/brand/` | The shipped logo and avatar, copied from `/brand/out/`. |

**What shipped in v1, and stays**

The palette, the sun gradient, the ember accent and the sun-plus-orbit-plus-dot
mark. Every token name from v1 and from `/assets/site.css` survives unchanged
and still means the same thing, so `site.css` keeps working if you drop
`tokens.css` in front of it. The voice is untouched.

## What v2 changes, and why

v1 was tuned for *calm*, and its own rules made everything flat. Four of them
did the damage, and all four are retired here:

| v1 rule | v2 |
| --- | --- |
| One family for display and text | **Sora** carries display. Text and mono are unchanged. |
| "One gradient exists in this brand: the sun" | Five named gradients, plus glows, glass and texture — all tokens. |
| "The accent appears twice per screen at most" | Split in two: **action ember** stays rare, **light ember** is unlimited. |
| "Movement is ambient and slow, or a 120ms acknowledgement" | Five signature motions, all reduced-motion safe. |

v2 also adds what the client portal needed and v1 did not have: data
visualisation tokens and components, and section archetypes beyond the card grid.

**One fix carried in.** v1's gradient headline word used `--sun1` → `--sun2` as
text colour in both themes. In light theme that is **1.60:1** — a failure, on the
largest words on the page. v2 gives the effect its own theme-aware token,
`--grad-headline`, measured in section 3.

---

## 1. Principles

**1. One light source, and you can feel it.** Every screen has a single place the
light comes from. Grounds fall away from it, glass edges catch it, orbit lines
bend around it, data points glow with it. Warmth is not a colour we apply — it is
a light we place.

**2. Plain words, plainly set.** Our reader runs a bakery, not a build pipeline.
The type got more ambitious; the language did not. Copy stays short, concrete and
free of jargon, and the display face exists to make it look considered, not to
make it look clever.

**3. Premium is restraint in the neutrals and generosity in the light.** The
grounds stay deep, quiet and nearly colourless. Everything expensive-looking is
made of light: glow, gradient, glass, texture. Add light before you add colour.
If a screen feels flat, it needs another layer of depth, not another hue.

**4. Show the state.** A small business owner's real question is "is it working
right now?" Every surface with a state shows it — live, building, down — with a
colour *and* a word. Never colour alone. This is why the status hues are not the
accent, and why the charts carry labels.

**5. Motion explains, then gets out of the way.** Orbits drift, light sweeps
once, sections arrive as you reach them, numbers count to their value. Each one
says something: this is alive, this is the thing to press, this is new, this is a
quantity. Nothing bounces to be noticed. `prefers-reduced-motion` turns all of it
off and every value is still on the screen.

**6. Reachable, at any size.** AA contrast in both themes, measured against the
real background — including through glass. 44px targets. 375px is a designed
floor, not a squeeze.

---

## 2. Type

**Three roles, three faces.** v1 ran display and text on one system stack, which
is the single biggest reason it read as flat: nothing on the page had a voice.

| Token | Stack | Role |
| --- | --- | --- |
| `--font-display` | **Sora** → system grotesque | Headlines, statements, the lockup, stat numerals |
| `--font-text` | system grotesque (unchanged) | Body, UI, buttons |
| `--font-mono` | `ui-monospace` → `SFMono` → `Menlo` (unchanged) | Eyebrows, labels, numbers, table headers, status, code |

### Why Sora

A geometric grotesque whose bowls are near-perfect circles — the same geometry as
the mark — with tight apertures and flat terminals that read as technical rather
than friendly. It holds its presence at 96px, which is what the big-statement
archetype needs, and it is not Inter, Roboto, or Space Grotesk, so it does not
arrive pre-loaded with somebody else's startup.

It loads from Google Fonts as a variable face, weights 400–800, with the v1
system stack as its fallback. Only weights 500, 600, 700 and 800 are used.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400..800&display=swap">
```

`display=swap` means the fallback renders first and the page never blanks. Sora
and the system stack have close enough metrics that the swap does not reflow the
layout.

> ### Follow-up: `brand/build.py` needs the same face
>
> `build.py` writes SVG banners and the avatar, and an SVG cannot load a
> webfont — it renders with whatever the viewer has. Until it is dealt with, the
> banners are set in the system grotesque and the site is set in Sora, and they
> read as two brands.
>
> Two ways to fix it, both on `build.py`'s side:
>
> 1. **Outline the text.** Convert the wordmark to `<path>` data once and paste
>    it in. Renders identically everywhere, at any size, forever. Best for the
>    lockup, which is the same five words every time.
> 2. **Embed the face.** Base64 the Sora subset into an SVG `@font-face`. Works,
>    but inflates every banner by the size of the font.
>
> Recommended: outline the lockup, leave generated body labels on the system
> stack. Sora's licence (SIL OFL 1.1) permits both.
>
> Until then, `build.py`'s own font stack stays as it is — a half-migration where
> the banners *reference* Sora would render as a random fallback on other
> people's machines, which is worse than a consistent system stack.

### Scale

`clamp()` throughout, so 375px and 1920px both land without a media query.

| Token | Value | Tracking | Weight | Use |
| --- | --- | --- | --- | --- |
| `--fs-statement` | `clamp(2.75rem, 10vw, 6rem)` | `-0.04em` | 800 | The big-statement archetype. One per page. |
| `--fs-display` | `clamp(2.4rem, 7.2vw, 4.5rem)` | `-0.03em` | 700 | The headline that owns a page |
| `--fs-h1` | `clamp(1.9rem, 5vw, 2.6rem)` | `-0.015em` | 700 | Page title |
| `--fs-h2` | `clamp(1.4rem, 3.4vw, 1.75rem)` | `-0.015em` | 650 | Section title |
| `--fs-h3` | `1.2rem` | `-0.015em` | 650 | Card title |
| `--fs-h4` | `1.02rem` | `-0.015em` | 600 | Sub-head, step title |
| `--fs-stat` | `clamp(1.9rem, 5.5vw, 2.75rem)` | `-0.02em` | 700 | A stat's numeral |
| `--fs-lede` | `clamp(1.05rem, 2.6vw, 1.25rem)` | `0` | 400 | The sentence under a headline |
| `--fs-body` | `1rem` | `0` | 400 | Prose |
| `--fs-sm` | `0.92rem` | `0` | 400 | Nav, secondary UI |
| `--fs-xs` | `0.8rem` | `0.14em` | 600 | Eyebrows, section labels (mono, caps) |
| `--fs-2xs` | `0.72rem` | `0.12em` | 600 | Badges. **The floor — nothing smaller.** |

Weights: `--fw-regular` 400, `--fw-medium` 500, `--fw-semibold` 600,
`--fw-brand` 650, `--fw-bold` 700, `--fw-black` 800. 650 is the lockup weight;
800 is for `--fs-statement` only.

Line height: `--lh-display` 1.04, `--lh-heading` 1.2, `--lh-body` 1.5,
`--lh-relaxed` 1.6.

### Rules

- Tracking tightens as type grows and opens as it shrinks into a label. Sora
  needs slightly less negative tracking than the system stack did — `-0.03em` at
  display, not `-0.035em`.
- Prose is capped at `--measure` (34rem). Long lines are the most common way to
  make plain words feel hard.
- `text-wrap: balance` on headings, `pretty` on paragraphs.
- Numbers are mono and `tabular-nums`, always — except a stat's headline numeral,
  which is display weight 700 with `tabular-nums`, because it is a display
  element that happens to be a number.
- **Gradient text is display-size only.** `--grad-headline` may be applied at
  `--fs-h1` and above, to one phrase, once per page. Never to body, never to a
  label, never to a whole heading.

---

## 3. Colour

Light is the default; dark arrives with `prefers-color-scheme` and can be forced
with `data-theme` on `<html>`. **The palette is unchanged from v1.** v2 adds
light, not colour.

### Surfaces and ink

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#fbfaf8` | `#0b0d12` | Page floor |
| `--bg2` | `#f3f1ed` | `#11141b` | Far corner of the page ground |
| `--surface` | `white 86%` | `#141820 84%` | Cards, nav, raised areas |
| `--surface-solid` | `#ffffff` | `#141820` | When translucency is not available |
| `--surface-sunken` | `ink 5%` | `paper 5%` | Code wells, inset rows |
| `--text` | `#1c1917` | `#f4f2ee` | Headings and body |
| `--muted` | `#57534e` | `#a39e97` | Secondary prose |
| `--faint` | `#736d67` | `#8f8983` | Captions, metadata |
| `--line` | `ink 10%` | `paper 9%` | Hairlines over a surface |
| `--line-solid` | `#e4e0d9` | `#1e222b` | Hairlines in SVG exports |

### Accent — the ember

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--accent` | `#c2410c` | `#f59e0b` | Eyebrows, primary fill, links |
| `--accent-hover` | `#9a3412` | `#fbbf24` | Hover on an accent fill |
| `--accent-ink` | `#ffffff` | `#1a1206` | Text on an accent fill |
| `--accent-text` | `#9a3412` | `#fbbf24` | Accent as small text on a tint |
| `--accent-quiet` | `accent 12%` | `accent 12%` | Icon chips, soft fills |

`--accent-text` exists because `--accent` is AA on the page background but not
always on a *tinted* background. Small accent text on a tint uses `--accent-text`.

How much accent you may use is section 5.

### Sun — the logo gradient

`--sun1` `#fbbf24` → `--sun2` `#ea580c` (light) / `#f97316` (dark), with `--ring`
for the orbit stroke and agent dot. This belongs to the mark and the ambient
light. **It is still never a page background, and `--sun1` is never a text
colour** — it measures 1.60:1 on the light ground. For gradient text, use
`--grad-headline`, which is built for the job and measured below.

### Status

| Token | Light | Dark | Means |
| --- | --- | --- | --- |
| `--ok` | `#065f46` | `#34d399` | **Live.** Running and reachable. |
| `--warn` | `#9a3412` | `#fbbf24` | **Building.** Work in flight. |
| `--down` | `#b91c1c` | `#fb7185` | **Down.** Not serving. |

Each has an 8% `-tint` companion for the badge fill. Every badge carries a dot, a
colour and a word — colour alone is not a state.

### Chart — five series

Ember first, so the brand leads the data. The other four are spaced around the
wheel far enough apart to survive being read at 2px stroke width, and each one
clears **4.5:1** in both themes, which means a series colour may also be used as
its own label text.

| Token | Light | Dark |
| --- | --- | --- |
| `--chart-1` | `#c2410c` ember | `#f59e0b` |
| `--chart-2` | `#0f766e` teal | `#2dd4bf` |
| `--chart-3` | `#4338ca` indigo | `#818cf8` |
| `--chart-4` | `#86198f` fuchsia | `#e879f9` |
| `--chart-5` | `#0369a1` sky | `#38bdf8` |

Each has a `-tint` companion — 8% in light, 14% in dark — sized so the series
colour stays AA *on its own tint*. Plus `--chart-grid` (the plot's hairlines,
graphic only), `--chart-axis` (tick labels — `--faint`, so it is text-legal) and
`--chart-track` (the unfilled part of a bar or timeline).

**Rules.** Never more than five series in one plot; at six, the chart is the
wrong chart. Series order is fixed — series one is always `--chart-1`, so the
same metric keeps its colour between screens. Every series is labelled, in the
legend or on the mark; colour never carries the only meaning.

### Trend

| Token | Maps to | Means |
| --- | --- | --- |
| `--trend-up` | `--ok` | The number rose |
| `--trend-down` | `--down` | The number fell |
| `--trend-flat` | `--muted` | No meaningful change |

**A rise is not always good.** Sales up is green; hosting cost up is not. The
direction is in the token; the *judgement* is set per instance, with
`data-sentiment="good"`, `"bad"` or `"neutral"` on the component, which swaps
which colour the arrow gets. Default is neutral: the arrow shows direction in
`--muted` and nobody is told how to feel. Every trend also carries an arrow
glyph and a signed number, so the direction survives without colour.

### Measured contrast

Computed against the token's real background. AA needs 4.5:1 for normal text,
3:1 for large text and essential graphics.

| Pair | Light | Dark |
| --- | --- | --- |
| `--text` on `--bg` | 16.8:1 | 17.4:1 |
| `--muted` on `--bg` | 7.3:1 | 7.3:1 |
| `--faint` on `--bg` | 4.9:1 | 5.6:1 |
| `--accent` on `--bg` | 5.0:1 | 9.1:1 |
| `--accent-ink` on `--accent` | 5.2:1 | 8.6:1 |
| `--accent-ink` on `--accent-hover` | 7.3:1 | 11.1:1 |
| `--accent-ink` on `--grad-ember`, worst stop | 5.2:1 | 8.6:1 |
| `--accent-text` on its tint | 6.2:1 | 9.3:1 |
| `--ok` / `--warn` / `--down` on their tints | 6.5 / 6.2 / 5.4 | 8.1 / 9.3 / 6.0 |
| `--grad-headline`, worst stop, large text | 3.4:1 | 6.9:1 |
| `--chart-1` … `--chart-5` on `--bg` | 5.0 / 5.3 / 7.6 / 7.9 / 5.7 | 9.1 / 10.4 / 6.5 / 7.9 / 9.1 |
| `--chart-1` … `--chart-5` on own tint | 4.5 / 4.8 / 6.8 / 7.1 / 5.2 | 6.6 / 7.4 / 4.9 / 5.9 / 6.6 |
| `--text` through glass, over the ground | 17.2:1 | 16.2:1 |
| `--muted` through glass, over the ground | 7.5:1 | 6.8:1 |
| `--faint` through glass, over the ground | 5.0:1 | 5.2:1 |
| `--faint` through glass, over a glow halo | 5.0:1 | 4.9:1 |

`--faint` is the floor of the system, and through glass over a halo it lands at
4.9:1 in dark. It is for captions and metadata only; anything a reader must act
on uses `--muted` or darker.

**The one measured prohibition.** `--faint` through dark glass sitting directly
over the sun's *core* is 4.1:1 — a failure. So: the core never passes under a
panel. Section 4 says how that is enforced.

### Rules

- No raw hex outside `tokens.css`.
- Derive tones with `color-mix(in oklch, …)`. Do not add `--accent-300`.
- Colour never carries meaning alone. Pair it with a word, an icon or a glyph.
- Audit dark independently. It is not light with the numbers flipped.

---

## 4. Light and orbit

The signature language. Four materials, stacked in a fixed order.

### The four materials

**1. Light.** One source per screen: a soft radial of `--sun2` fading to nothing.
It has a *core* (bright, saturated, small) and a *halo* (dim, wide). The core is
decoration and never passes under text. The halo may.

**2. Ground.** The page floor, `--grad-sky`, falling away from wherever the light
is. Over it, texture: `--texture-grid`, a 32px hairline grid, and
`--texture-stars`, a sparse field of faint points. Both are low-opacity and
masked so they fade out before reaching a block of prose.

**3. Orbit.** Rings and arcs of `--ring` at 10–34% opacity, centred on the light,
with glowing points riding them. This is the mark's geometry at page scale. It
is the one motif that is allowed to repeat on every screen.

**4. Glass.** Panels of `--glass-bg` with `--glass-blur`, a hairline border and a
lit top edge — `inset 0 1px 0 var(--glass-edge)` — so each panel looks like it is
catching the light from above. This is what gives depth without a drop shadow
doing all the work.

### Gradients

The no-gradients rule is gone. Five, all named, all tokens.

| Token | What it is | Where |
| --- | --- | --- |
| `--grad-sun` | The mark's radial, `--sun1` → `--sun2` at 42% 38% | The mark, the light source |
| `--grad-sky` | The page ground, falling away from the light | `body`, full-bleed panels |
| `--grad-ember` | `--accent-hover` → `--accent` at 135° | The primary button, lit edges |
| `--grad-headline` | Theme-aware display-text gradient | One phrase per page, `--fs-h1`+ |
| `--grad-sweep` | A soft diagonal highlight | The light sweep (section 9) |

Plus `--grad-veil`, which is not decoration — it is the fade that stops texture
before it reaches text.

`--grad-headline` is **not** `--sun1` → `--sun2`. In light it runs `#9a3412` →
`#ea580c` (7.0:1 → 3.4:1); in dark it runs `#fbbf24` → `#f97316` (11.6:1 →
6.9:1). Both stops clear 3:1 at large text in both themes, which the v1 version
did not.

**Rules.** A gradient is a light effect, so it runs warm-to-warm or
transparent-to-light — never between two different hues. No gradient goes on a
whole page background except `--grad-sky`. No gradient goes behind body text at
more than 12% strength.

### Glow

| Token | Use |
| --- | --- |
| `--glow-soft` | Ambient — a lit panel edge, an orbit ring |
| `--glow-ember` | The primary button at rest. Ring plus wide warm spread. |
| `--glow-hover` | What a hovered card or button gains, on top of its shadow |
| `--glow-point` | A data point or an agent dot. Uses `currentColor`, so it works on any chart series. |

Glow is light, not elevation. Shadow says *how high*; glow says *how alive*.
An element can have both; most have neither.

### Glass

| Token | Light | Dark |
| --- | --- | --- |
| `--glass-bg` | `white 86%` | `#141820 84%` |
| `--glass-edge` | `white 90%` | `paper 16%` |
| `--glass-blur` | `18px` | `18px` |
| `--glass-inset` | `inset 0 1px 0 var(--glass-edge)` | same |

Those alphas are the same as `--surface`, deliberately: glass is not a second
surface colour, it is `--surface` plus blur plus a lit edge. The alphas are also
the measured minimum — the contrast table's glass rows assume them, so lowering
one breaks AA.

**The core rule, enforced structurally.** Ambient light is positioned
`absolute` inside a section that is `position: relative`, `overflow: hidden` and
`isolation: isolate`. It is never `position: fixed`. That is what keeps the core
out from under panels — and it is a bug fix: v1 pinned a 78vmax sun to the
viewport with `position: fixed`, so it tracked the reader down the entire page
and sat under whatever they were reading.

### Depth and layering

Three layers, in this order, with z-index tokens so nothing guesses:

| Token | Layer |
| --- | --- |
| `--z-sky` `0` | Light and orbit |
| `--z-texture` `1` | Grid and starfield |
| `--z-content` `2` | Glass, text, everything readable |
| `--z-nav` `20` | Sticky header |
| `--z-skip` `30` | Skip link |

A fourth dimension of depth comes free: the sky layer may move at a different
rate from the content on scroll. `--parallax` caps that at 12% of scroll
distance, and it is 0 under reduced motion.

---

## 5. The accent budget

v1 said the accent appears twice per screen at most. That is why it was flat: it
made the brand's only warm colour a scarce resource, so nothing on the page
glowed.

v2 splits the accent by *what it does*.

### Action ember — still rare

A **solid `--accent` or `--grad-ember` fill**, which the reader reads as "press
this". The budget is unchanged and strict:

- **One per screen.** Not per section — per screen. If two are in view, one is
  a secondary button instead.
- A secondary action is a ghost button: transparent fill, `--line-strong`
  border, `--text` label.
- Never a solid accent fill on a badge, a chip, a tab, a nav item or a card.

### Light ember — unlimited

**Ember as light rather than surface**: glows, gradients, orbit strokes, the lit
glass edge, the sun, `--chart-1`, eyebrow dots, focus rings, sparkline fills,
underline sweeps, timeline progress. Use as much as the composition wants.

### The test

> Could a reader mistake this for something to press?

If yes, it is action ember and it costs the budget. If no — it is light, and it
is free. A glowing 1px orbit line is not a button. A 48px pill with a label is.

`--warn` borrows the ember hue for "Building", and that is still fine: it is
semantic, it carries a word, and it is never pill-shaped.

---

## 6. Space and layout

4px base. Use the steps; do not add any.

| Token | Value | | Token | Value |
| --- | --- | --- | --- | --- |
| `--space-1` | 4px | | `--space-6` | 32px |
| `--space-2` | 8px | | `--space-7` | 48px |
| `--space-3` | 12px | | `--space-8` | 64px |
| `--space-4` | 16px | | `--space-9` | 96px |
| `--space-5` | 24px | | `--space-10` | 128px |

Two breathe with the viewport: `--space-section` `clamp(2.5rem, 8vh, 4.5rem)`
and `--space-hero` `clamp(3.5rem, 12vh, 8rem)`.

| Token | Value | Use |
| --- | --- | --- |
| `--container` | `64rem` | Default measure — the live site's width |
| `--container-wide` | `78rem` | Bento, split, full-bleed, demo panel |
| `--measure` | `34rem` | Max line length for prose |
| `--grid-size` | `32px` | The texture grid's pitch |
| `--bento-min` | `15rem` | Smallest bento cell before it drops a column |
| `--gutter` | 16px, 32px from 640px | Page inset |
| `--nav-height` | 72px | Sticky header |
| `--tap-min` | 44px | Minimum interactive target |

**Breakpoints.** 480px (bento goes to two columns), 640px (gutter opens, the
timeline goes horizontal), 720px (two columns), 900px (three columns, split
splits, bento goes to four). Below 480px it is one column, and nothing scrolls
sideways. 375px is the designed floor.

### Section archetypes

v1 had one shape — a card grid — which is the other half of why the pages felt
mediocre. Six shapes, each with a job. **No two adjacent sections use the same
archetype.**

**1. Full-bleed feature.** Edge to edge, `--radius-2xl`, `--grad-sky` ground with
its own light source and orbit rings inside it. Content inset to
`--container-wide`. For the one thing a page is actually about. *One per page.*

**2. Split with visual.** Two columns from 900px: prose capped at `--measure` on
one side, a live visual on the other — a chart, a panel, the mark under motion.
Below 900px the prose goes first, always. The visual is never a decorative
illustration; it shows the thing being described.

**3. Bento grid.** A 4-column grid of glass panels at mixed spans — one 2×2 hero
cell, the rest 1×1 or 2×1 — collapsing to 2 columns at 480px and 1 below that.
For a capability overview where the items are genuinely different sizes of idea.
Every cell is a real thing; no cell exists to fill the grid.

**4. Big statement.** One sentence at `--fs-statement`, centred, on a nearly
empty ground with one orbit arc behind it. No card, no button inside it. It is a
breath between dense sections and a place to say the honest thing. *One per page.*

**5. Live demo panel.** A glass panel framing something that actually works —
a status board, a form, a chart that responds. Chrome is minimal: a label, the
panel, one line of caption. If it cannot be made to work, it is a split with a
static visual instead, and it says so.

**6. Card grid.** The v1 workhorse, kept. Equal cards, 1 / 2 / 3 columns. For
genuinely parallel items — services, steps, plans. Not for everything else.

---

## 7. Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-xs` | 8px | Swatch chips |
| `--radius-sm` | 10px | Small controls |
| `--radius-md` | 12px | Inputs, icon chips, code wells |
| `--radius-lg` | 16px | Nested panels |
| `--radius-xl` | 20px | Cards |
| `--radius-2xl` | 28px | Full-bleed panels, bento cells |
| `--radius-pill` | 999px | Buttons, badges, nav links |

Buttons are pills and cards are 20px. That pairing is the brand's silhouette —
do not square either one off, and do not round either one further. Oversized
radii are the fastest way to make a premium page look like a toy.

---

## 8. Shadow and glow

| Token | Use |
| --- | --- |
| `--shadow-sm` | Hairline lift on a hovered row |
| `--shadow-md` | Cards and glass at rest (`--shadow` is an alias) |
| `--shadow-lg` | Dialogs, the sign-in card, anything floating |
| `--shadow-accent` | The one primary button, and only that |

Two layers each: a 1–2px contact shadow plus a wide soft one. Dark uses black at
higher opacity; light uses warm ink at low opacity.

Shadow signals height. Glow (section 4) signals light. A glass panel at rest
carries `--shadow-md` **and** `--glass-inset`: one puts it above the ground, the
other says the light is coming from above it. Neither is decoration.

---

## 9. Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-fast` | 120ms | Colour, border |
| `--dur-base` | 180ms | Lift, shadow, glow |
| `--dur-slow` | 320ms | Panels, disclosure |
| `--dur-reveal` | 700ms | Section entrance |
| `--dur-sweep` | 1400ms | One pass of the light sweep |
| `--dur-count` | 1200ms | A number counting to its value |
| `--stagger` | 40ms | Delay between staggered siblings |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` | The house curve |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` | Two-way movement |
| `--ease-orbit` | `linear` | Anything circling — easing a loop reads as broken |
| `--pulse-period` | `4s` | One breath of an ambient glow |
| `--orbit-1/2/3` | 90s / 140s / 200s | Ambient orbit periods |
| `--lift` | -1px | Button hover |
| `--lift-card` | -3px | Card hover |
| `--reveal-rise` | 12px | How far a revealed child travels |
| `--parallax` | 0.12 | Sky drift as a fraction of scroll |

### The five signature motions

**1. Orbit.** Rings rotate at `--orbit-1/2/3`, `--ease-orbit`, forever,
alternating direction. 90 seconds is slow enough that you notice it only if you
stop and look — which is the point. It says the system is running.

**2. Light sweep.** `--grad-sweep` crosses an element once over `--dur-sweep`.
Fires on the primary button's hover and on a panel's first appearance. **Once**,
not on a loop — a looping sweep is a casino.

**3. Scroll-linked reveal.** A section's children rise `--reveal-rise` and fade
in over `--dur-reveal`, staggered `--stagger`, triggered by an
`IntersectionObserver` at 12% visibility, and *only the first time*.
Re-animating on scroll-back is motion sickness, not delight.

**4. Number count-up.** A stat counts from 0 to its value over `--dur-count`,
eased out, `tabular-nums` so nothing shifts width. The final value is the
element's real text content, so it is correct before, during and after.

**5. Hover glow.** A card or button gains `--glow-hover` over `--dur-base`
alongside its lift. The glow grows; the text colour never changes. A hover that
greys the label is a bug in this system.

### Reduced motion

`prefers-reduced-motion: reduce` collapses every duration to 1ms, both lifts to
0, `--reveal-rise` to 0 and `--parallax` to 0. Additionally, and explicitly:

- Orbits stop. The rings are still there; they do not turn.
- The sweep does not run.
- Reveals are skipped — the hidden state is added by script only when motion is
  allowed, so content is never left at `opacity: 0` waiting for an observer, and
  never hidden at all without JavaScript.
- Count-ups jump straight to their final value.
- Parallax is off.

Nothing is load-bearing on animation. Every number, state and control is present
and legible with motion fully disabled.

---

## 10. Data visualisation

Four components, for the client portal. All built from `--chart-*` tokens, all
inline SVG or CSS — no chart library, nothing to keep up to date.

### Sparkline

A 7-to-30-point trend line in the width of a table cell. `--spark-line` at 2px
with `stroke-linejoin: round`, `--spark-fill` beneath it fading to nothing, and
`--spark-point` on the last point only — the current value is the only one worth
marking.

Rules: no axes, no gridlines, no tooltip. A sparkline shows *shape*, so it is
always beside the number it belongs to, never alone. It needs a text
alternative naming the range and direction, because a decorative line is
invisible to a screen reader.

**One implementation note.** A sparkline stretches horizontally
(`preserveAspectRatio="none"`), which turns a `<circle>` end point into an
ellipse. Draw the point as a zero-length path with `stroke-linecap: round` and
`vector-effect: non-scaling-stroke` instead; it stays a circle at every width.

### Progress timeline

The project's stages, left to right (stacked below 640px). Each stage is a node
plus a label plus a date. Done nodes are filled `--accent` with a `--chart-track`
connector behind them; the current node is filled and carries `--glow-point` and
a breathing pulse; future nodes are hollow rings on `--chart-track`.

The current stage is marked three ways — fill, glow, and the word *Now* — and
carries `aria-current="step"`. It is the single most-read element in the portal;
it does not get to be subtle.

### Stat with trend

A label, a numeral at `--fs-stat` in display weight with `tabular-nums`, a signed
delta with an arrow glyph, and optionally a sparkline. The numeral counts up on
first view. The delta's colour comes from `data-sentiment` (section 3), not from
the direction — and the arrow plus sign carry the direction regardless.

### Chart frame

Shared furniture for any plot: `--chart-grid` hairlines (horizontal only —
vertical gridlines are noise at this size), `--chart-axis` tick labels in
`--faint` mono, and a legend where each entry is a swatch **and** a word.

**Axis labels live in HTML, not in the SVG.** SVG `<text>` scales with the
viewBox, so a 9px tick label lands at about 6px on a 375px screen. Put the tick
labels in HTML beside and under the plot, and let the plot keep uniform scaling
so its glowing end points stay round.

Rules for all four: five series maximum. Bars and axes start at zero, always —
a truncated axis is a lie, and this system does not print numbers it cannot
stand behind. Values in the portal are real or labelled *Example*. No invented
uptime, traffic or performance figures, anywhere, in copy or in a demo.

---

## 11. Interaction states

**The rule: foreground and background are defined as a pair, and contrast after a
state change is never lower than at rest.** A hover that greys the text is a bug.

| Element | Hover | Focus | Active | Disabled |
| --- | --- | --- | --- | --- |
| Primary button | `--grad-ember` shifts, `--glow-hover` grows, light sweep runs once, lift `--lift` | Focus ring | Lift released | 45% opacity, `not-allowed` |
| Secondary / ghost | Background → `text 8%`, border → `--line-strong`, **text stays `--text`** | Focus ring | Lift released | 45% opacity |
| Nav link | Background → `--line`, text `--muted` → `--text` | Focus ring | — | — |
| Link | Underline appears, 3px offset, colour holds | Focus ring | — | — |
| Input | Border → `--line-strong` | Border → `--accent` + 3px ring | — | Sunken fill, `--faint` text |
| Table row | Background → `--surface-sunken` | Focus ring | — | — |
| Card / glass panel | Lift `--lift-card`, border → 35% accent, `--glow-hover` | Focus ring | — | — |
| Segmented control | Background → `--line`, text → `--text` | Focus ring | — | — |

Focus is `2px solid var(--accent)` at `3px` offset, on `:focus-visible`, on every
focusable element. It is applied from `tokens.css` with a `:where()` selector so
it costs no specificity and cannot be lost by accident.

Disabled is the only state allowed to reduce contrast.

---

## 12. The logo

**Sun + one orbit ring + one agent dot.** Built on a 32-unit grid:

- Ring: `r=14`, stroke `--ring` at 45% opacity, 1.5 units wide.
- Sun: `r=8`, filled with the `--sun1` → `--sun2` radial gradient at `42% 38%`.
- Agent dot: `r=2.2` at `27,9` — one agent in orbit, outside the sun, breaking
  the ring.

One ring, one dot. Two dots is a different mark. The dot always breaks the ring
on the upper right; do not move it. v2 changes nothing here — the mark was never
the problem.

Clearspace is half the mark's width on every side. The lockup pairs the mark with
"SolenixAI" in `--font-display` at `--fw-brand` and `-0.01em`, separated by
`--space-2`. Minimum size is 20px, below which the dot stops resolving — use the
sun alone.

The generated assets in `/brand/out/` are the source of truth for anything
outside the site. They come from `brand/build.py`, which reads the same values
listed here. **If a colour changes here, change it in `build.py` and re-run it
the same day**, or the site and the GitHub banners drift apart. The display face
is the open item — see the follow-up in section 2.

---

## 13. Voice

Unchanged from v1. The look got more ambitious; the language did not.

**Who is reading.** Someone who runs a small business — a shop, a clinic, a
trade. They are smart and busy. They are not technical, and they should not have
to be. They want to know what they get, what it costs them in time, and whether
it is working.

**How we sound.** Like a competent neighbour who explains things properly. Warm,
direct, never salesy, never talking down.

### Rules

**1. Use the words the reader uses.** "Set up", not "provision". "Website", not
"web presence". "Keeps working", not "ensures continued operability".

**2. Say what happens, not what it is.** A button says the outcome.

> Get a website · Browse the marketplace · Start a conversation
>
> ~~Learn more~~ · ~~Get started~~ · ~~Submit~~

**3. Short sentences. One idea each.** If a sentence needs a comma to survive,
split it.

**4. Lead with what they get.** The benefit is the subject of the sentence, not
the technology.

> We find the hours AI can save you and set it up so it keeps working.
>
> ~~Leveraging cutting-edge AI to unlock transformative operational efficiency.~~

**5. Name the real thing.** Real prices, real timelines, real limits. If we do
not know a number, we do not print one. No "10× faster", no "99.9% uptime", no
invented metrics anywhere — in copy or in a demo.

**6. Own the bad news.** When something is down, say it is down, say what we are
doing, say when we will know more. Never "experiencing intermittent degradation".

**7. No jargon without a translation.** Some words are unavoidable — MCP, agent,
marketplace. Introduce each once, in plain words, then use it.

> Agent tools that install in one line.
>
> ~~One-line MCP server provisioning for agentic workflows.~~

**8. Second person, active voice.** "You" and "we". Never "users", never "the
client".

**9. Sentence case everywhere.** Headings, buttons, labels, nav. Title Case is
for the company name. ALL CAPS is for mono eyebrows only, where the tracking
makes it a label rather than shouting.

**10. Cut the warm-up.** "We're excited to announce", "In today's fast-paced
world", "Let's dive in" — delete and start at the point.

### Words we use, and don't

| Use | Not |
| --- | --- |
| set up | provision, onboard, deploy |
| website | web presence, digital experience |
| we look after it | managed service, maintenance retainer |
| takes the job off your plate | automates the workflow |
| tools for AI agents | agentic infrastructure |
| it's working / it's down | operational / degraded |
| what it costs | investment, pricing structure |
| talk to us | book a discovery call |

### In the interface

- **Labels** name the thing, no colon: `Email`, not `Email:`.
- **Empty states** say what goes here and give the one action that fills it.
  Never just "No data".
- **Errors** say what happened and what to do next. Never an error code alone.
- **Status** is a word beside a colour: `Live`, `Building`, `Down`.
- **Confirmations** name the specific thing: "Website copied", not "Success!".
- **Placeholders** show a real example, not an instruction. `you@yourshop.ca`,
  not `Enter your email`.
- **Charts** label every series in words. A legend of five colours and no words
  is not a chart, it is a puzzle.

---

## 14. Using this system

1. Link `tokens.css` first, before any other stylesheet. Load Sora in the same
   `<head>`, with `display=swap`.
2. Build from the tokens. If you need a value that is not here, the design is
   probably drifting — check before you add one.
3. Pick the archetype before you write the markup. If the answer is "card grid"
   twice in a row, one of them is wrong.
4. Place the light source before you place the content. Every section that has
   ambient light scopes it `absolute` inside itself — never `fixed`.
5. Check both themes and 375px before you call it done, and check the contrast
   *through* the glass, not against the page.
6. Turn on reduced motion and read the whole page. Every number must be there.
7. If you change a colour, change `brand/build.py` and re-run it the same day.
