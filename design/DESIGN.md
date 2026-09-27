# SolenixAI design system

The system behind [solenix.dev](https://solenix.dev). It is not a new brand — it
is the one already live, written down and given the parts it was missing.

**Files**

| File | What it is |
| --- | --- |
| `DESIGN.md` | This document. Principles, tokens, voice. |
| `tokens.css` | The tokens as CSS custom properties. The only place a hex may appear. |
| `index.html` | The showcase. Every token and component, rendered, in both themes. |
| `assets/brand/` | The shipped logo and avatar, copied from `/brand/out/`. |

**What already shipped, and stays**

The palette, the sun gradient and the sun-plus-orbit-plus-dot mark come from
`/assets/site.css` and `/brand/build.py`. Every token name those two files use
survives here unchanged, so `site.css` keeps working if you drop `tokens.css` in
front of it. What this system adds: a written type and space scale, status
colours, a focus contract, motion tokens, a `[data-theme]` override, and the
components the live site did not have yet.

---

## 1. Principles

**1. The sun does the talking.** One mark, one gradient, one accent. Everything
else is a neutral holding the light. If a screen needs a second bright thing to
work, the first one is in the wrong place.

**2. Plain words, plainly set.** Our reader runs a bakery, not a build pipeline.
Copy is short and concrete, and the type is set so the reader never has to
squint, hunt, or guess which thing to click.

**3. Calm surfaces, warm light.** Backgrounds are deep and quiet. Warmth comes
from the ember accent and the orbit glow, never from a gradient wash across the
page. One gradient exists in this brand: the sun.

**4. Show the state.** A small business owner's real question is "is it working
right now?" Every surface that has a state shows it — live, building, down —
with a colour *and* a word. Never colour alone.

**5. Motion at the speed of orbit.** Movement is ambient and slow, or it is a
120ms acknowledgement. Nothing bounces, nothing slides in to be noticed.
`prefers-reduced-motion` turns all of it off, and the page still reads.

**6. Reachable, at any size.** AA contrast in both themes, 44px targets, and a
375px layout that was designed rather than squeezed.

---

## 2. Colour

Light is the default; dark arrives with `prefers-color-scheme` and can be forced
with `data-theme` on `<html>`.

### Surfaces and ink

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#fbfaf8` | `#0b0d12` | Page floor |
| `--bg2` | `#f3f1ed` | `#11141b` | Far corner of the page gradient |
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

The accent appears **twice per screen at most**. On a marketing page that budget
is the eyebrow and the primary button, and it is already spent.

`--accent-text` exists because `--accent` is AA on the page background but not
always on a *tinted* background. Small accent text on a tint uses
`--accent-text`.

### Sun — the logo gradient

`--sun1` `#fbbf24` → `--sun2` `#ea580c` (light) / `#f97316` (dark), with
`--ring` for the orbit stroke and agent dot. This gradient belongs to the mark
and the ambient sky. **It is never a text colour and never a page background.**

### Status

Named states, because "is it working?" is the question our reader actually has.
Each badge carries a dot, a colour and a word — colour alone is not a state.

| Token | Light | Dark | Means |
| --- | --- | --- | --- |
| `--ok` | `#065f46` | `#34d399` | **Live.** Running and reachable. |
| `--warn` | `#9a3412` | `#fbbf24` | **Building.** Work in flight. |
| `--down` | `#b91c1c` | `#fb7185` | **Down.** Not serving. |

Each has an 8% `-tint` companion for the badge fill. "Building" borrows the
ember hue on purpose — work in progress is the sun coming up — and it is the one
sanctioned exception to the accent budget, because it is semantic, not decorative.

### Measured contrast

Computed against the token's normal background — `--bg` for ink and accent,
the 8% tint for status badges. WCAG AA needs 4.5:1 for normal text and 3:1 for
large text and icons.

| Pair | Light | Dark |
| --- | --- | --- |
| `--text` on `--bg` | 16.8:1 | 17.4:1 |
| `--muted` on `--bg` | 7.3:1 | 7.3:1 |
| `--faint` on `--bg` | 4.9:1 | 5.6:1 |
| `--accent` on `--bg` | 5.0:1 | 9.1:1 |
| `--accent-ink` on `--accent` | 5.2:1 | 8.6:1 |
| `--accent-ink` on `--accent-hover` | 7.3:1 | 11.1:1 |
| `--accent-text` on its tint | 6.2:1 | 9.3:1 |
| `--ok` on `--ok-tint` | 6.5:1 | 8.1:1 |
| `--warn` on `--warn-tint` | 6.2:1 | 9.3:1 |
| `--down` on `--down-tint` | 5.4:1 | 6.0:1 |

`--faint` at 4.9:1 is the floor of the system. It is for captions and metadata
only; anything a reader must act on uses `--muted` or darker.

### Rules

- No raw hex outside `tokens.css`.
- Derive tones with `color-mix(in oklch, …)`. Do not add `--accent-300`.
- Colour never carries meaning alone. Pair it with a word or an icon.

---

## 3. Type

**Three roles, two visible faces.**

| Token | Stack | Role |
| --- | --- | --- |
| `--font-display` | brand grotesque (`ui-sans-serif` → system) | Headlines, the lockup |
| `--font-text` | same family | Body, UI, buttons |
| `--font-mono` | `ui-monospace` → `SFMono` → `Menlo` | Eyebrows, labels, numbers, table headers, status, code |

Display and text share one family, worked at two optical sizes and two tracking
settings. That is a deliberate continuation, not an omission: it is how every
live SolenixAI surface is set, and `brand/build.py` bakes the same single stack
into the generated SVG banners, which cannot load a webfont at all. A serif or a
second grotesque would be a different brand and would desynchronise the site
from the banners and the avatar.

Mono is the real second face and it does real work — every eyebrow, label,
number, table header, badge and command on a SolenixAI screen is mono, so two
typefaces are always visible.

*If the brand ever wants a distinct display face, the change belongs in
`build.py` and `tokens.css` on the same day, and the face needs to hold at 84px
in an SVG with no hinting. Until then, one family.*

### Scale

`clamp()` throughout, so 375px and 1920px both land without a media query.

| Token | Value | Tracking | Weight | Use |
| --- | --- | --- | --- | --- |
| `--fs-display` | `clamp(2.4rem, 7.2vw, 4.25rem)` | `-0.035em` | 700 | The one headline that owns a page |
| `--fs-h1` | `clamp(1.9rem, 5vw, 2.6rem)` | `-0.015em` | 700 | Page title |
| `--fs-h2` | `clamp(1.4rem, 3.4vw, 1.75rem)` | `-0.015em` | 650 | Section title |
| `--fs-h3` | `1.2rem` | `-0.015em` | 650 | Card title |
| `--fs-h4` | `1.02rem` | `-0.015em` | 600 | Sub-head, step title |
| `--fs-lede` | `clamp(1.05rem, 2.6vw, 1.25rem)` | `0` | 400 | The sentence under a headline |
| `--fs-body` | `1rem` | `0` | 400 | Prose |
| `--fs-sm` | `0.92rem` | `0` | 400 | Nav, secondary UI |
| `--fs-xs` | `0.8rem` | `0.14em` | 600 | Eyebrows, section labels (mono, caps) |
| `--fs-2xs` | `0.72rem` | `0.12em` | 600 | Badges. **The floor — nothing smaller.** |

Weights: `--fw-regular` 400, `--fw-medium` 500, `--fw-semibold` 600,
`--fw-brand` 650, `--fw-bold` 700. 650 is the lockup weight.

Line height: `--lh-display` 1.04, `--lh-heading` 1.2, `--lh-body` 1.5,
`--lh-relaxed` 1.6.

### Rules

- Tracking tightens as type grows and opens as it shrinks into a label.
- Prose is capped at `--measure` (34rem). Long lines are the most common way to
  make plain words feel hard.
- `text-wrap: balance` on headings, `pretty` on paragraphs. No headline is left
  with one word on the last line.
- Numbers are mono and `tabular-nums`, always, so columns line up.

---

## 4. Space and layout

4px base. Use the steps; do not add any.

| Token | Value | | Token | Value |
| --- | --- | --- | --- | --- |
| `--space-1` | 4px | | `--space-6` | 32px |
| `--space-2` | 8px | | `--space-7` | 48px |
| `--space-3` | 12px | | `--space-8` | 64px |
| `--space-4` | 16px | | `--space-9` | 96px |
| `--space-5` | 24px | | `--space-10` | 128px |

Two of them breathe with the viewport: `--space-section`
`clamp(2.5rem, 8vh, 4.5rem)` and `--space-hero` `clamp(3.5rem, 12vh, 8rem)`.

| Token | Value | Use |
| --- | --- | --- |
| `--container` | `64rem` | Content measure — the live site's width |
| `--measure` | `34rem` | Max line length for prose |
| `--gutter` | 16px, 32px from 640px | Page inset |
| `--nav-height` | 72px | Sticky header |
| `--tap-min` | 44px | Minimum interactive target |

**Breakpoints.** 640px (gutter opens, secondary nav links appear), 720px (two
columns), 900px (three columns). Below 640px the layout is one column, the nav
keeps only what a phone needs, and nothing scrolls sideways. 375px is the
designed floor.

---

## 5. Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-xs` | 8px | Swatch chips |
| `--radius-sm` | 10px | Small controls |
| `--radius-md` | 12px | Inputs, icon chips, code wells |
| `--radius-lg` | 16px | Nested panels |
| `--radius-xl` | 20px | Cards |
| `--radius-2xl` | 28px | Full-bleed panels |
| `--radius-pill` | 999px | Buttons, badges, nav links |

Buttons are pills and cards are 20px. That pairing is the brand's silhouette —
do not square either one off.

---

## 6. Shadow

| Token | Use |
| --- | --- |
| `--shadow-sm` | Hairline lift on a hovered row |
| `--shadow-md` | Cards at rest (`--shadow` is an alias) |
| `--shadow-lg` | Dialogs, the sign-in card, anything floating |
| `--shadow-accent` | The one primary button, and only that |

Two layers each: a 1–2px contact shadow plus a wide soft one. Dark theme uses
black at higher opacity; light theme uses warm ink at low opacity. Shadow
signals height, never decoration.

---

## 7. Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-fast` | 120ms | Colour, border |
| `--dur-base` | 180ms | Lift, shadow |
| `--dur-slow` | 320ms | Panels, disclosure |
| `--dur-reveal` | 700ms | Entrance, once per page |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` | The house curve |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` | Two-way movement |
| `--orbit-1/2/3` | 90s / 140s / 200s | Ambient orbit periods |
| `--lift` | -1px | Button hover |
| `--lift-card` | -3px | Card hover |

`prefers-reduced-motion: reduce` collapses every duration to 1ms and both lifts
to 0. Nothing is load-bearing on animation.

---

## 8. Interaction states

**The rule: foreground and background are defined as a pair, and contrast after
a state change is never lower than at rest.** A hover that greys the text is a
bug in this system.

| Element | Hover | Focus | Active | Disabled |
| --- | --- | --- | --- | --- |
| Primary button | Fill → `--accent-hover`, ink swaps in the same rule, lift `--lift` | Focus ring | Lift released | 45% opacity, `not-allowed` |
| Secondary / ghost | Background → `text 8%`, border → `--line-strong`, **text stays `--text`** | Focus ring | Lift released | 45% opacity |
| Nav link | Background → `--line`, text `--muted` → `--text` | Focus ring | — | — |
| Link | Underline appears, 3px offset, colour holds | Focus ring | — | — |
| Input | Border → `--line-strong` | Border → `--accent` + 2px ring | — | Sunken fill, `--faint` text |
| Table row | Background → `--surface-sunken` | Focus ring | — | — |
| Card | Lift `--lift-card`, border → 35% accent | Focus ring | — | — |

Focus is `2px solid var(--accent)` at `3px` offset, on `:focus-visible`, on
every focusable element. It is applied from `tokens.css` with a `:where()`
selector so it costs no specificity and cannot be lost by accident.

Disabled is the only state allowed to reduce contrast.

---

## 9. The logo

**Sun + one orbit ring + one agent dot.** Built on a 32-unit grid:

- Ring: `r=14`, stroke `--ring` at 45% opacity, 1.5 units wide.
- Sun: `r=8`, filled with the `--sun1` → `--sun2` radial gradient at `42% 38%`.
- Agent dot: `r=2.2` at `27,9` — one agent in orbit, sitting outside the sun,
  breaking the ring.

One ring, one dot. Two dots is a different mark. The dot always breaks the ring
on the upper right; do not move it.

Clearspace is half the mark's width on every side. The lockup pairs the mark
with "SolenixAI" at `--fw-brand` and `-0.01em`, separated by `--space-2`.
Minimum size is 20px, below which the dot stops resolving — use the sun alone.

The generated assets in `/brand/out/` are the source of truth for anything
outside the site. They come from `brand/build.py`, which reads the same values
listed here. **If a colour changes here, change it in `build.py` and re-run it
the same day**, or the site and the GitHub banners drift apart.

---

## 10. Voice

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

**8. Second person, active voice.** "You" and "we". Never "users", never
"the client".

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

---

## 11. Using this system

1. Link `tokens.css` first, before any other stylesheet.
2. Build from the tokens. If you need a value that is not here, the design is
   probably drifting — check before you add one.
3. Check both themes and 375px before you call it done.
4. If you change a colour, change `brand/build.py` and re-run it the same day.
