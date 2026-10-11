// The homepage's space binding: the labels, the markers and the stop points that sit on the 3D world. The world (one
// engine, drawing on the layout's canvas, lib/space/world.ts) calls labels() after each frame. The story it reads (S,
// set by lib/home/ui.ts) and the five tool worlds are this page's. startScene() returns the binding the world takes,
// and stop(), which removes what this page added.
import type { SpaceBinding } from "@/lib/space/world";
import type { SpaceCard, SpaceFrame, SpaceWell, TypeLine, Vec3 } from "@/lib/space/engine";
import { orbitStop } from "@/lib/space/orbit";
import { listener } from "./listen";
import { PROOF, playProof, proofLength } from "./proof";
import { slotAz, TOOL_WORLDS } from "./worlds";
import { JOURNEY } from "./journey";

// The tool worlds (lib/home/worlds.ts): each is a well (its mass) at its own place. az is the camera's view of it in
// reduced motion.
const WELLS: SpaceWell[] = TOOL_WORLDS.map(w => ({ x: w.x, z: w.z, mass: w.mass, az: slotAz(w.slot) + 30 }));
// The reduced-motion view of each section: [elevation, distance].
const RVIEW: Record<string, number[]> = { guide: [44, 12.5], promises: [17, 8.8] };
// The five stops of "After you book" sit on the real orbit, in the order the ink reaches them.
const STOP_U = [0, 1, 2, 3, 4].map(k => orbitStop(k, 5));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Each stop's tool, if it is a tool stop.
const JOURNEY_TOOL = JOURNEY.map(s => ('tool' in s.scene ? s.scene.tool : null));

// Each world wears its own mark, shown only while you are beside it.
function placeAt(e: HTMLElement, p: Vec3, al: number, dy: number, f: SpaceFrame) {
  if (al < 0.01) { if (e.style.opacity !== '0') e.style.opacity = '0'; return; }
  const v = f.project(p.x, p.y, p.z);
  e.style.opacity = al.toFixed(3); e.style.transform = `translate3d(${((v.x + 1) / 2 * f.width).toFixed(1)}px, ${((1 - v.y) / 2 * f.height + dy).toFixed(1)}px, 0) translate(-50%, -50%)`;
}

/** Starts the homepage's space binding. S is the page state from lib/home/ui.ts. */
export function startScene(S: Solenix): { binding: SpaceBinding; stop: () => void } {
  const l = listener();
  const smooth = S.smooth;
  const q = (s: string) => document.querySelector<HTMLElement>(s);
  const tags = [...document.querySelectorAll<HTMLElement>('.body-tag:not(.ai)')], tagAi = q('.body-tag.ai')!;
  // Each world's mark, in the worlds' own order (matched by id, never by position in the page).
  const worldTags = TOOL_WORLDS.map(w => document.querySelector<HTMLElement>(`.world-tag[data-world="${w.id}"]`)!);
  const ui = tags[0].parentElement!;   // carries the locked and lock-pop classes
  // The tools' work (lib/home/proof.ts), as cards in the world beside each tool (lib/space/cards.ts): the ask is
  // typed, the AI goes to each thing and changes it there, the answer appears, and the other asks wait to be tapped.
  let shown: SpaceCard[] = [], agentAt: string | null = null, last: SpaceFrame | null = null;
  const started: { play: Solenix['play']; at: number } = { play: null, at: -1 };
  function work(f: SpaceFrame) {
    shown = []; agentAt = null;
    const p = PROOF.find(x => S.play && x.tool === S.play.tool), wi = p ? S.fly.findIndex(w => w.id === p.tool) : -1;
    const al = wi < 0 ? 0 : f.fly * Math.max(0, 1 - Math.abs(f.wsel - wi) * 2);
    if (!p || !S.play || al < 0.01) return;
    // The work starts once the camera has arrived beside the world, so the visitor sees all of it.
    if (started.play !== S.play) { started.play = S.play; started.at = -1; }
    if (started.at < 0 && al > 0.92) started.at = performance.now();
    const a = S.play.ask, t = !S.motion ? Infinity : started.at < 0 ? 0 : (performance.now() - started.at) / 1000, m = playProof(p, a, Math.min(t, proofLength(p, a)));
    // A column beside the world: to its left on a wide screen, under it on a narrow one. Units: view heights.
    const aspect = f.width / f.height, w = f.portrait ? Math.min(0.4, 0.88 * aspect) : 0.3;
    const x = f.portrait ? 0 : -0.36, step = w * 0.26, at = f.well(wi), id = (k: string) => `${p.tool}:${k}`, own = (k: string) => `${p.tool}/${k}`;
    let y = f.portrait ? -0.1 : 0.3;
    shown.push({ id: own('say'), at, dx: x, dy: y, w, kind: 'say', title: m.typed || ' ', alpha: al * (m.typed ? 1 : 0) });
    y -= w * 0.32;
    for (const th of m.things) shown.push({ id: id(th.id), at, dx: x, dy: y - th.slot * step, w, kind: 'thing', title: th.label, value: th.value, state: th.state, alpha: al * th.show });
    y -= m.things.length * step + w * 0.06;
    shown.push({ id: own('answer'), at, dx: x, dy: y, w, kind: 'reply', title: p.asks[a].reply, value: "Example", alpha: al * m.reply });
    y -= w * 0.34;
    p.asks.forEach((q, i) => { if (i === a) return; shown.push({ id: own(`ask${i}`), at, dx: x, dy: y, w: w * 0.92, kind: 'ask', title: q.say, alpha: al * m.reply }); y -= w * 0.2; });
    agentAt = m.at === 'say' ? own('say') : m.at ? id(m.at) : null;
  }
  // The words of each stop, set as type in the world (lib/space/cards.ts). They are read from the page (the stop's
  // caption: one source), drawn at the caption's own size and place while the stop is on, and left in the world when
  // the camera moves on, so it passes them. The page's own words stay for screen readers and keyboards.
  const TW = 1600, CANVAS_H = 132;
  const capWords = [...document.querySelectorAll<HTMLElement>('#journey .cap')].map(cap => [...cap.querySelectorAll<HTMLElement>(':scope > :is(h1, h2, p, ul)')]);
  const partsOf = (el: HTMLElement): TypeLine['parts'] => el.tagName === 'UL'
    ? [{ t: [...el.querySelectorAll('li')].map(li => li.textContent!.trim()).join(' · ') }]
    : [...el.childNodes].map(n => n instanceof HTMLElement ? (n.classList.contains('ex') ? { t: 'Example', ex: true } : { t: n.textContent!.replace(/\u2011/g, '-'), em: n.tagName === 'EM' }) : { t: (n.textContent ?? '').replace(/\u2011/g, '-') }).filter(p => p.t.trim());
  let typeOn: SpaceCard | null = null;
  function words(f: SpaceFrame) {
    typeOn = null;
    const els = capWords[S.cur];
    if (!els || !els.length) return;
    const rs = els.map(e => e.getBoundingClientRect()).filter(r => r.width > 0);
    if (!rs.length) return;
    const left = Math.min(...rs.map(r => r.left)), right = Math.max(...rs.map(r => r.right)), bottom = Math.max(...rs.map(r => r.bottom));
    const sizes = els.map(e => parseFloat(getComputedStyle(e.tagName === 'UL' ? e.querySelector('li') ?? e : e).fontSize)), big = Math.max(...sizes), K = CANVAS_H / big;
    const lines: TypeLine[] = els.map((e, i) => ({ size: /^H/.test(e.tagName) ? 'h' : 'p', px: Math.round(sizes[i] * K), weight: +getComputedStyle(e).fontWeight || 600, parts: partsOf(e) }));
    // The subject this stop is about: its tool's world, or the AI at the centre.
    const sc = JOURNEY_TOOL[S.cur], wi = sc ? S.fly.findIndex(w => w.id === sc) : -1, at = wi >= 0 ? f.well(wi) : f.hub();
    const v = f.project(at.x, at.y, at.z); if (v.z > 1) return;
    const W = f.width, H = f.height, aspect = W / H, wpx = TW / K;
    const cx = (left - 20 / K + wpx / 2 - W / 2) / H, by = -(bottom + 8 - H / 2) / H;
    typeOn = { id: `type:${S.cur}`, at, dx: cx - v.x * aspect / 2, dy: by - v.y / 2, w: wpx / H, kind: 'type', title: '', lines, wrap: (right - left) * K + 30, align: 'bottom', alpha: 1 };
  }

  // A tap on an ask in the world plays it.
  const hitAsk = (e: PointerEvent) => {
    if (!last || !S.play) return null;
    for (const c of shown) if (c.kind === 'ask' && c.alpha > 0.5) { const r = last.cardRect(c.id); if (r && e.clientX >= r.x0 && e.clientX <= r.x1 && e.clientY >= r.y0 && e.clientY <= r.y1) return c; }
    return null;
  };
  l.on(window, 'pointerup', (e: PointerEvent) => { const c = hitAsk(e); if (!c || !S.play) return; const p = PROOF.find(x => x.tool === S.play!.tool)!; S.ask(p.tool, p.asks.findIndex(q => q.say === c.title)); });
  l.on(window, 'pointermove', (e: PointerEvent) => { document.documentElement.style.cursor = hitAsk(e) ? 'pointer' : ''; }, { passive: true });
  l.add(() => { document.documentElement.style.cursor = ''; document.documentElement.classList.remove('type3d'); });
  const jrEl = document.getElementById('journey')!;

  // Revenue, Costs, Time: a small tag under each sun, all the way through. They fade only where the scene is
  // dimmed behind reading text, and step apart if two suns pass close together. On the journey the step is the
  // subject, so the tags step back until the orbit holds.
  let tagShow = 1, tagW = [90, 90, 90], tagH = 28;
  // The words on screen (the stop's caption, or the close) are kept clear: no tag lands on any of them.
  const caps = [...document.querySelectorAll<HTMLElement>('#journey .cap')], closeBlocks = [...document.querySelectorAll<HTMLElement>('#close .close-in > *')];
  let readBox: number[][] = [], boxDirty = true, boxCur = -1;
  const markDirty = () => { boxDirty = true; };
  l.on(window, 'scroll', markDirty, { passive: true });
  l.on(window, 'resize', markDirty);

  // A tool stop: the open band is the sky between the nav and the stop's caption, measured from the page, so the
  // bodies keep to the sky above the words. Null for any other stop.
  function openBand(sec: string) {
    if (sec !== 'tools') return null;
    const nav = document.querySelector('.snav, header'), cap = caps[S.cur];
    if (!cap) return null;
    return { y0: (nav ? nav.getBoundingClientRect().bottom : 0) + 12, y1: cap.getBoundingClientRect().top - 12 };
  }

  // The page's labels and markers, placed from each frame after the render. Every value is the scene's, as the frame reports it.
  function labels(f: SpaceFrame) {
    const sc = f.params, W = f.width, H = f.height, portrait = f.portrait, fl = f.fly, wsel = f.wsel, heroAmt = f.hero, locked = f.locked;
    last = f;
    if (!document.documentElement.classList.contains('type3d')) document.documentElement.classList.add('type3d');
    work(f);
    words(f);
    // Beside one world, only its mark shows; seen from afar (no world picked), every world wears its mark.
    worldTags.forEach((e, i) => placeAt(e, f.well(i), fl * (wsel < 0 ? 1 : (portrait ? 0 : 1) * Math.max(0, 1 - Math.abs(wsel - i) * 1.6)), 0, f));
    tagShow = lerp(tagShow, locked || sc.agent > 0.98 ? 1 : 0, 1 - Math.exp(-f.dt * 4));
    const pad = (e: Element) => { const r = e.getBoundingClientRect(); return [r.left - 14, r.top - 10, r.right + 14, r.bottom + 10]; };
    // Re-measured on scroll and whenever the stop (and so its words) changes.
    if (boxDirty || boxCur !== S.cur) { boxDirty = false; boxCur = S.cur; readBox = (S.cur < caps.length ? [...caps[S.cur].children] : closeBlocks).map(pad); }
    // On a phone the close fills the screen with words: the tags step back there.
    const la = Math.max(0, Math.min(1, 1 - sc.dim / 0.4)) * lerp(1, tagShow, sc.stops) * (portrait && S.sec === 'close' ? 0 : 1), margin = portrait ? 24 : 34;
    const bd = [0, 1, 2].map(i => f.offOrbit(i));
    const pos = [0, 1, 2].map(i => { const B = f.sun(i), v = f.project(B.x, B.y, B.z), rad = f.sunRadiusPx(i);
      return { i, vis: 1 - Math.max(heroAmt, Math.min(1, sc.rw)) * smooth(1.02, 1.16, Math.abs(v.x)), x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H + lerp(margin, Math.max(margin, Math.min(rad, H * 0.22) + 18), heroAmt) }; }).sort((p0, p1) => p0.y - p1.y);
    // Two tags that would touch: the lower one steps down by a whole tag, so neither hides the other.
    const step = tagH + 6;
    for (let n = 1; n < 3; n++) for (let m = 0; m < n; m++) if (Math.abs(pos[n].x - pos[m].x) < (tagW[pos[n].i] + tagW[pos[m].i]) / 2 + 8 && pos[n].y - pos[m].y < step) pos[n].y = pos[m].y + step;
    pos.forEach(pp => { const e = tags[pp.i], hw = tagW[pp.i] / 2 + 10, x = Math.min(Math.max(pp.x, hw), W - hw);
      const clear = (bx: number[]) => Math.max(bx[0] - (x + hw), (x - hw) - bx[2], bx[1] - (pp.y + 12), (pp.y - 12) - bx[3]);
      const gap = readBox.length ? Math.min(...readBox.map(clear)) : 99;
      e.style.opacity = (la * pp.vis * smooth(0, 28, gap)).toFixed(3); e.style.transform = `translate3d(${x.toFixed(1)}px, ${pp.y.toFixed(1)}px, 0) translateX(-50%)`; e.classList.toggle('in', bd[pp.i] < 0.05); });
    { const al = la * Math.max(sc.conn, sc.free * 0.75) * (1 - fl); tagAi.style.opacity = al.toFixed(3);
      if (al > 0.001) { const h = f.hub(), hp = f.project(h.x, h.y, h.z); tagAi.style.transform = `translate3d(${((hp.x + 1) / 2 * W).toFixed(1)}px, ${((1 - hp.y) / 2 * H - 30).toFixed(1)}px, 0) translateX(-50%)`; } }

    // The five stops, pinned to their places on the orbit.
    S.stops.forEach((e, k) => {
      if (sc.stops < 0.01) { e.style.opacity = '0'; return; }
      const o = f.orbit(STOP_U[k]), p = f.project(o.x, o.y, o.z);
      const sx = (p.x + 1) / 2 * W, sy = (1 - p.y) / 2 * H, lit = S.jCur >= k || (S.jCur < 0 && sc.ink >= (k + 0.5) / 5 - 0.02);
      e.style.opacity = (lit ? sc.stops : 0).toFixed(3); e.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
      e.classList.toggle('lit', lit); e.classList.toggle('cur', k === S.jCur && !(locked || sc.agent > 0.98)); e.classList.toggle('flip', sx > W - 240);
    });
  }

  const binding: SpaceBinding = {
    wells: WELLS,
    motion: () => S.motion,
    story: {
      params: () => S.scene,
      get hero() { return S.hero; },
      get stations() { return S.fly; },
      get views() { return RVIEW; },
      section: () => S.sec,
      pings: () => S.pingN,
    },
    openBand,
    onFrame: labels,
    cards: () => (typeOn ? [...shown, typeOn] : shown),
    agentTo: () => agentAt,
    onLock: (holding) => { jrEl.classList.toggle('locked', holding); ui.classList.toggle('locked', holding); },
    onPayoff: () => { ui.classList.remove('lock-pop'); void ui.offsetWidth; ui.classList.add('lock-pop'); },
    onResize: () => { tagW = tags.map(e => e.offsetWidth || 90); tagH = tags[0]?.offsetHeight || 28; },
  };
  return { binding, stop: () => l.stop() };
}
