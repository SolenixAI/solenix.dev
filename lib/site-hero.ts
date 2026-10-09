// The hero frame: the one source of how a page's first screen fits any screen.
// A page opts in with these classes; lib/site-page.ts adds this style when a page uses them.
// The page keeps its own look (colours, visual, words); the frame owns the fit:
//   .sx-hero        the first screen: exactly one screen tall, sized from its own box (container units)
//   .sx-hero-in     the content: one column when tall, two when wide, wider text when very wide and short
//   .sx-hero-text   kicker, headline, one sentence, one action, centred without ever rising under the nav
//   .sx-kicker .sx-sub .sx-cue   the kicker line, the sentence, and the scroll cue
// The contract and the research behind it: design/journeys.md ("First landing") and
// scripts/hero-check.ts, which proves the fit at every real and edge screen size.

export const HERO_CSS = `
.sx-hero{position:relative;box-sizing:border-box;height:100svh;width:100vw;margin-inline:calc(50% - 50vw);--cue-gap:max(6px,1.6svh);
  padding:calc(var(--nav-height) + 1.5svh) max(16px,4vw) calc(var(--tap-min) + 2 * var(--cue-gap));container-type:size}
.sx-hero-in{height:100%;max-width:min(100%,max(230cqh,72ch));margin-inline:auto;display:grid;grid-template-rows:auto minmax(0,1fr);gap:3cqmin}
.sx-hero-in>*{position:relative;z-index:2;min-height:0}
@container (aspect-ratio > 1.15){.sx-hero-in{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr);align-items:safe center}}
@container (aspect-ratio > 1.8){.sx-hero-in{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}}
.sx-hero-text{display:flex;flex-direction:column;justify-content:safe center;gap:clamp(.4rem,2.2cqh,1.4rem)}
.sx-hero-text h1{font-family:var(--font-display);font-size:clamp(1.8rem,min(8cqh,13cqw),7rem);font-weight:700;letter-spacing:-.045em;line-height:.98;margin:0;text-wrap:balance}
@container (aspect-ratio > 1.15){.sx-hero-text h1{font-size:clamp(1.8rem,min(13cqh,7.5cqw),9rem)}}
.sx-kicker{font:600 clamp(.62rem,1.7cqmin,1rem)/1.25 var(--font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--accent-text)}
.sx-sub{font-size:clamp(.92rem,min(3cqh,4.4cqw),1.7rem);line-height:1.5;max-width:34ch;margin:0;color:var(--muted)}
@container (aspect-ratio > 1.8){.sx-sub{max-width:none}}
.sx-cue{position:absolute;right:max(16px,4vw);bottom:var(--cue-gap);min-height:var(--tap-min);display:inline-flex;align-items:center;
  font:600 clamp(.7rem,1.6svh,.95rem)/1 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);text-decoration:none}
.sx-cue:hover{color:var(--text)}
`.trim()

/** Add the hero frame's style to a page that uses it. */
export const withHero = (html: string): string => (/class="[^"]*\bsx-hero\b/.test(html) ? html.replace("</head>", `<style>${HERO_CSS}</style></head>`) : html)
