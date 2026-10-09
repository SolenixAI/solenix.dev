// The homepage's space binding: the labels, the markers and the stop points that sit on the 3D world. The world (one
// engine, drawing on the layout's canvas, lib/space/world.ts) calls labels() after each frame. The story it reads (S,
// set by lib/home/ui.ts) and the six tool worlds are this page's. startScene() returns the binding the world takes,
// and stop(), which removes what this page added.
import type { SpaceBinding } from "@/lib/space/world";
import type { SpaceFrame, SpaceWell, Vec3 } from "@/lib/space/engine";
import { orbitStop } from "@/lib/space/orbit";
import { listener } from "./listen";

// The six tool worlds: a wide circle round the business, one every 60 degrees from 40. Each is a well (its mass)
// and its own place. az is the camera's view of it in reduced motion.
const WN = 6, WR = 12, WAZ = (i: number) => 40 + 60 * i, TOOL_M = [1, 0.8, 1.2, 0.85, 1.1, 0.9];
const D2Rq = (d: number) => d * Math.PI / 180;
const WELLS: SpaceWell[] = Array.from({ length: WN }, (_, i) => { const th = D2Rq(90 - WAZ(i)); return { x: Math.cos(th) * WR, z: Math.sin(th) * WR, mass: TOOL_M[i], az: WAZ(i) + 30 }; });
// The reduced-motion view of each section: [elevation, distance].
const RVIEW: Record<string, number[]> = { '#guide': [44, 12.5], '#promises': [17, 8.8] };
// The five stops of "After you book" sit on the real orbit, in the order the ink reaches them.
const STOP_U = [0, 1, 2, 3, 4].map(k => orbitStop(k, 5));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
  const worldTags = [...document.querySelectorAll<HTMLElement>('.world-tag')];
  const ui = tags[0].parentElement!;   // carries the locked and lock-pop classes
  const jrEl = document.getElementById('after')!;

  // Revenue, Costs, Time: a small tag under each sun, all the way through. They fade only where the scene is
  // dimmed behind reading text, and step apart if two suns pass close together. On the journey the step is the
  // subject, so the tags step back until the orbit holds.
  let tagShow = 1, tagW = [90, 90, 90];
  // The hero box runs from the eyebrow to the button, as wide as the widest line, so no tag lands on any of it.
  const heroBeat = document.querySelector<HTMLElement>('.sky .beat'), heroBeatH = heroBeat && heroBeat.querySelector<HTMLElement>('.beat-h'), heroBlocks = [...document.querySelectorAll<HTMLElement>('.hero-copy .wrap > *')], readBlocks: Record<string, HTMLElement[]> = { '#guide': [...document.querySelectorAll<HTMLElement>('#guide .jr-head, #guide .guide-say')], '#close': [...document.querySelectorAll<HTMLElement>('#close .close-in > *')] };
  let heroBox = [0, 0, 0, 0], readBox: Record<string, number[][]> = {}, heroBoxDirty = true;
  const markDirty = () => { heroBoxDirty = true; };
  l.on(window, 'scroll', markDirty, { passive: true });
  l.on(window, 'resize', markDirty);

  // Tool sections: the open band is the space between a race's headline and its lanes, measured from the page.
  // With the lanes stacked, it is the tallest gap between the rows. Null for a section that is not a race.
  function openBand(sec: string) {
    const el = document.querySelector(sec); if (!el || !el.classList.contains('race')) return null;
    const head = el.querySelector('.race-head')!.getBoundingClientRect(), lanes = el.querySelector('.lanes')!.getBoundingClientRect();
    let y0 = head.bottom, y1 = lanes.top;
    const stacked = el.querySelector('.lane.ask')!.getBoundingClientRect().top > lanes.top + 40 ? 1 : 0;
    // Lanes stacked: they fill the screen, so take the tallest gap between the rows themselves.
    if (stacked) {
      const rows = [...el.querySelectorAll('.race-head, .lane > header, .scr-bar, .scr-nav, .scr-view > *, .rmsg, .lane-s, .race-note')].map(e => e.getBoundingClientRect()).filter(r => r.height > 2 && r.width > 2).sort((a, b) => a.top - b.top);
      let edge = rows.length ? rows[0].bottom : 0, best = 0;
      for (const r of rows) { if (r.top - edge > best) { best = r.top - edge; y0 = edge; y1 = r.top; } edge = Math.max(edge, r.bottom); }
    }
    return { y0, y1, stacked };
  }

  // The page's labels and markers, placed from each frame after the render. Every value is the scene's, as the frame reports it.
  function labels(f: SpaceFrame) {
    const sc = f.params, W = f.width, H = f.height, portrait = f.portrait, fl = f.fly, wsel = f.wsel, heroAmt = f.hero, locked = f.locked;
    worldTags.forEach((e, i) => placeAt(e, f.well(i), (portrait ? 0 : 1) * fl * Math.max(0, 1 - Math.abs(wsel - i) * 1.6), 0, f));
    tagShow = lerp(tagShow, locked || sc.agent > 0.98 ? 1 : 0, 1 - Math.exp(-f.dt * 4));
    const pad = (e: Element) => { const r = e.getBoundingClientRect(); return [r.left - 14, r.top - 10, r.right + 14, r.bottom + 10]; };
    if (heroBoxDirty) { heroBoxDirty = false; const onBeat = heroBeat && heroBeat.style.visibility === 'visible';
      heroBox = (onBeat ? [heroBeatH!, heroBeat!] : heroBlocks).map(pad).reduce((u, b) => [Math.min(u[0], b[0]), Math.min(u[1], b[1]), Math.max(u[2], b[2]), Math.max(u[3], b[3])]);
      for (const k in readBlocks) readBox[k] = readBlocks[k].map(pad); }
    const la = Math.max(0, Math.min(1, 1 - sc.dim / 0.4)) * lerp(1, tagShow, sc.stops), margin = portrait ? 24 : 34;
    const bd = [0, 1, 2].map(i => f.offOrbit(i));
    const pos = [0, 1, 2].map(i => { const B = f.sun(i), v = f.project(B.x, B.y, B.z), rad = f.sunRadiusPx(i);
      return { i, vis: 1 - Math.max(heroAmt, Math.min(1, sc.rw)) * smooth(1.02, 1.16, Math.abs(v.x)), x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H + lerp(margin, Math.max(margin, Math.min(rad, H * 0.22) + 18), heroAmt) }; }).sort((p0, p1) => p0.y - p1.y);
    for (let n = 1; n < 3; n++) for (let m = 0; m < n; m++) if (Math.abs(pos[n].x - pos[m].x) < 92 && pos[n].y - pos[m].y < 24) pos[n].y = pos[m].y + 24;
    pos.forEach(pp => { const e = tags[pp.i], hw = tagW[pp.i] / 2 + 10, x = Math.min(Math.max(pp.x, hw), W - hw);
      const clear = (bx: number[]) => Math.max(bx[0] - (x + hw), (x - hw) - bx[2], bx[1] - (pp.y + 12), (pp.y - 12) - bx[3]);
      const rb = readBox[S.sec], gap = rb ? Math.min(...rb.map(clear)) : clear(heroBox);
      e.style.opacity = (la * pp.vis * lerp(1, smooth(0, 28, gap), rb ? 1 : heroAmt)).toFixed(3); e.style.transform = `translate3d(${x.toFixed(1)}px, ${pp.y.toFixed(1)}px, 0) translateX(-50%)`; e.classList.toggle('in', bd[pp.i] < 0.05); });
    { const al = la * Math.max(sc.conn, sc.free * 0.75) * (1 - fl); tagAi.style.opacity = al.toFixed(3);
      if (al > 0.001) { const h = f.hub(), hp = f.project(h.x, h.y, h.z); tagAi.style.transform = `translate3d(${((hp.x + 1) / 2 * W).toFixed(1)}px, ${((1 - hp.y) / 2 * H - 30).toFixed(1)}px, 0) translateX(-50%)`; } }

    // The five stops, pinned to their places on the orbit.
    S.stops.forEach((e, k) => {
      if (sc.stops < 0.01) { e.style.opacity = '0'; return; }
      const o = f.orbit(STOP_U[k]), p = f.project(o.x, o.y, o.z);
      const sx = (p.x + 1) / 2 * W, sy = (1 - p.y) / 2 * H, lit = sc.ink >= (k + 0.5) / 5 - 0.02;
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
    onLock: (holding) => { jrEl.classList.toggle('locked', holding); ui.classList.toggle('locked', holding); },
    onPayoff: () => { ui.classList.remove('lock-pop'); void ui.offsetWidth; ui.classList.add('lock-pop'); },
    onResize: () => { tagW = tags.map(e => e.offsetWidth || 90); },
  };
  return { binding, stop: () => l.stop() };
}
