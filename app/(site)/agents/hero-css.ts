// The Agents Marketplace hero's style, served with the page (a style string can't come from the
// browser-side component module: the server would get a reference, not the text).
export const AGENTS_HERO_CSS = `
.ah h1 em{font-style:normal;color:var(--accent-text)}
.ah .sx-hero-text,.ah .sx-hero-in>*{min-width:0}
.ah-bar{display:flex;flex-direction:column;gap:10px;max-width:40rem;min-width:0}
.ah-tabs{display:flex;gap:4px}
.ah-tabs button,.ah-chips button{min-height:var(--tap-min);padding:0 14px;border-radius:var(--radius-pill);border:1px solid var(--line);background:none;color:var(--muted);font:500 var(--fs-sm)/1 var(--font-text);cursor:pointer}
.ah-tabs button[aria-selected=true],.ah-chips button[aria-pressed=true]{color:var(--accent-text);background:var(--accent-quiet);border-color:transparent}
.ah-line{display:flex;align-items:center;gap:8px;min-width:0;padding:6px 6px 6px 16px;border-radius:var(--radius-pill);background:var(--surface-solid);border:1px solid var(--line-strong);box-shadow:inset 0 1px 0 var(--glass-edge),var(--shadow-lg)}
.ah-line code{flex:1;min-width:0;overflow-x:auto;white-space:nowrap;font:500 clamp(.78rem,1.8cqmin,1rem)/1.4 var(--font-mono);color:var(--text);scrollbar-width:none}
.ah-copy{flex:none;min-height:var(--tap-min);padding:0 20px;border:0;border-radius:var(--radius-pill);background:var(--accent);color:var(--accent-ink);font:600 var(--fs-sm)/1 var(--font-text);cursor:pointer}
.ah-copy:hover{background:var(--accent-hover)}
.ah-say{margin:0;min-height:2.6em;font-size:var(--fs-sm);line-height:1.3;color:var(--muted)}
.ah-say b{color:var(--text)}
.ah-orbit{height:100%;width:100%;container-type:size;display:grid;place-items:center;min-height:0}
.ah-orbit svg{width:min(100cqw,100cqh);height:min(100cqw,100cqh);overflow:visible}
.ah-ring{fill:none;stroke:var(--ring);stroke-opacity:.22;stroke-width:.25}
.ah-planet{cursor:pointer;outline:none}
.ah-hit{fill:transparent}
.ah-body{fill:var(--surface-solid);stroke:var(--ring);stroke-opacity:.6;stroke-width:.4;transition:fill var(--dur-base),stroke-opacity var(--dur-base)}
.ah-planet text{fill:var(--muted);font:500 2.5px/1 var(--font-text);transition:fill var(--dur-base)}
.ah-planet:hover .ah-body,.ah-planet:focus-visible .ah-body{stroke-opacity:1}
.ah-planet:hover text,.ah-planet:focus-visible text,.ah-planet.on text{fill:var(--text)}
.ah-planet.on .ah-body{fill:var(--accent);stroke:var(--sun1);stroke-opacity:1}
.ah-planet:focus-visible .ah-hit{stroke:var(--accent);stroke-width:.4}
.ah-wall{height:100%;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,10rem),1fr));align-content:safe center;gap:10px;min-height:0}
@container (aspect-ratio <= 1.15){.ah-wall{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.ah-wall .ah-cat{display:none}.ah-wall .ah-tile{padding:10px;gap:4px}.ah-wall .ah-name{font-size:.9rem;overflow-wrap:anywhere}}
.ah-tile{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:14px 16px;border-radius:var(--radius-xl);border:1px solid var(--line);background:var(--glass-bg);color:var(--text);text-align:left;cursor:pointer;transition:border-color var(--dur-base),transform var(--dur-base)}
.ah-tile:hover{transform:translateY(-3px);border-color:var(--line-strong)}
.ah-tile[aria-pressed=true]{border-color:var(--accent);background:var(--accent-quiet)}
.ah-cat{font:500 .72rem/1 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.ah-name{font:650 clamp(.85rem,2.4cqmin,1.35rem)/1.1 var(--font-display);overflow-wrap:anywhere;max-width:100%}
.ah-stars{font:500 var(--fs-sm)/1 var(--font-mono);color:var(--accent-text)}
.ah-cmd{display:flex;flex-direction:column;justify-content:safe center;gap:18px;min-height:0}
.ah--command .ah-line{padding:10px 10px 10px 22px}
.ah--command .ah-line code{font-size:clamp(.85rem,2.6cqmin,1.5rem)}
.ah-chips{display:flex;flex-wrap:wrap;gap:6px}
.ah-chips button span{margin-left:8px;color:var(--faint);font-family:var(--font-mono);font-size:.8em}
.ah :focus-visible{outline:2px solid var(--accent);outline-offset:3px}
/* Short screens (a phone held sideways): the helper line goes, the chips scroll in one row, tiles go compact. */
@container (max-height: 420px) or (max-width: 420px){.ah-chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.ah-chips button{flex:none}}
@container (max-height: 620px) and (aspect-ratio <= 1.15){.ah-wall .ah-stars,.ah--wall .ah-say{display:none}.ah-wall .ah-tile{padding:8px 10px;min-height:var(--tap-min);justify-content:center}}
@container (max-height: 420px){.ah-say{display:none}.ah-bar{gap:6px}.ah-wall{gap:6px;grid-template-columns:repeat(3,minmax(0,1fr))}.ah-wall .ah-cat,.ah-wall .ah-stars{display:none}.ah-wall .ah-tile{padding:6px 10px;min-height:var(--tap-min);justify-content:center}}
`
