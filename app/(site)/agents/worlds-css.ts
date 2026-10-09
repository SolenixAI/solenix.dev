// The Agents Marketplace page's style, served with the page (a style string can't come from the
// browser-side component module: the server would get a reference, not the text).
export const WORLDS_CSS = `
.wd-hero h1 em{font-style:normal;color:var(--accent-text)}
.wd-hero .sx-hero-in>*{min-width:0}
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
.sy-mini{position:relative;display:block;width:clamp(84px,18cqmin,112px);aspect-ratio:1;flex:none}
.sy-mini svg{position:absolute;inset:0;width:100%;height:100%}
.sy-mini-sun{position:absolute;inset:27%;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 35% 30%,var(--sun1),var(--sun2));box-shadow:0 0 0 2px color-mix(in srgb,var(--sun1) 40%,transparent),0 0 28px color-mix(in srgb,var(--sun2) 55%,transparent)}
.sy-mini-sun img{width:100%;height:100%;display:block;object-fit:cover}
.sy-wait .sy-ring{animation:sy-breathe 1.6s var(--ease-out) infinite alternate}
@keyframes sy-breathe{from{opacity:.35}to{opacity:1}}

/* Short screens (a phone held sideways): the card keeps its system and name. */
@container (max-height: 460px) or ((max-height: 700px) and (aspect-ratio <= 1.15)){.wd-card{gap:6px 12px;padding:14px 18px}.wd-for{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-size:.9rem}.sy-mini{width:60px}.wd-name{font-size:clamp(1.3rem,5cqh,1.8rem)}.wd-card{grid-template-columns:auto 1fr;grid-template-areas:"glance name" "glance for";align-items:center}.wd-glance .wd-stat{display:none}}
@container (max-height: 460px){.wd-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:10px}.wd-card{grid-template-columns:auto 1fr;grid-template-areas:"glance name" "glance for"}.wd-glance .wd-stat{display:none}}
@container (max-height: 380px){.wd-for{display:none}}
.wd-card:focus-visible,.wd-dialog :focus-visible{outline:2px solid var(--accent);outline-offset:3px}

/* A world, opened. */
.wd-dialog{box-sizing:border-box;width:min(calc(100% - 24px),64rem);max-height:calc(100dvh - 24px);margin:auto;padding:0;border:1px solid var(--line-strong);border-radius:var(--radius-2xl);background:radial-gradient(90% 60% at 50% 0%,color-mix(in srgb,var(--sun2) 7%,transparent),transparent 70%),var(--surface-solid);color:var(--text);box-shadow:inset 0 1px 0 var(--glass-edge),0 40px 80px -30px rgb(0 0 0/.8);overflow:auto;overscroll-behavior:contain}
.wd-dialog::backdrop{background:color-mix(in srgb,var(--bg) 72%,transparent);backdrop-filter:blur(8px)}
.wd-view{position:relative;display:flex;flex-direction:column;gap:clamp(24px,4vw,40px);padding:clamp(20px,4vw,44px)}
.wd-close{position:absolute;top:clamp(12px,2.4vw,24px);right:clamp(12px,2.4vw,24px);display:grid;place-items:center;width:var(--tap-min);height:var(--tap-min);border-radius:50%;border:1px solid var(--line);background:var(--surface-solid);color:var(--text);cursor:pointer;z-index:1}
.wd-close:hover{border-color:var(--line-strong)}
.wd-close svg{width:16px;height:16px}
.wd-top{display:grid;gap:12px;max-width:44rem}
.wd-big{margin:0;padding-right:56px;font:700 clamp(2.2rem,6vw,3.75rem)/1 var(--font-display);letter-spacing:-.04em}
.wd-lede{margin:0;font-size:clamp(1.05rem,2.4vw,1.25rem);color:var(--muted);text-wrap:pretty}
.wd-copy{display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;margin-top:8px;padding:16px 16px 16px 20px;border-radius:var(--radius-xl);background:var(--bg);border:1px solid var(--line);box-shadow:inset 0 2px 12px rgb(0 0 0/.35)}
.wd-copy p{flex:1 1 22rem;margin:0;font:500 clamp(.9rem,2vw,1rem)/1.55 var(--font-text);overflow-wrap:anywhere}
.wd-copy code{padding:2px 6px;border-radius:var(--radius-xs);background:var(--surface-solid);border:1px solid var(--line);font:500 .9em/1.6 var(--font-mono);color:var(--accent-text)}
.wd-action{flex:none;min-height:var(--tap-min);padding:0 24px;border:0;border-radius:var(--radius-pill);background:var(--accent);color:var(--accent-ink);font:650 var(--fs-sm)/1 var(--font-text);cursor:pointer;box-shadow:0 8px 24px -10px color-mix(in srgb,var(--accent) 70%,transparent);transition:background var(--dur-base),transform var(--dur-base) var(--ease-out)}
.wd-action:hover{background:var(--accent-hover);transform:translateY(-1px)}

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
.sy-world{display:flex;flex-direction:column;gap:16px;min-width:0;padding:clamp(18px,3vw,28px);border-radius:var(--radius-xl);border:1px solid var(--line);background:color-mix(in srgb,var(--bg) 55%,transparent);box-shadow:inset 0 1px 0 var(--glass-edge);animation:sy-in var(--dur-slow) var(--ease-out)}
@keyframes sy-in{from{opacity:.4;transform:translateY(6px);filter:blur(2px)}}
.sy-world-head{display:flex;align-items:center;gap:12px}
.sy-world-head h3{margin:0;font:700 clamp(1.4rem,3vw,1.9rem)/1.05 var(--font-display);letter-spacing:-.03em}
.sy-orb-sm{width:40px;height:40px;flex:none}
.sy-orb-sm .sy-icon{width:20px;height:20px}
.sy-ver{margin-left:auto;padding:5px 10px;border-radius:var(--radius-pill);border:1px solid var(--line-strong);font:500 .78rem/1 var(--font-mono);color:var(--muted)}
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

::view-transition-group(*){animation-duration:var(--dur-slow);animation-timing-function:var(--ease-out)}

/* How it works: three moves on one path. */
.wd-steps{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,3vw,40px);margin:0;padding:0;list-style:none;counter-reset:s}
.wd-steps::before{content:"";position:absolute;top:22px;left:22px;right:22px;border-top:1px dashed color-mix(in srgb,var(--text) 22%,transparent)}
.wd-steps li{position:relative;display:grid;gap:8px;counter-increment:s}
.wd-steps li::before{content:counter(s);display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--bg);border:1px solid var(--line-strong);font:600 .9rem/1 var(--font-mono);color:var(--accent-text);box-shadow:0 0 0 6px var(--bg)}
.wd-steps b{font:700 clamp(1.4rem,3vw,1.9rem)/1 var(--font-display);letter-spacing:-.03em}
.wd-steps span{max-width:22ch;color:var(--muted);font-size:.95rem;line-height:1.45}
@media (max-width: 560px){.wd-steps{grid-template-columns:1fr}.wd-steps::before{top:22px;bottom:22px;left:22px;right:auto;border-top:0;border-left:1px dashed color-mix(in srgb,var(--text) 22%,transparent)}.wd-steps li{grid-template-columns:44px 1fr;column-gap:16px}.wd-steps li::before{grid-row:span 2}}
.wd-foot{display:grid;gap:14px;font-size:var(--fs-sm);color:var(--muted)}
.wd-foot p{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;margin:0}
.wd-foot a{color:var(--text);text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:4px}
.wd-foot a:hover{text-decoration-color:var(--accent)}
.wd-gh{display:inline-flex;align-items:center;gap:8px;text-decoration:none!important}
@media (prefers-reduced-motion: reduce){.sy-agent,.sy-wait .sy-ring,.sy-world{animation:none}}
`
