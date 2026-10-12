// The homepage's space binding: the labels, the markers and the stop points that sit on the 3D world. The world (one
// engine, drawing on the layout's canvas, lib/space/world.ts) calls labels() after each frame. The story it reads (S,
// set by lib/home/ui.ts) and the five tool worlds are this page's. startScene() returns the binding the world takes,
// and stop(), which removes what this page added.
import type { SpaceBinding } from "@/lib/space/world";
import type { SpaceCard, SpaceFrame, SpaceSprite, SpaceWell, TypeLine, Vec3 } from "@/lib/space/engine";
import { hasScene, playScene } from "./scenes";
import { orbitStop } from "@/lib/space/orbit";
import { listener } from "./listen";
import { placeTags, type Box } from "./labels";
import { PROOF, playProof, proofLength } from "./proof";
import { slotAz, TOOL_WORLDS } from "./worlds";
import { JOURNEY, PLAN_STEPS } from "./journey";

// The tool worlds (lib/home/worlds.ts): each is a well (its mass) at its own place. az is the camera's view of it in
// reduced motion.
const WELLS: SpaceWell[] = TOOL_WORLDS.map(w => ({ x: w.x, z: w.z, mass: w.mass, az: slotAz(w.slot) + 30 }));
// The reduced-motion view of the sections that need their own: [elevation, distance] (the rest use the hero, a
// station or the calm default).
const RVIEW: Record<string, number[]> = { guide: [44, 12.5], promises: [17, 8.8] };
// The plan's stops sit on the real orbit, in the order the ink reaches them.
const STOP_U = Array.from({ length: PLAN_STEPS }, (_, k) => orbitStop(k, PLAN_STEPS));
// How many of the plan's steps are lit: one more every 1.1 s from arriving at the plan; all of them before reduced
// motion, and on every stop after the plan.
const PLAN_BEAT_MS = 1100;

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
  let sceneAgent = (q: Vec3): Vec3 => q;
  let shown: SpaceCard[] = [], things: SpaceSprite[] = [], agentAt: string | Vec3 | null = null, last: SpaceFrame | null = null;
  const started: { play: Solenix['play']; at: number } = { play: null, at: -1 };
  const capWords = [...document.querySelectorAll<HTMLElement>('#journey .cap')].map(cap => [...cap.querySelectorAll<HTMLElement>(':scope > :is(h1, h2, p, ul, ol)')]);

  function work(f: SpaceFrame) {
    shown = []; things = []; agentAt = null;
    const p = PROOF.find(x => S.play && x.tool === S.play.tool), wi = p ? S.fly.findIndex(w => w.id === p.tool) : -1;
    const al = wi < 0 ? 0 : f.fly * Math.max(0, 1 - Math.abs(f.wsel - wi) * 2);
    if (!p || !S.play || al < 0.01) return;
    // The work starts once the camera has arrived beside the world, so the visitor sees all of it.
    if (started.play !== S.play) { started.play = S.play; started.at = -1; }
    if (started.at < 0 && al > 0.92) started.at = performance.now();
    const a = S.play.ask, t = !S.motion ? Infinity : started.at < 0 ? 0 : (performance.now() - started.at) / 1000, m = playProof(p, a, Math.min(t, proofLength(p, a)));
    // The world's own drift (T) stops under reduced motion: every value is still on screen, nothing moves by itself.
    const T = S.motion ? performance.now() / 1000 : 0;
    // Units: view heights at the world's depth. The things (when a tool shows its work as cards) stand in a column
    // beside the world: to its left on a wide screen, under it on a narrow one. What is asked and what came back sit
    // just above the stop's words, where the eye already is.
    const aspect = f.width / f.height, w = f.portrait ? Math.min(0.4, 0.88 * aspect) : 0.3;
    const x = f.portrait ? 0 : -0.36, step = w * 0.26, at = f.well(wi), id = (k: string) => `${p.tool}:${k}`, own = (k: string) => `${p.tool}/${k}`;
    const v = f.project(at.x, at.y, at.z), H = f.height, W = f.width;
    const cap = capWords[S.cur]?.map(e => e.getBoundingClientRect()).filter(r => r.width > 0) ?? [];
    const capLeft = cap.length ? Math.min(...cap.map(r => r.left)) : 32, capTop = cap.length ? Math.min(...cap.map(r => r.top)) : H * 0.62;
    // A card's offset so its left edge and top land on a point of the screen (CSS pixels).
    const toScreen = (cw: number, px: number, py: number) => ({ dx: (px - W / 2) / H + cw / 2 - v.x * aspect / 2, dy: (H / 2 - py) / H - v.y / 2 });
    const live = hasScene(p.tool) ? playScene(p, a, Math.min(t, proofLength(p, a)), T) : null;
    if (live) {
      // The scene fits the frame: centred in the open part of the screen (the right half on a wide screen, the upper
      // half on a phone) at the world's depth, and sized to the view there, whatever the tool's camera.
      const vw = f.view(at.x, at.y, at.z), k = vw.vh * (f.portrait ? 0.085 : 0.15);
      const sx = f.portrait ? 0 : 0.21 * aspect, sy = f.portrait ? 0.2 : -0.04, ox = (sx - v.x * aspect / 2) * vw.vh, oy = (sy - v.y / 2) * vw.vh;
      const o = { x: at.x + vw.right.x * ox + vw.up.x * oy, y: at.y + vw.right.y * ox + vw.up.y * oy, z: at.z + vw.right.z * ox + vw.up.z * oy };
      // The scene's own axes face the camera: x across the screen, y up, z toward the viewer (level with the ground).
      const rl = Math.hypot(vw.right.x, vw.right.z) || 1, rx = vw.right.x / rl, rz = vw.right.z / rl, fx = -rz, fz = rx;
      const place = (q: { x: number; y: number; z: number }) => ({ x: o.x + (q.x * rx + q.z * fx) * k, y: o.y + q.y * k, z: o.z + (q.x * rz + q.z * fz) * k });
      for (const th of live.things) things.push({ id: id(th.id), ...place(th), size: th.size * k, aspect: th.aspect, icon: th.icon, tone: th.tone, alpha: al * th.alpha });
      sceneAgent = place;
      // Labels are sized to the screen's width, so on a phone they stay inside it.
      const lw = Math.min(1, aspect / 1.2);
      // Each thing that has a name wears it under it, small, in the world.
      for (const th of live.things) if (th.label && th.alpha > 0.05) { const q = place({ x: th.x, y: th.y - th.size * 0.75, z: th.z }); shown.push({ id: id(`name-${th.id}`), at: q, dx: 0, dy: 0, w: 0.2 * lw, kind: 'type', center: true, title: '', lines: [{ size: 'p', px: 110, weight: 600, parts: [{ t: th.label, em: th.tone === 'new' }] }], alpha: al * th.alpha }); }
      // The AI wears its name while it works, so no one wonders what is moving.
      if (live.agent) shown.push({ id: own('ai'), at: place({ ...live.agent, y: live.agent.y + 0.55 }), dx: 0, dy: 0, w: 0.075, kind: 'pill', title: 'AI', alpha: al });
      for (const lb of live.labels) shown.push({ id: id(`label-${lb.id}`), at: place(lb), dx: 0, dy: 0, w: 0.34 * lw, kind: 'type', center: true, title: '', lines: [{ size: 'p', px: 150, weight: 650, parts: [{ t: lb.text, em: lb.tone === 'new' }] }], alpha: al });
    } else {
      const y0 = f.portrait ? -0.1 : 0.22;
      for (const th of m.things) shown.push({ id: id(th.id), at, dx: x, dy: y0 - th.slot * step, w, kind: 'thing', title: th.label, value: th.value, state: th.state, alpha: al * th.show });
    }
    // Above the words, bottom up: the other asks, the answer, then what was asked.
    const cw = f.portrait ? Math.min(0.42, 0.9 * aspect) : 0.28, gap = 12;
    let yb = capTop - gap;
    p.asks.forEach((q, i) => { if (i === a) return; const hpx = cw * H * 0.22; const o = toScreen(cw * 0.92, capLeft, yb - hpx / 2); shown.push({ id: own(`ask${i}`), at, dx: o.dx, dy: o.dy, w: cw * 0.92, kind: 'ask', title: q.say, alpha: al * m.reply }); yb -= hpx + gap; });
    { const hpx = cw * H * 0.3, o = toScreen(cw, capLeft, yb - hpx / 2); shown.push({ id: own('answer'), at, dx: o.dx, dy: o.dy, w: cw, kind: 'reply', title: p.asks[a].reply, value: "Example", alpha: al * m.reply }); yb -= hpx + gap; }
    { const hpx = cw * H * 0.2, o = toScreen(cw, capLeft, yb - hpx / 2); shown.push({ id: own('say'), at, dx: o.dx, dy: o.dy, w: cw, kind: 'say', title: m.typed || ' ', alpha: al * (m.typed ? 1 : 0) }); }
    agentAt = m.at === 'say' ? own('say') : live ? (live.agent ? sceneAgent(live.agent) : null) : m.at ? id(m.at) : null;
  }
  // The words of each stop, set as type in the world (lib/space/cards.ts). They are read from the page (the stop's
  // caption: one source), drawn at the caption's own size and place while the stop is on, and left in the world when
  // the camera moves on, so it passes them. The page's own words stay for screen readers and keyboards.
  const TW = 1600, CANVAS_H = 132;
  // The plan's steps as lines, each with its number, as many as are lit.
  const planLit = () => S.sec !== 'plan' || !S.motion || S.planAt < 0 ? PLAN_STEPS : Math.min(PLAN_STEPS, 1 + Math.floor((performance.now() - S.planAt) / PLAN_BEAT_MS));
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
    const lines: TypeLine[] = els.flatMap((e, i): TypeLine[] => e.tagName === 'OL'
      ? [...e.querySelectorAll('li')].slice(0, planLit()).map((li, n) => ({ size: 'p' as const, px: Math.round(sizes[i] * K), weight: +getComputedStyle(e).fontWeight || 600, parts: [{ t: `${n + 1}`, em: true }, { t: li.textContent!.trim() }] }))
      : [{ size: /^H/.test(e.tagName) ? 'h' : 'p', px: Math.round(sizes[i] * K), weight: +getComputedStyle(e).fontWeight || 600, parts: partsOf(e) }]);
    // The subject this stop is about: its tool's world, or the AI at the centre.
    const sc = JOURNEY_TOOL[S.cur], wi = sc ? S.fly.findIndex(w => w.id === sc) : -1, at = wi >= 0 ? f.well(wi) : f.hub();
    const v = f.project(at.x, at.y, at.z); if (v.z > 1) return;
    const W = f.width, H = f.height, aspect = W / H, wpx = TW / K;
    const cx = (left - 20 / K + wpx / 2 - W / 2) / H, by = -(bottom + 30 / K - H / 2) / H;
    typeOn = { id: `type:${S.cur}`, at, dx: cx - v.x * aspect / 2, dy: by - v.y / 2, w: wpx / H, kind: 'type', title: '', lines, wrap: (right - left) * K + 30, align: 'bottom', alpha: 1 };
  }

  // Where to start: on the Talk-to-one stop each role's world wears its name, and a tap flies there.
  const ROLE_OF: Record<string, string> = { gmail: 'Receptionist', quickbooks: 'Bookkeeper', meta: 'Ad manager', shopify: 'Stock manager', microsoftexcel: 'Analyst' };
  function roles(f: SpaceFrame): SpaceCard[] {
    if (JOURNEY[S.cur]?.id !== 'talk-to-one') return [];
    return TOOL_WORLDS.map((w, i) => { const at = f.well(i); return { id: `role:${w.id}`, at: { x: at.x, y: at.y + 0.9, z: at.z }, dx: 0, dy: 0.06, w: (ROLE_OF[w.id].length + 3) * (f.portrait ? 0.0105 : 0.0085), kind: 'pill' as const, title: ROLE_OF[w.id], alpha: 1 }; });
  }
  const goRole = (tool: string) => { const k = JOURNEY.findIndex(s => 'tool' in s.scene && s.scene.tool === tool), j = document.getElementById('journey')!, st = j.querySelector<HTMLElement>('.stage')!;
    scrollTo({ top: j.getBoundingClientRect().top + scrollY + ((k + 0.5) / JOURNEY.length) * (j.offsetHeight - st.offsetHeight), behavior: S.motion ? 'smooth' : 'instant' }); };
  let roleCards: SpaceCard[] = [], planCards: SpaceCard[] = [];

  // A tap on an ask in the world plays it.
  const hitAsk = (e: PointerEvent) => {
    if (!last) return null;
    for (const c of [...shown, ...roleCards]) if ((c.kind === 'ask' || c.id.startsWith('role:')) && c.alpha > 0.5) { const r = last.cardRect(c.id); if (r && e.clientX >= r.x0 && e.clientX <= r.x1 && e.clientY >= r.y0 && e.clientY <= r.y1) return c; }
    return null;
  };
  l.on(window, 'pointerup', (e: PointerEvent) => { const c = hitAsk(e); if (c?.id.startsWith('role:')) return goRole(c.id.slice(5)); if (c?.kind !== 'ask' || !S.play) return; const p = PROOF.find(x => x.tool === S.play!.tool)!; S.ask(p.tool, p.asks.findIndex(q => q.say === c.title)); });
  l.on(window, 'pointermove', (e: PointerEvent) => { document.documentElement.style.cursor = hitAsk(e) ? 'pointer' : ''; }, { passive: true });
  l.add(() => { document.documentElement.style.cursor = ''; });

  // Revenue, Costs, Time: a small tag under each sun, all the way through. They fade only where the scene is
  // dimmed behind reading text, and step apart if two suns pass close together. On the journey the step is the
  // subject, so the tags step back until the orbit holds.
  let tagShow = 1, tagW = [90, 90, 90], tagH = 28;
  // The words on screen (the stop's caption, or the close) are kept clear: no tag lands on any of them.
  const caps = [...document.querySelectorAll<HTMLElement>('#journey .cap')], closeBlocks = [...document.querySelectorAll<HTMLElement>('#close .close-in > *')];
  let readBox: Box[] = [], boxDirty = true, boxCur = -1;
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
    work(f);
    words(f);
    roleCards = roles(f);
    // Beside one world, only its mark shows; seen from afar (no world picked), every world wears its mark.
    worldTags.forEach((e, i) => placeAt(e, f.well(i), fl * (wsel < 0 ? 1 : (portrait ? 0 : 1) * Math.max(0, 1 - Math.abs(wsel - i) * 1.6)), 0, f));
    tagShow = lerp(tagShow, locked || sc.agent > 0.98 ? 1 : 0, 1 - Math.exp(-f.dt * 4));
    const pad = (e: Element): Box => { const r = e.getBoundingClientRect(); return [r.left - 14, r.top - 10, r.right + 14, r.bottom + 10]; };
    // Re-measured on scroll and whenever the stop (and so its words) changes.
    if (boxDirty || boxCur !== S.cur) { boxDirty = false; boxCur = S.cur; readBox = (S.cur < caps.length ? [...caps[S.cur].children] : closeBlocks).map(pad); }
    // On a phone the close fills the screen with words: the tags step back there.
    const la = Math.max(0, Math.min(1, 1 - sc.dim / 0.4)) * lerp(1, tagShow, sc.stops) * (portrait && S.sec === 'close' ? 0 : 1), margin = portrait ? 24 : 34;
    const bd = [0, 1, 2].map(i => f.offOrbit(i));
    const pos = [0, 1, 2].map(i => { const B = f.sun(i), v = f.project(B.x, B.y, B.z), rad = f.sunRadiusPx(i);
      return { i, vis: 1 - Math.max(heroAmt, Math.min(1, sc.rw)) * smooth(1.02, 1.16, Math.abs(v.x)), x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H + lerp(margin, Math.max(margin, Math.min(rad, H * 0.22) + 18), heroAmt) }; }).sort((p0, p1) => p0.y - p1.y);
    // Where each tag sits: stepped apart from its neighbour, held in the viewport, clear of the words (lib/home/labels.ts).
    placeTags(pos, { width: W, tagW, tagH, readBox, show: la, smooth }).forEach(pp => { const e = tags[pp.i];
      e.style.opacity = pp.opacity.toFixed(3); e.style.transform = `translate3d(${pp.x.toFixed(1)}px, ${pp.y.toFixed(1)}px, 0) translateX(-50%)`; e.classList.toggle('in', bd[pp.i] < 0.05); });
    { const al = la * Math.max(sc.conn, sc.free * 0.75) * (1 - fl); tagAi.style.opacity = al.toFixed(3);
      if (al > 0.001) { const h = f.hub(), hp = f.project(h.x, h.y, h.z); tagAi.style.transform = `translate3d(${((hp.x + 1) / 2 * W).toFixed(1)}px, ${((1 - hp.y) / 2 * H - 30).toFixed(1)}px, 0) translateX(-50%)`; } }

    // The plan's stops: numbered markers on the orbit itself, lit one at a time with their steps (words()).
    const lit = planLit(), pw = portrait ? 0.045 : 0.03;
    planCards = sc.stops < 0.01 ? [] : STOP_U.map((u, k) => ({ id: `plan:${k}`, at: f.orbit(u), dx: 0, dy: 0.035, w: pw, kind: 'pill' as const, title: String(k + 1), alpha: k < lit ? sc.stops : 0 }));
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
    cards: () => [...shown, ...roleCards, ...planCards, ...(typeOn ? [typeOn] : [])],
    sprites: () => things,
    agentTo: () => agentAt,
    onLock: (holding) => { ui.classList.toggle('locked', holding); },
    onPayoff: () => { ui.classList.remove('lock-pop'); void ui.offsetWidth; ui.classList.add('lock-pop'); },
    onResize: () => { tagW = tags.map(e => e.offsetWidth || 90); tagH = tags[0]?.offsetHeight || 28; },
  };
  return { binding, stop: () => l.stop() };
}
