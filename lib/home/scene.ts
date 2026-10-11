// The homepage's space binding: the labels, the markers and the stop points that sit on the 3D world. The world (one
// engine, drawing on the layout's canvas, lib/space/world.ts) calls labels() after each frame. The story it reads (S,
// set by lib/home/ui.ts) and the six tool worlds are this page's. startScene() returns the binding the world takes,
// and stop(), which removes what this page added.
import type { SpaceBinding } from "@/lib/space/world";
import type { SpaceFrame, SpaceWell, Vec3 } from "@/lib/space/engine";
import { orbitStop } from "@/lib/space/orbit";
import { listener } from "./listen";
import { PROOF, placeProof } from "./proof";

// The six tool worlds: a wide circle round the business, one every 60 degrees from 40. Each is a well (its mass)
// and its own place. az is the camera's view of it in reduced motion.
const WN = 6, WR = 12, WAZ = (i: number) => 40 + 60 * i, TOOL_M = [1, 0.8, 1.2, 0.85, 1.1, 0.9];
const D2Rq = (d: number) => d * Math.PI / 180;
const WELLS: SpaceWell[] = Array.from({ length: WN }, (_, i) => { const th = D2Rq(90 - WAZ(i)); return { x: Math.cos(th) * WR, z: Math.sin(th) * WR, mass: TOOL_M[i], az: WAZ(i) + 30 }; });
// The reduced-motion view of each section: [elevation, distance].
const RVIEW: Record<string, number[]> = { guide: [44, 12.5], promises: [17, 8.8] };
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
  // The tools' things (lib/home/proof.ts): one stack of cards per tool, held beside its world as the camera moves.
  // A card per thing, made once; each answer re-orders them and lights what it found.
  const proofLayer = q('.proof')!, stacks = new Map<string, { e: HTMLElement; cards: Map<string, HTMLElement>; x: number; y: number }>();
  for (const p of PROOF) {
    const e = document.createElement('div'), cards = new Map<string, HTMLElement>(); e.className = 'pstack';
    for (const t of [...p.things, ...p.asks.flatMap(a => a.adds ?? [])]) {
      const c = document.createElement('div'); c.className = 'pt'; c.innerHTML = '<b></b><span></span>';
      c.querySelector('b')!.textContent = t.label; c.querySelector('span')!.textContent = t.value; e.append(c); cards.set(t.id, c);
    }
    proofLayer.append(e); stacks.set(p.tool, { e, cards, x: -1, y: -1 });
  }
  l.add(() => proofLayer.replaceChildren());
  const jrEl = document.getElementById('journey')!;

  // Revenue, Costs, Time: a small tag under each sun, all the way through. They fade only where the scene is
  // dimmed behind reading text, and step apart if two suns pass close together. On the journey the step is the
  // subject, so the tags step back until the orbit holds.
  let tagShow = 1, tagW = [90, 90, 90], tagH = 28;
  // The words on screen (the stop's caption, or the close) are kept clear: no tag lands on any of them.
  const caps = [...document.querySelectorAll<HTMLElement>('#journey .cap')], closeBlocks = [...document.querySelectorAll<HTMLElement>('#close .close-in > *')];
  let readBox: number[][] = [], boxDirty = true;
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
    // The tool beside the camera shows its things, as its latest answer arranged them: a stack held beside its world,
    // kept between the nav and the words.
    for (const p of PROOF) {
      const st = stacks.get(p.tool)!, wi = S.fly.findIndex(w => w.id === p.tool), al = fl * Math.max(0, 1 - Math.abs(wsel - wi) * 2);
      if (al < 0.01) { if (st.e.style.opacity !== '0') st.e.style.opacity = '0'; st.x = -1; continue; }
      const placed = placeProof(p, S.asked[p.tool] ?? -1), shown = new Set(placed.map(t => t.id));
      // A phone holds only what the answer found or made; the rest would crowd the words.
      st.cards.forEach((c, id) => { const k = placed.findIndex(t => t.id === id); c.hidden = !shown.has(id) || (portrait && placed[k]?.state === 'dim'); if (k >= 0) { c.style.order = String(k); c.dataset.state = placed[k].state; } });
      const w = f.well(wi), v = f.project(w.x, w.y, w.z), wx = (v.x + 1) / 2 * W, wy = (1 - v.y) / 2 * H;
      const sw = st.e.offsetWidth || 240, sh = st.e.offsetHeight || 180, cap = caps[S.cur], top = 84, bottom = cap ? cap.getBoundingClientRect().top - 16 : H - 16;
      // The open sky is beside the world, above the words: the stack takes the left of the world when it fits there.
      const left = wx - 56 - sw >= 24, x = portrait ? Math.min(Math.max(wx - sw / 2, 16), W - sw - 16) : left ? wx - 56 - sw : Math.min(wx + 56, W - sw - 24);
      const y = Math.min(Math.max(portrait ? wy + 40 : wy - sh / 2, top), Math.max(top, bottom - sh));
      if (st.x < 0) { st.x = x; st.y = y; } else { const k = 1 - Math.exp(-f.dt * 8); st.x += (x - st.x) * k; st.y += (y - st.y) * k; }
      st.e.style.opacity = al.toFixed(3); st.e.style.transform = `translate3d(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px, 0)`;
    }
    // Beside one world, only its mark shows; seen from afar (no world picked), every world wears its mark.
    worldTags.forEach((e, i) => placeAt(e, f.well(i), fl * (wsel < 0 ? 1 : (portrait ? 0 : 1) * Math.max(0, 1 - Math.abs(wsel - i) * 1.6)), 0, f));
    tagShow = lerp(tagShow, locked || sc.agent > 0.98 ? 1 : 0, 1 - Math.exp(-f.dt * 4));
    const pad = (e: Element) => { const r = e.getBoundingClientRect(); return [r.left - 14, r.top - 10, r.right + 14, r.bottom + 10]; };
    if (boxDirty) { boxDirty = false; readBox = (S.cur < caps.length ? [...caps[S.cur].children] : closeBlocks).map(pad); }
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
    onLock: (holding) => { jrEl.classList.toggle('locked', holding); ui.classList.toggle('locked', holding); },
    onPayoff: () => { ui.classList.remove('lock-pop'); void ui.offsetWidth; ui.classList.add('lock-pop'); },
    onResize: () => { tagW = tags.map(e => e.offsetWidth || 90); tagH = tags[0]?.offsetHeight || 28; },
  };
  return { binding, stop: () => l.stop() };
}
