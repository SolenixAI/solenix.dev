// The Agents Marketplace page's style, served with the page (a style string can't come from the
// browser-side component module: the server would get a reference, not the text).
export const WORLDS_CSS = `
.wd-hero h1 em{font-style:normal;color:var(--accent-text)}
.wd-hero .sx-hero-in>*{min-width:0}
.wd-hero :focus-visible{outline:2px solid var(--accent);outline-offset:3px}
/* A command's flag never splits from its value. */
.wd-nowrap{white-space:nowrap}
.wd-hero h1{font-size:clamp(2.6rem,1.9rem + 3vw,5rem)}

/* The hero's light: one warm source where the sky's sun sits, a 32px hairline grid, and a sparse starfield on the right.
   The mask fades it out before the words, so the text always sits on the dark. The glow breathes; reduced motion stops it. */
.wd-hero::before{--hero-light:73% 50%;content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(closest-side at var(--hero-light),color-mix(in srgb,var(--sun2) 16%,transparent),transparent),
    linear-gradient(to right,color-mix(in srgb,var(--text) 5%,transparent) 1px,transparent 1px) 0 0/32px 32px,
    linear-gradient(to bottom,color-mix(in srgb,var(--text) 5%,transparent) 1px,transparent 1px) 0 0/32px 32px;
  -webkit-mask-image:radial-gradient(closest-side at var(--hero-light),#000 22%,transparent 100%);
          mask-image:radial-gradient(closest-side at var(--hero-light),#000 22%,transparent 100%);
  animation:wd-light 7s ease-in-out infinite alternate}
.wd-hero::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(1px 1px at 61% 14%,rgb(244 242 238/.7),transparent),
    radial-gradient(1px 1px at 84% 9%,rgb(244 242 238/.5),transparent),
    radial-gradient(1.5px 1.5px at 93% 31%,rgb(251 191 36/.8),transparent),
    radial-gradient(1px 1px at 68% 83%,rgb(244 242 238/.55),transparent),
    radial-gradient(1px 1px at 88% 74%,rgb(244 242 238/.45),transparent),
    radial-gradient(1px 1px at 79% 46%,rgb(244 242 238/.35),transparent),
    radial-gradient(1px 1px at 57% 93%,rgb(244 242 238/.4),transparent)}
.wd-hero .sx-cue{z-index:2}

/* Motion starts from what is already on screen and never hides it (a fade-in from dim read as a flash on every visit).
   The copy action answers a press and a copy. Reduced motion keeps every value still. */
@keyframes wd-rise{from{opacity:.4;transform:translate3d(0,14px,0)}to{opacity:1;transform:none}}
@keyframes wd-light{from{opacity:.8}to{opacity:1}}
@keyframes wd-answer{0%{transform:scale(1)}35%{transform:scale(1.04)}100%{transform:scale(1)}}
@keyframes wd-cue{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,4px,0)}}
.wd-hero .wd-action{transition:transform 200ms cubic-bezier(.16,1,.3,1),box-shadow 260ms cubic-bezier(.16,1,.3,1)}
.wd-hero .wd-action:hover{transform:translate3d(0,-1px,0);box-shadow:0 10px 28px -10px color-mix(in srgb,var(--accent) 70%,transparent)}
.wd-hero .wd-action:active{transform:scale(.97)}
.wd-hero .wd-action[data-copied="true"]{animation:wd-answer 520ms cubic-bezier(.16,1,.3,1)}
.wd-hero .wd-ask-status[data-copied="true"]{animation:wd-rise 360ms cubic-bezier(.16,1,.3,1) both}
.wd-hero .sx-cue{animation:wd-cue 2.6s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){
  .wd-hero *,.wd-hero::before,.wd-hero::after{animation:none!important;transition:none!important}
  .wd-hero .wd-action:hover,.wd-hero .wd-action:active{transform:none}
}

/* The one action and its one quiet line. */
.wd-ask{display:grid;justify-items:start;gap:12px;width:min(100%,30rem)}
.wd-ask-status{min-height:1.2em;font:500 .84rem/1.2 var(--font-text);color:var(--accent-text)}
.wd-quiet{margin:0;font:500 .92rem/1.5 var(--font-text);color:var(--muted);text-wrap:pretty}
.wd-quiet a{color:var(--text);text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:3px}
.wd-quiet a:hover{text-decoration-color:var(--accent-text)}
.wd-quiet-toggle{display:inline-flex;align-items:center;min-height:var(--tap-min);margin-left:6px;padding:0 2px;border:0;background:none;cursor:pointer;font:600 .92rem/1 var(--font-text);color:var(--text);text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:3px}
.wd-quiet-toggle:hover{text-decoration-color:var(--accent-text)}
.wd-quiet-toggle[aria-expanded="true"]{color:var(--accent-text)}
.wd-ask-sentence{margin:0;width:min(100%,30rem);box-sizing:border-box;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:var(--surface-solid);font:500 .92rem/1.6 var(--font-text);color:var(--text);overflow-wrap:anywhere;text-wrap:pretty}
.wd-ask-sentence code{padding:1px 6px;border-radius:var(--radius-xs);background:var(--surface-solid);border:1px solid var(--line);font:500 .88em/1.6 var(--font-mono);color:var(--accent-text);overflow-wrap:anywhere}
.wd-ask-wait{pointer-events:none}
.wd-ask-bar-act{width:10rem;height:var(--tap-min)}
.wd-quiet-bar{width:min(100%,22rem);height:.9em;margin-block:.3em}

/* The sky: a square the width of the column, in the reading order after the headline. */
@container heroSky (min-height: 0px){.wd-hero-sky>.sk{width:min(100%,100cqh)}}
@container heroSky (max-height: 159px){.wd-hero-sky>.sk{display:none}}
/* A small sky keeps its names for screen readers only: its name tags would run past the sky's edge and be cut. */
@container heroSky (max-height: 299px) or (max-width: 319px){.wd-hero-sky .sk-tag{left:0;top:0;translate:-50% -50%;width:1px;height:1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}}

/* One column (a phone, or a tablet held upright): the headline, the sky as a square, then the one action under it.
   The hero stays exactly one screen (the hero contract): the sky takes the height left and stays square inside it. */
@media (max-aspect-ratio: 23/20){
  .wd-hero::before{--hero-light:50% 46%}
  .wd-hero .sx-hero-in{display:flex;flex-direction:column;align-items:stretch;gap:clamp(16px,3svh,32px);max-width:34rem}
  .wd-hero-sky{container:heroSky / size;flex:1 1 0;width:100%;min-height:0;display:grid;place-items:center}
  .wd-hero-sky>.sk{max-width:22.5rem}
  @media (max-width: 560px){.wd-hero .wd-ask{width:100%}.wd-hero .wd-action{width:100%}}
  @media (max-width: 340px){.wd-hero h1{font-size:clamp(1.9rem,11vw,2.2rem)}}
}

/* Two columns on a wide screen: the words on the left, the sky on the right, all in one screen. */
@media (min-aspect-ratio: 23/20){
  .wd-hero .sx-hero-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto auto;grid-template-areas:"text sky" "ask sky";align-content:center;align-items:center;column-gap:clamp(24px,4cqw,64px);row-gap:clamp(16px,3cqh,28px);height:100%}
  .wd-hero .sx-hero-text{grid-area:text;align-self:end}
  .wd-hero .wd-ask{grid-area:ask;align-self:start}
  .wd-hero-sky{grid-area:sky;min-height:0;display:grid;place-items:center}
  @media (max-height: 459px){.wd-hero h1{font-size:clamp(1.6rem,6.4cqh,2.6rem)}}
  @media (max-height: 599px){.wd-quiet,.wd-ask-sentence{display:none}}
  @media (max-height: 319px){.wd-ask-status{display:none}}
}
.wd-grid{height:100%;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,19rem),1fr));align-content:safe center;gap:16px;min-height:0}

/* A card is a world seen from afar: its system, its name, one line. */
.wd-card{position:relative;display:grid;grid-template-columns:auto 1fr;grid-template-areas:"glance glance" "name name" "for for";align-items:end;gap:10px 16px;padding:clamp(18px,3cqmin,28px);border-radius:var(--radius-2xl);border:1px solid var(--line);background:radial-gradient(120% 90% at 0% 0%,color-mix(in srgb,var(--sun2) 9%,transparent),transparent 60%),var(--glass-bg);box-shadow:inset 0 1px 0 var(--glass-edge),0 18px 40px -18px rgb(0 0 0/.7);color:var(--text);text-align:left;cursor:pointer;overflow:hidden;transition:transform var(--dur-base) var(--ease-out),border-color var(--dur-base),box-shadow var(--dur-base)}
.wd-card:hover{transform:translateY(-3px);border-color:color-mix(in oklch,var(--accent) 45%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge),0 26px 50px -20px rgb(0 0 0/.75),0 8px 40px -12px color-mix(in srgb,var(--sun2) 30%,transparent)}
.wd-glance{grid-area:glance;display:flex;align-items:center;justify-content:space-between;gap:12px}
.wd-name{grid-area:name;display:flex;align-items:center;gap:10px;font:700 clamp(1.6rem,4.4cqmin,2.6rem)/1 var(--font-display);letter-spacing:-.035em}
.wd-arrow{width:.7em;height:.7em;fill:none;stroke:var(--accent-text);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:transform var(--dur-base) var(--ease-out)}
.wd-card:hover .wd-arrow{transform:translateX(4px)}
.wd-for{grid-area:for;max-width:30ch;color:var(--muted);font-size:clamp(.95rem,2.2cqmin,1.08rem);line-height:1.4;text-wrap:pretty}
.wd-stat{display:flex;flex-direction:column;align-items:flex-end;gap:4px;font:500 .82rem/1 var(--font-mono);font-variant-numeric:tabular-nums;color:var(--muted)}
.wd-stat span{display:inline-flex;align-items:center;gap:6px}
.wd-stat span:first-child{color:var(--text);font-size:.95rem}
.wd-stat .sy-glyph{width:15px;height:15px;color:var(--accent-text)}

/* The system: one sun, one ring, a dot per piece, one agent dot travelling the ring. */
.sy-ring{fill:none;stroke:color-mix(in srgb,var(--text) 18%,transparent);stroke-width:.6;stroke-dasharray:1.4 2.2}
.sy-dot{fill:var(--surface-solid);stroke:color-mix(in srgb,var(--text) 55%,transparent);stroke-width:1.4}
.sy-agent{fill:var(--accent);transform-origin:50px 50px;animation:sy-orbit 90s linear -10s infinite}
@keyframes sy-orbit{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.sy-mini{position:relative;isolation:isolate;display:block;width:clamp(84px,18cqmin,112px);aspect-ratio:1;flex:none}
.sy-mini svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
/* The card's sky: the homepage's sparse starfield in small, fading out round the system. */
.sy-mini::before{content:"";position:absolute;inset:-26%;border-radius:50%;pointer-events:none;background:radial-gradient(1.2px 1.2px at 14% 22%,color-mix(in srgb,var(--text) 85%,transparent),transparent),radial-gradient(1.2px 1.2px at 79% 15%,color-mix(in srgb,var(--text) 70%,transparent),transparent),radial-gradient(1.6px 1.6px at 90% 60%,color-mix(in srgb,var(--sun1) 90%,transparent),transparent),radial-gradient(1.2px 1.2px at 22% 83%,color-mix(in srgb,var(--text) 65%,transparent),transparent),radial-gradient(1.2px 1.2px at 62% 93%,color-mix(in srgb,var(--text) 75%,transparent),transparent),radial-gradient(1px 1px at 6% 52%,color-mix(in srgb,var(--text) 60%,transparent),transparent),radial-gradient(closest-side,color-mix(in srgb,var(--sun2) 14%,transparent),transparent)}
.sy-mini .sy-ring{stroke:color-mix(in srgb,var(--text) 26%,transparent)}
.sy-mini .sy-dot{fill:var(--surface-solid);stroke:color-mix(in srgb,var(--text) 60%,transparent);stroke-width:1.2;filter:drop-shadow(0 0 3px color-mix(in srgb,var(--text) 25%,transparent))}
.sy-mini .sy-agent{filter:drop-shadow(0 0 3px color-mix(in srgb,var(--accent) 85%,transparent))}
.sy-mini-halo{position:absolute;inset:20%;border-radius:50%;border:1px solid color-mix(in srgb,var(--sun1) 34%,transparent)}
.sy-mini-sun{position:absolute;inset:31%;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 35% 30%,var(--sun1),var(--sun2) 72%);box-shadow:0 0 0 3px color-mix(in srgb,var(--sun1) 20%,transparent),0 0 22px color-mix(in srgb,var(--sun2) 70%,transparent),0 0 56px color-mix(in srgb,var(--sun2) 28%,transparent)}
.sy-mini-sun img{width:100%;height:100%;display:block;object-fit:cover}
.sy-wait .sy-ring{animation:sy-breathe 1.6s var(--ease-out) infinite alternate}
@keyframes sy-breathe{from{opacity:.35}to{opacity:1}}

/* Short screens (a phone held sideways): the card keeps its system and name. */
@container (max-height: 460px) or ((max-height: 700px) and (aspect-ratio <= 1.15)){.wd-card{gap:6px 12px;padding:14px 18px}.wd-for{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-size:.9rem}.sy-mini{width:60px}.wd-name{font-size:clamp(1.3rem,5cqh,1.8rem)}.wd-card{grid-template-columns:auto 1fr;grid-template-areas:"glance name" "glance for";align-items:center}.wd-glance .wd-stat{display:none}}
@container (max-height: 460px){.wd-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:10px}.wd-card{grid-template-columns:auto 1fr;grid-template-areas:"glance name" "glance for"}.wd-glance .wd-stat{display:none}}
@container (max-height: 380px){.wd-for{display:none}}
.wd-card:focus-visible,.wd-dialog :focus-visible{outline:2px solid var(--accent);outline-offset:3px}

/* A world, opened. */
/* The top edge stays put from level to level: the dialog hangs from a fixed gap, and a long level scrolls inside it. */
.wd-dialog{--wd-gap:clamp(12px,3vh,32px);box-sizing:border-box;width:min(calc(100% - 24px),64rem);max-height:calc(100dvh - var(--wd-gap) - 12px);margin:var(--wd-gap) auto auto;padding:0;border:1px solid var(--line-strong);border-radius:var(--radius-2xl);background:radial-gradient(90% 60% at 50% 0%,color-mix(in srgb,var(--sun2) 7%,transparent),transparent 70%),var(--surface-solid);color:var(--text);box-shadow:inset 0 1px 0 var(--glass-edge),0 40px 80px -30px rgb(0 0 0/.8);overflow:auto;overscroll-behavior:contain}
.wd-dialog::backdrop{background:color-mix(in srgb,var(--bg) 72%,transparent);backdrop-filter:blur(8px)}
.wd-view{position:relative;display:flex;flex-direction:column;gap:clamp(24px,4vw,40px);padding:clamp(20px,4vw,44px)}
.wd-close{position:absolute;top:clamp(12px,2.4vw,24px);right:clamp(12px,2.4vw,24px);display:grid;place-items:center;width:var(--tap-min);height:var(--tap-min);border-radius:50%;border:1px solid var(--line);background:var(--surface-solid);color:var(--text);cursor:pointer;z-index:1}
.wd-close:hover{border-color:var(--line-strong)}
.wd-close svg{width:16px;height:16px}
.wd-top{display:grid;gap:12px}
.wd-big{margin:0;padding-right:56px;font:700 clamp(2.2rem,6vw,3.75rem)/1 var(--font-display);letter-spacing:-.04em}
.wd-lede{margin:0;max-width:44rem;font-size:clamp(1.05rem,2.4vw,1.25rem);color:var(--muted);text-wrap:pretty}
.wd-copy{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px 20px;margin-top:8px;padding:20px 20px 20px 24px;border-radius:var(--radius-xl);background:var(--bg);border:1px solid var(--line);box-shadow:inset 0 2px 12px rgb(0 0 0/.35)}
.wd-outcome{flex:1 1 22rem;max-width:62ch;margin:0;font:500 clamp(1rem,2.2vw,1.125rem)/1.6 var(--font-text);color:var(--text);overflow-wrap:break-word;text-wrap:pretty}
.wd-run{flex:1 1 100%;margin:0}
.wd-run summary{display:inline-flex;align-items:center;gap:8px;min-height:var(--tap-min);cursor:pointer;font:600 .86rem/1 var(--font-text);color:var(--muted);list-style:none}
.wd-run summary::-webkit-details-marker{display:none}
.wd-run summary::after{content:"";width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;rotate:45deg;transition:rotate var(--dur-base) var(--ease-out)}
.wd-run[open] summary::after{rotate:225deg}
.wd-run summary:hover{color:var(--text)}
.wd-run summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:var(--radius-pill)}
.wd-run-text{margin:8px 0 0;padding:14px 16px;border-radius:var(--radius-lg);background:var(--surface-solid);border:1px solid var(--line);font:500 .95rem/1.7 var(--font-text);color:var(--text);overflow-wrap:anywhere;text-wrap:pretty}
.wd-copy code{padding:2px 8px;border-radius:var(--radius-xs);background:var(--surface-solid);border:1px solid var(--line);font:500 .86em/1.7 var(--font-mono);font-variant-ligatures:none;color:var(--accent-text);-webkit-box-decoration-break:clone;box-decoration-break:clone}
.wd-tok{white-space:nowrap}
@media (max-width:560px){.wd-copy .wd-action{flex:1 1 100%}}
.wd-action{flex:none;min-height:var(--tap-min);padding:0 24px;border:0;border-radius:var(--radius-pill);background:var(--accent);color:var(--accent-ink);font:650 var(--fs-sm)/1 var(--font-text);cursor:pointer;box-shadow:0 8px 24px -10px color-mix(in srgb,var(--accent) 70%,transparent);transition:background var(--dur-base),transform var(--dur-base) var(--ease-out)}
.wd-action:hover{background:var(--accent-hover);transform:translateY(-1px)}
.wd-copy .wd-action{min-width:15.5rem}
@media (max-width:560px){.wd-copy .wd-action{min-width:0}}
.wd-copy .wd-copy-note{flex:1 1 100%;margin:0;font:500 .9rem/1.4 var(--font-text);color:var(--accent-text);text-wrap:pretty}
/* A phone, once the inline action has scrolled off: a sticky copy bar in the thumb's reach. Hidden everywhere else. */
.wd-pin{display:none}
@media (max-width:639px){.wd-pin{display:block;position:sticky;bottom:12px;z-index:2;padding:6px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);background:var(--glass-bg);box-shadow:inset 0 1px 0 var(--glass-edge),0 18px 40px -16px rgb(0 0 0/.85)}.wd-pin .wd-action{display:block;width:100%}}

.sy{display:grid;grid-template-columns:minmax(0,22rem) minmax(0,1fr);gap:clamp(20px,4vw,48px);align-items:start}
@media (max-width: 760px){.sy{grid-template-columns:1fr}}
.sy-map{position:relative;display:block;width:100%;max-width:22rem;aspect-ratio:1;margin-inline:auto}
.sy-art,.sy-map>svg{position:absolute;inset:0;width:100%;height:100%}
.sy-body{position:absolute;display:flex;flex-direction:column;align-items:center;gap:6px;translate:-50% -28px;padding:0;border:0;background:none;color:var(--text);cursor:pointer;-webkit-tap-highlight-color:transparent}
.sy-sun{translate:-50% -50%}
.sy-orb{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:var(--bg);border:1px solid var(--line-strong);box-shadow:inset 0 1px 0 var(--glass-edge),0 8px 20px -8px rgb(0 0 0/.8);color:var(--muted);overflow:hidden;transition:box-shadow var(--dur-base) var(--ease-out),border-color var(--dur-base),color var(--dur-base),transform var(--dur-base) var(--ease-out)}
.sy-sun .sy-orb{width:88px;height:88px;border:0;background:radial-gradient(circle at 35% 30%,var(--sun1),var(--sun2));box-shadow:0 0 0 3px color-mix(in srgb,var(--sun1) 30%,transparent),0 0 48px color-mix(in srgb,var(--sun2) 55%,transparent)}
.sy-sun .sy-label{display:none}
.sy-face{width:100%;height:100%;object-fit:cover;display:block}
.sy-icon{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.sy-label{display:flex;flex-direction:column;align-items:center;gap:2px;font:600 .8rem/1.1 var(--font-text);white-space:nowrap;text-shadow:0 1px 8px var(--surface-solid)}
.sy-label small{font:500 .72rem/1 var(--font-mono);font-variant-numeric:tabular-nums;color:var(--muted)}
.sy-body:hover .sy-orb{transform:translateY(-2px);border-color:color-mix(in oklch,var(--accent) 50%,transparent);color:var(--text)}
.sy-body[aria-checked=true] .sy-orb{border-color:var(--accent);color:var(--accent-text);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 22%,transparent),0 0 28px color-mix(in srgb,var(--accent) 40%,transparent)}
.sy-sun[aria-checked=true] .sy-orb{box-shadow:0 0 0 4px var(--accent),0 0 64px color-mix(in srgb,var(--sun2) 70%,transparent)}
.sy-body[aria-checked=true] .sy-label{color:var(--accent-text)}
.sy-body:focus-visible{outline:none}
.sy-body:focus-visible .sy-orb{outline:2px solid var(--accent);outline-offset:3px}

/* The sub-world: one body, everything its own source says, and where to check it. */
.sy-world{display:flex;flex-direction:column;gap:16px;min-width:0;padding:clamp(18px,3vw,28px);border-radius:var(--radius-xl);border:1px solid var(--line);background:color-mix(in srgb,var(--bg) 55%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge)}
.sy-world-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.sy-world-head h3{min-width:0;margin:0;font:700 clamp(1.4rem,3vw,1.9rem)/1.05 var(--font-display);letter-spacing:-.03em;overflow-wrap:anywhere;hyphens:manual}
/* A level's heading takes focus on a drill-down: no ring for a mouse, a ring for the keyboard. */
.sy-world-head h3:focus{outline:none}
.sy-world-head h3:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:6px}
.sy-orb-sm{width:40px;height:40px;flex:none}
.sy-orb-sm .sy-icon{width:20px;height:20px}
.sy-ver{margin-left:auto;white-space:nowrap;padding:5px 10px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);font:500 .78rem/1 var(--font-mono);color:var(--muted)}
.sy-slug{align-self:flex-start;font:500 .85rem/1 var(--font-mono);color:var(--accent-text);text-decoration:none}
.sy-slug:hover{text-decoration:underline;text-underline-offset:3px}
.sy-blurb{margin:0;font-size:1rem;line-height:1.5;color:var(--text);text-wrap:pretty;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.sy-stats{display:flex;flex-wrap:wrap;gap:8px 18px;margin:0;padding:0;list-style:none;font:500 .9rem/1 var(--font-mono);font-variant-numeric:tabular-nums}
.sy-stats li{display:inline-flex;align-items:center;gap:6px}
.sy-stats span{color:var(--muted);font-family:var(--font-text);font-size:.85rem}
.sy-glyph{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.sy-stats .sy-glyph{color:var(--accent-text)}
.sy-inside{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.sy-inside li{display:inline-flex;align-items:baseline;gap:6px;padding:10px 14px;border-radius:var(--radius-lg);background:var(--surface-solid);border:1px solid var(--line);font-size:.9rem;color:var(--muted)}
.sy-inside b{font:700 1.35rem/1 var(--font-display);font-variant-numeric:tabular-nums;color:var(--text)}
.sy-inside .sy-glyph{align-self:center;color:var(--accent-text)}
.sy-works{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0;font-size:.85rem;color:var(--muted)}
.sy-works span{margin-right:4px}
.sy-works i{font-style:normal;padding:4px 10px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);color:var(--text)}
.sy-items{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.sy-items code{display:inline-block;padding:5px 9px;border-radius:var(--radius-xs);background:var(--surface-solid);border:1px solid var(--line);font:500 .78rem/1.2 var(--font-mono);color:var(--text)}
.sy-items button{min-height:28px;padding:0 10px;border-radius:var(--radius-pill);border:1px dashed var(--line-strong);background:none;color:var(--accent-text);font:500 .78rem/1 var(--font-mono);cursor:pointer}
.sy-refs{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 0;padding:16px 0 0;border-top:1px solid var(--line);list-style:none}
.sy-refs a{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 14px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);color:var(--text);font-size:.85rem;text-decoration:none;transition:border-color var(--dur-base)}
.sy-refs a:hover{border-color:var(--accent)}
.sy-refs .sy-glyph{width:13px;height:13px;color:var(--muted)}


/* How it works: three moves on one path. */
.wd-steps{--wd-gap:clamp(16px,3vw,40px);position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--wd-gap);margin:0;padding:0;list-style:none;counter-reset:s}
.wd-steps li:not(:last-child)::after{content:"";position:absolute;top:22px;left:56px;right:calc(-1 * var(--wd-gap) - 22px);border-top:1px dashed color-mix(in srgb,var(--text) 22%,transparent);pointer-events:none}
.wd-steps li{position:relative;display:grid;align-content:start;gap:8px;counter-increment:s}
.wd-step-orb{position:relative;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--bg);border:1px solid var(--line-strong);color:var(--accent-text);box-shadow:0 0 0 6px var(--bg),0 12px 26px -10px color-mix(in srgb,var(--accent) 45%,transparent)}
.wd-step-orb::before{content:"";position:absolute;inset:-10px;border-radius:50%;border:1px dashed color-mix(in srgb,var(--text) 18%,transparent);pointer-events:none}
.wd-steps li:first-child .wd-step-orb{border-color:color-mix(in srgb,var(--sun1) 60%,transparent);box-shadow:0 0 0 6px var(--bg),0 14px 30px -10px color-mix(in srgb,var(--sun1) 70%,transparent)}
.wd-step-orb svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.wd-steps b{font:700 clamp(1.4rem,3vw,1.9rem)/1 var(--font-display);letter-spacing:-.03em}
.wd-steps li>span:not(.wd-step-orb){max-width:34ch;color:var(--muted);font-size:.95rem;line-height:1.45;text-wrap:pretty}
@media (max-width: 560px){.wd-steps{grid-template-columns:1fr}.wd-steps li:not(:last-child)::after{top:56px;bottom:calc(-1 * var(--wd-gap) - 22px);left:22px;right:auto;width:0;border-top:0;border-left:1px dashed color-mix(in srgb,var(--text) 22%,transparent)}.wd-steps li{grid-template-columns:44px 1fr;column-gap:16px}.wd-step-orb{grid-row:span 2}}
.wd-say{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:16px 32px;margin-top:clamp(28px,4vw,40px);padding:clamp(18px,2.6vw,26px) clamp(18px,2.8vw,30px);border-radius:var(--radius-xl);border:1px solid var(--line);background:var(--glass-bg);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-md)}
.wd-say-text{margin:0;max-width:62ch;font:500 1.02rem/1.55 var(--font-text);color:var(--text);overflow-wrap:anywhere;text-wrap:pretty}
.wd-say-text code{padding:1px 6px;border-radius:var(--radius-xs);background:var(--surface-solid);border:1px solid var(--line);font:500 .88em/1.6 var(--font-mono);color:var(--accent-text);overflow-wrap:anywhere}
.wd-say-copy{justify-self:start;display:inline-flex;align-items:center;gap:8px;min-height:var(--tap-min);padding:0 20px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);background:none;color:var(--text);font:600 var(--fs-sm)/1 var(--font-text);cursor:pointer;transition:border-color var(--dur-base),box-shadow var(--dur-base),transform var(--dur-base) var(--ease-out)}
.wd-say-copy svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.wd-say-copy:hover{border-color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 16%,transparent);transform:translateY(-1px)}
.wd-say-copy:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.wd-say-copy[data-state=copied]{border-color:var(--accent);color:var(--accent-text)}
.wd-say-bar-act{width:11rem;height:var(--tap-min)}
.wd-say-more{grid-column:1/-1;margin:0}
.wd-say-more summary{display:inline-flex;align-items:center;gap:10px;min-height:var(--tap-min);cursor:pointer;font:600 var(--fs-sm)/1 var(--font-text);color:var(--muted);list-style:none;border-radius:var(--radius-xs)}
.wd-say-more summary::-webkit-details-marker{display:none}
.wd-say-more summary::before{content:"";width:6px;height:6px;border-right:1.6px solid currentColor;border-bottom:1.6px solid currentColor;transform:translateY(-2px) rotate(45deg);transition:transform var(--dur-base) var(--ease-out)}
.wd-say-more[open] summary::before{transform:translateY(2px) rotate(-135deg)}
.wd-say-more summary:hover{color:var(--text);text-decoration:underline;text-underline-offset:3px}
.wd-say-more summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.wd-say-raw{margin:10px 0 0;max-width:62ch;font:500 .92rem/1.6 var(--font-text);color:var(--muted);overflow-wrap:anywhere;text-wrap:pretty}
.wd-say-raw code{padding:1px 6px;border-radius:var(--radius-xs);background:var(--surface-solid);border:1px solid var(--line);font:500 .88em/1.6 var(--font-mono);color:var(--accent-text);overflow-wrap:anywhere}
.wd-ask-wait .wd-say-text{min-height:calc(1.55em*2)}
@media (max-width: 560px){.wd-say{grid-template-columns:minmax(0,1fr)}.wd-say-copy{justify-self:stretch;width:100%;justify-content:center}.wd-ask-wait .wd-say-text{min-height:calc(1.55em*4)}}

/* A world is open: the page behind it stays put. */
html:has(.wd-dialog[open]){overflow:hidden}

/* Where you are, and the way back out. */
.sy-crumbs{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:4px;font:500 .85rem/1 var(--font-text);color:var(--muted)}
.sy-crumbs>*+*::before{content:"";display:inline-block;width:6px;height:6px;margin:0 10px 1px 4px;border-right:1.5px solid var(--faint);border-top:1.5px solid var(--faint);rotate:45deg}
.sy-crumbs button{min-height:36px;padding:0 10px;border-radius:var(--radius-pill);border:1px solid var(--line);background:none;color:var(--text);font:inherit;cursor:pointer}
.sy-crumbs button:hover{border-color:var(--accent)}
.sy-crumbs [aria-current]{padding:0 4px;color:var(--accent-text);font-weight:600}
.sy-stage{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,22rem) minmax(0,1fr);gap:clamp(20px,4vw,48px);align-items:start;view-transition-name:sy-stage}
@media (max-width: 760px){.sy-stage{grid-template-columns:1fr}}
.sy-sun{cursor:default}
/* Arrived at a part: one large warm orb holds its icon at a readable size; the piece it belongs to rides the ring. */
.sy-map-part .sy-sun .sy-orb{width:136px;height:136px}
.sy-map-part .sy-sun .sy-icon{width:56px;height:56px;stroke-width:1.2;color:var(--accent-ink)}
.sy-dot-body .sy-orb{width:18px;height:18px;border-width:1px;box-shadow:none}
.sy-dot-body .sy-icon{display:none}
.sy-dot-body,.sy-quiet-body{translate:-50% -50%}
.sy-quiet-body .sy-orb{width:34px;height:34px}
.sy-quiet-body .sy-icon{width:16px;height:16px}
.sy-dot-body:hover .sy-orb,.sy-dot-body:focus-visible .sy-orb{background:var(--accent);border-color:var(--accent)}
.sy-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
/* A planet too small to label shows its name while it is hovered or focused; the name stays in the list too. */
.sy-dot-body:hover,.sy-dot-body:focus-visible,.sy-quiet-body:hover,.sy-quiet-body:focus-visible{z-index:4}
.sy-dot-body:hover .sy-sr,.sy-dot-body:focus-visible .sy-sr,.sy-quiet-body:hover .sy-sr,.sy-quiet-body:focus-visible .sy-sr{width:auto;height:auto;overflow:visible;clip-path:none;left:50%;bottom:calc(100% + 8px);translate:-50% 0;padding:5px 10px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);background:var(--surface-solid);box-shadow:0 12px 24px -12px rgb(0 0 0/.9);font:600 .8rem/1.2 var(--font-text);color:var(--text);pointer-events:none}
/* What it does for you: one plain line, its number first to the eye. */
.sy-gives{margin:0;font:600 clamp(1.15rem,2.6vw,1.45rem)/1.3 var(--font-display);letter-spacing:-.02em;text-wrap:balance}
.sy-gives b{color:var(--accent-text);font-variant-numeric:tabular-nums}
.sy-part-blurb{margin:0;font-size:1.05rem;line-height:1.55;text-wrap:pretty}
.sy-group{display:grid;gap:8px}
.sy-group-head{display:flex;align-items:center;gap:8px;margin:0;font-size:.9rem;color:var(--muted)}
.sy-group-head b{font:700 1.2rem/1 var(--font-display);color:var(--text)}
.sy-group-head .sy-icon{width:18px;height:18px;color:var(--accent-text)}
.sy-items button{min-height:32px;padding:0 12px;border-radius:var(--radius-pill);border:1px solid var(--line);background:var(--surface-solid);color:var(--text);font:500 .8rem/1 var(--font-mono);cursor:pointer;transition:border-color var(--dur-base)}
.sy-items button:hover{border-color:var(--accent)}

/* The dive: the old level flies past you toward where you clicked; the new one grows out of it. */
::view-transition-old(sy-stage),::view-transition-new(sy-stage){transform-origin:var(--dive-x,50%) var(--dive-y,50%);animation-duration:900ms;animation-timing-function:cubic-bezier(.16,1,.3,1)}
html:active-view-transition-type(dive-in)::view-transition-old(sy-stage){animation-name:sy-past}
html:active-view-transition-type(dive-in)::view-transition-new(sy-stage){animation-name:sy-grow}
html:active-view-transition-type(dive-out)::view-transition-old(sy-stage){animation-name:sy-shrink}
html:active-view-transition-type(dive-out)::view-transition-new(sy-stage){animation-name:sy-return}
@keyframes sy-past{to{transform:perspective(900px) translateZ(700px);opacity:0;filter:blur(10px)}}
@keyframes sy-grow{from{transform:perspective(900px) translateZ(-1400px);opacity:0;filter:blur(6px)}}
@keyframes sy-shrink{to{transform:perspective(900px) translateZ(-1400px);opacity:0;filter:blur(6px)}}
@keyframes sy-return{from{transform:perspective(900px) translateZ(700px);opacity:0;filter:blur(10px)}}

/* The sky: the whole marketplace as one system. Each label is one tag beside the body it names: a planet's tag
   sits outside the orbit line, on the side away from the sun; the sun's tag sits under it. Nothing is laid over a
   logo, the sun, the ring or the agent. A planet's pieces ride one arc on the sun's side of it. */
.sk{position:relative;width:min(100%,34rem,62cqh);aspect-ratio:1;margin:auto;align-self:center;overflow-x:clip}
.sk-art{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.sk-moons{position:absolute;inset:0;pointer-events:none}
.sk-sun{position:absolute;left:50%;top:50%;width:16%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--sun1),var(--sun2));box-shadow:0 0 0 6px color-mix(in srgb,var(--sun1) 14%,transparent),0 0 90px color-mix(in srgb,var(--sun2) 60%,transparent);color:var(--text);text-decoration:none;transition:scale var(--dur-base) var(--ease-out),box-shadow var(--dur-base)}
.sk-halo{position:absolute;inset:-40%;border-radius:50%;border:1px solid color-mix(in srgb,var(--sun1) 35%,transparent)}
a.sk-sun:hover,a.sk-sun:focus-visible{outline:none;scale:1.06;box-shadow:0 0 0 8px color-mix(in srgb,var(--sun1) 26%,transparent),0 0 120px color-mix(in srgb,var(--sun2) 75%,transparent)}
.sk-body{position:absolute;width:0;height:0;color:var(--text);text-decoration:none;--pr:clamp(28px,5.5cqmin,38px)}
.sk-body:focus-visible{outline:none}
.sk-orb{position:absolute;left:0;top:0;translate:-50% -50%;display:grid;place-items:center;width:clamp(56px,11cqmin,76px);aspect-ratio:1;border-radius:50%;background:var(--bg);border:1px solid var(--line-strong);box-shadow:inset 0 1px 0 var(--glass-edge),0 10px 24px -10px rgb(0 0 0/.9);color:var(--muted);overflow:hidden;transition:transform var(--dur-base) var(--ease-out),border-color var(--dur-base),box-shadow var(--dur-base)}
.sk-orb img{width:100%;height:100%;border-radius:50%;object-fit:cover}
.sk-moon{position:absolute;display:grid;place-items:center;width:24px;height:24px;translate:-50% -50%;border-radius:50%;background:var(--surface-solid);border:1px solid var(--line-strong);color:var(--muted)}
.sk-moon .sy-icon{width:13px;height:13px}
.sk-tag{position:absolute;left:calc(var(--ux,0) * (var(--pr) + 22px));top:calc(var(--uy,0) * (var(--pr) + 22px));display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:8px 13px 8px 12px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);background:var(--surface-solid);box-shadow:inset 0 1px 0 var(--glass-edge),0 12px 24px -14px rgb(0 0 0/.9);white-space:nowrap;text-align:left;transition:border-color var(--dur-base)}
.sk-tag-r{translate:0 -50%}
.sk-tag-l{translate:-100% -50%;align-items:flex-end;text-align:right}
.sk-tag-t{translate:-50% -100%;align-items:center;text-align:center}
.sk-tag-b{translate:-50% 0;align-items:center;text-align:center}
.sk-tag-sun{left:50%;top:calc(140% + 12px);translate:-50% 0;align-items:center;text-align:center}
.sk-name{display:flex;align-items:center;gap:7px;font:650 .98rem/1.15 var(--font-display);letter-spacing:-.01em;color:var(--text)}
.sk-name::before{content:"";flex:none;width:6px;height:6px;border-radius:50%;background:var(--sun1)}
.sk-tag-l .sk-name{flex-direction:row-reverse}
.sk-num{font:500 .75rem/1 var(--font-mono);font-variant-numeric:tabular-nums;letter-spacing:.02em;color:var(--muted)}
.sk-body:hover .sk-orb,.sk-body:focus-visible .sk-orb{transform:translateY(-2px);border-color:color-mix(in oklch,var(--accent) 50%,transparent)}
.sk-body:hover .sk-tag,.sk-body:focus-visible .sk-tag,a.sk-sun:focus-visible .sk-tag-sun{border-color:color-mix(in oklch,var(--accent) 55%,transparent)}
.sk-body:focus-visible .sk-orb,.sk-body:focus-visible .sk-tag,a.sk-sun:focus-visible .sk-tag-sun{outline:2px solid var(--accent);outline-offset:3px}
.sk-wait .sy-ring{animation:sy-breathe 1.6s var(--ease-out) infinite alternate}

/* The close: one statement, the reason to read a setup before it is pasted, and two ways on. It sits on the ground with
   one orbit (the mark's ring and agent dot), not in a glass row like the sentence above it. */
.wd-open-band{position:relative;isolation:isolate;display:grid;gap:clamp(24px,3.2vw,36px);padding-block:clamp(4px,1vw,8px) clamp(8px,2vw,16px)}
.wd-open-copy,.wd-open-actions{position:relative;z-index:1}
.wd-open-copy{display:grid;gap:clamp(14px,2vw,20px);max-width:40rem}
.wd-open-title{margin:0;font:650 clamp(2.2rem,1.7rem + 2.2vw,3.75rem)/1.04 var(--font-display);letter-spacing:-.03em;text-wrap:balance}
.wd-open-title em{font-style:normal;color:var(--accent-text)}
.wd-open-lede{margin:0;max-width:34rem;font:400 clamp(1.05rem,2.6vw,1.25rem)/1.5 var(--font-text);color:var(--muted);text-wrap:pretty}
.wd-open-built{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px}
.wd-open-label{font:600 var(--fs-sm)/1 var(--font-text);color:var(--muted)}
.wd-specs{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.wd-specs a{display:inline-flex;align-items:center;gap:8px;min-height:var(--tap-min);padding:0 14px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);color:var(--text);font-size:.9rem;text-decoration:none;transition:border-color var(--dur-base)}
.wd-specs a:hover{border-color:var(--accent)}
.wd-specs .sy-icon{width:18px;height:18px;color:var(--accent-text)}
.wd-open-band .wd-specs-hold{min-height:var(--tap-min)}
.wd-open-actions{display:flex;flex-wrap:wrap;align-items:center;gap:14px 26px}
.wd-pill{display:inline-flex;align-items:center;gap:10px;min-height:var(--tap-min);padding:0 22px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);color:var(--text);font:600 var(--fs-sm)/1 var(--font-text);text-decoration:none;transition:border-color var(--dur-base),transform var(--dur-base) var(--ease-out)}
.wd-pill:hover{border-color:var(--accent);transform:translateY(-1px)}
.wd-open-link{display:inline-flex;align-items:center;min-height:var(--tap-min);color:var(--accent-text);font:600 var(--fs-sm)/1 var(--font-text);text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--accent) 45%,transparent);text-underline-offset:6px;transition:text-decoration-color var(--dur-base)}
.wd-open-link:hover{text-decoration-color:var(--accent)}
.wd-gh-icon{width:18px;height:18px;flex:none}
.wd-open-orbit{position:absolute;right:-4%;top:50%;width:min(30vw,22rem);aspect-ratio:1;translate:0 -50%;border-radius:50%;border:1px solid var(--line-strong);pointer-events:none;animation:wd-open-spin 140s linear infinite}
.wd-open-orbit::before{content:"";position:absolute;inset:22%;border-radius:50%;border:1px dashed var(--line)}
.wd-open-orbit i{position:absolute;top:-6px;left:50%;width:11px;height:11px;margin-left:-5.5px;border-radius:50%;background:var(--accent);box-shadow:0 6px 16px -4px color-mix(in srgb,var(--accent) 70%,transparent)}
@keyframes wd-open-spin{to{rotate:360deg}}
@media (max-width:1079px){.wd-open-orbit{display:none}}
@media (max-width:639px){.wd-open-band .wd-specs-hold{min-height:6rem}}
@media (prefers-reduced-motion:reduce){.wd-open-orbit{animation:none}}

/* The worlds, listed: each card is one world seen from afar (its name, its line, its system, what it is made of),
   and its one action, copying the sentence for your AI, sits beside the link so that both work from the keyboard. */
.wd-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:16px}
.wd-list-title{margin:0 0 clamp(20px,3vw,32px)}
.wd-cell{position:relative;display:flex;flex-direction:column;min-width:0}
.wd-cell>.wd-card{flex:1;border-radius:var(--radius-xl)}
.wd-list .wd-card{grid-template-columns:minmax(0,1fr);grid-template-areas:"top" "glance" "foot";align-items:start;gap:14px}
.wd-list .wd-card::after{content:"";grid-area:foot;height:var(--tap-min)}
.wd-card-top{grid-area:top;display:flex;align-items:center;justify-content:space-between;gap:18px;min-width:0}
.wd-card-text{display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-width:0}
.wd-card-top .wd-name{min-width:0;margin:0;font:700 clamp(1.6rem,3.6svmin,2.3rem)/1.02 var(--font-display);letter-spacing:-.035em;overflow-wrap:anywhere}
.wd-card-top .sy-mini{width:clamp(92px,26svmin,136px)}
.wd-cell:hover .wd-card{transform:translateY(-3px);border-color:color-mix(in oklch,var(--accent) 45%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge),0 26px 50px -20px rgb(0 0 0/.75),0 8px 40px -12px color-mix(in srgb,var(--sun2) 30%,transparent)}
.wd-card-copy{position:absolute;left:clamp(18px,3cqmin,28px);bottom:clamp(18px,3cqmin,28px);z-index:1;display:inline-flex;align-items:center;gap:8px;min-height:var(--tap-min);padding:0 18px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);background:none;color:var(--text);font:600 var(--fs-sm)/1 var(--font-text);cursor:pointer;transition:background var(--dur-base),border-color var(--dur-base),transform var(--dur-base) var(--ease-out),box-shadow var(--dur-base)}
.wd-card-copy svg{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.wd-card-copy:hover{border-color:var(--accent);background:var(--accent-quiet);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 16%,transparent)}
.wd-cell:hover .wd-card-copy{transform:translateY(-3px)}
.wd-card-copy:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.wd-card-copy[data-state=copied]{border-color:var(--accent);background:var(--accent-quiet);color:var(--accent-text)}
.wd-chips{grid-area:glance;display:flex;flex-wrap:wrap;gap:6px}
.wd-chips span{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:var(--radius-pill);border:1px solid var(--line);font:500 .78rem/1 var(--font-mono);font-variant-numeric:tabular-nums;color:var(--muted)}
.wd-chips .sy-icon{width:14px;height:14px;color:var(--accent-text)}
@media (prefers-reduced-motion: reduce){.sk-wait .sy-ring{animation:none}}

@media (prefers-reduced-motion: reduce){.sy-agent,.sy-wait .sy-ring,.sy-world{animation:none}}
`
