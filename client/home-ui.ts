// Page UI: reduced motion, the scroll-to-scene keyframes, reveals and section behaviour.
// No WebGL here: the page still reads in full if the 3D fails to load. It runs right after the
// markup it drives (compiled and inlined there by scripts/build-client.ts; types in client/home.d.ts).
export {}

// One keyframe of the story: where in the scroll it sits, and the scene values it pins.
type HomeKey = { sel: string; f: number; pin?: number; gap?: number } & Partial<HomeSceneParams>

const root = document.documentElement;
// The object is made here and filled in below (hero, fly, stops, ...) before any other script reads it.
const S = window.solenix = { p: 0, motion: true, vh: innerHeight, scene: {}, sceneIdx: 0 } as Solenix;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s), $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
S.smooth = smooth;

// Motion follows the operating system. Reduced motion freezes the scene; every value stays on screen.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
function applyMotion() {
  S.motion = !reduce.matches;
  root.dataset.motion = S.motion ? 'on' : 'off';
  if (!S.motion) $$('.rv').forEach(el => el.classList.add('in'));
  dispatchEvent(new Event('solenix:motion'));
  onScroll();
}
reduce.addEventListener('change', applyMotion);

// ── The story, as keyframes on the page. Each one pins the scene at a point in the scroll:
// where the camera is, how hard the suns are steered, how far the orbit is drawn in.
// Values not given carry over from the keyframe before. ──
// The opening is seen from above and pulled back, so all three bodies read as one system pulling apart.
const HERO = S.hero = { el: 30, dist: 11.5, lens: 4 };
// Six tool worlds. Each has its own camera height and distance, and its own place for the three bodies:
// a → b is where they roam (ahead of / beside the tool, in world units) as you scroll through the section.
const FLY = S.fly = [
  { id: 'shopify',        tx: 7.71,   tz: 9.19,   el: 24, dist: 8.6,  a: [-0.8, -2.6], b: [-0.4, 2.6],  sp: 1.0, rw: 1.1 },
  { id: 'meta',           tx: 11.82,  tz: -2.08,  el: 12, dist: 8.2,  a: [5.5, -2.5],  b: [4.5, 2.5],   sp: 1.5, rw: 2.0 },
  { id: 'quickbooks',     tx: 4.10,   tz: -11.28, el: 56, dist: 11.5, a: [0.5, 0],     b: [-0.8, 0.6],  sp: 2.0, rw: 1.6 },
  { id: 'gmail',          tx: -7.71,  tz: -9.19,  el: 30, dist: 7.4,  a: [1.2, 3.0],   b: [0.6, -2.8],  sp: 1.0, rw: 1.0 },
  { id: 'microsoftexcel', tx: -11.82, tz: 2.08,   el: 16, dist: 10.5, a: [3.5, -3.6],  b: [1.5, 3.2],   sp: 1.3, rw: 2.0 },
  { id: 'hubspot',        tx: -4.10,  tz: 11.28,  el: 42, dist: 9.6,  a: [-1.6, -2.2], b: [-1.2, 2.4],  sp: 1.15, rw: 1.2 }
];
const KEYS: HomeKey[] = [
  // 1 · Chaos
  { sel: '.sky', f: 0, pin: 1, k: 0, free: 0, order: 0, ink: 0, third: 0, el: HERO.el, az: 0, dist: HERO.dist, ox: 0.25, oy: 0.05, poy: 0.2, calm: 0, dim: 0, labels: 0, conn: 0, agent: 0, stops: 0, tx: 0, tz: 0, fly: 0, wsel: 0, hero: 1, lens: HERO.lens, rf: 0, rs: 0, sp: 1, rw: 0, shl: 0 },
  { sel: '.sky', f: 0.55, pin: 1, labels: 1, el: 33, az: -12, dist: 11.2, ox: 0.25, oy: 0.05 },
  { sel: '.sky', f: 1, pin: 1, labels: 0, el: 36, az: -24, dist: 11.8 },
  // From here to the plan nothing is steered. The three bodies stay wild and range across the world:
  // rf / rs place them ahead of or beside where the camera looks, sp spreads them, rw lets each one wander.
  // 2 · The guide: the AI is lit at the centre; the bodies swing wide around it, unheld.
  { sel: '#guide', f: 0.25, pin: 1, hero: 0, lens: 0, conn: 1, k: 0, free: 0, el: 44, az: 10, dist: 12.5, ox: 0.26, oy: 0.02, poy: 0.02, rf: 0.8, rs: 2.6, sp: 1.3, rw: 1.1, shl: 1 },
  { sel: '#guide', f: 0.9, pin: 1, el: 36, az: 34, dist: 11.5, rf: -0.4, rs: 3.2, sp: 1.4 },
  // 3 · The flybys: six tool worlds, each its own place and its own view. The bodies come too, still wild.
  ...FLY.flatMap((w, i) => [
    { sel: '#fly-' + w.id, f: 0.15, pin: 1, wsel: i, tx: w.tx, tz: w.tz, az: 70 + i * 60, conn: 0, k: 0, free: 0, fly: 1, dim: 1, shl: 0, el: w.el, dist: w.dist, ox: 0, oy: -0.1, poy: -0.08, rf: w.a[0], rs: w.a[1], sp: w.sp, rw: w.rw },
    { sel: '#fly-' + w.id, f: 0.8, pin: 1, az: 80 + i * 60, rf: w.b[0], rs: w.b[1] } ]),
  // 4 · The plan: back to the centre. Only here are they steered, and only here does the orbit form.
  { sel: '#after', f: 0, pin: 1, fly: 0, tx: 0, tz: 0, k: 0.45, free: 0.4, dim: 0, stops: 1, el: 60, az: 394, dist: 9.6, ox: 0.21, oy: 0.02, poy: 0.02, calm: 0.35, rf: 0, rs: 0, sp: 1, rw: 0, shl: 0.85 },
  { sel: '#after', f: 0.35, pin: 1, k: 1, free: 1, third: 0.6, poy: -0.02, shl: 0.3 },
  { sel: '#after', f: 1, pin: 1, k: 1, order: 1, ink: 1, third: 1, calm: 1, el: 64, az: 402 },
  // The promises: down inside the orbit, close, as the bodies glide past in order.
  { sel: '#promises', f: 0.1, pin: 1, stops: 0, shl: 0, el: 17, az: 438, dist: 8.8, lens: 8, ox: 0.24, oy: 0.03, poy: -0.04 },
  { sel: '#promises', f: 1, pin: 1, el: 14, az: 510 },
  // 5 · Stable orbit: steering lets go and it holds. Seen whole, from high above.
  { sel: '#close', f: 0.35, k: 0, agent: 1, lens: 0, el: 56, az: 532, dist: 15, ox: 0.28, oy: 0.08, poy: 0.24, shl: 0.6 },
  { sel: '#close', f: 1, el: 60, az: 540, dist: 16 }
];
const PARAMS = Object.keys(KEYS[0]).filter(k => !['sel', 'f', 'pin', 'gap'].includes(k)) as (keyof HomeSceneParams)[];
for (let i = 1; i < KEYS.length; i++) PARAMS.forEach(k => { if (KEYS[i][k] === undefined) KEYS[i][k] = KEYS[i - 1][k]; });
let keyY: number[] = [];
function layoutKeys() {
  keyY = KEYS.map(K => { const el = $(K.sel)!, top = el.getBoundingClientRect().top + scrollY, h = el.offsetHeight;
    // Narrow screens: the guide is met in the open gap above its copy, before the copy scrolls over it.
    if (K.gap && innerWidth < 1100) return top - innerHeight * 0.06;
    return K.pin ? top + K.f * (h - innerHeight) : top + K.f * h - innerHeight * 0.5; });
  const maxY = document.documentElement.scrollHeight - innerHeight; keyY[keyY.length - 1] = Math.min(keyY[keyY.length - 1], maxY);
  for (let i = 1; i < keyY.length; i++) keyY[i] = Math.max(keyY[i], keyY[i - 1] + 1);
}
function sceneAt(y: number): [number, number] {
  if (y <= keyY[0]) return [0, 0];
  for (let i = 1; i < keyY.length; i++) if (y < keyY[i]) return [i - 1, smooth(0, 1, (y - keyY[i - 1]) / (keyY[i] - keyY[i - 1]))];
  return [KEYS.length - 1, 0];
}
function updateScene() {
  const y = scrollY, [i, t] = sceneAt(y), A = KEYS[i], B = KEYS[Math.min(i + 1, KEYS.length - 1)], sc = S.scene;
  // Always continuous. Reduced motion changes how the scene moves, never whether it follows the scroll.
  PARAMS.forEach(k => sc[k] = A[k]! + (B[k]! - A[k]!) * t);
  S.sec = t < 0.5 ? A.sel : B.sel;
}

const sky = $('.sky')!, hero = $('.hero-copy')!, beat = $('.beat')!, cue = $('.scroll-cue'), world = $('.world');
const rets = $$('.scene-ui .ret:not(.ret-ai)'), retAi = $('.ret-ai'), tools = $$('.tool');
S.stops = $$('.stop-mk'); S.pingN = 0;
const prSec = $('#promises')!, pSteps = $$('[data-promises] li'), pDots = $$('#promises .jr-dots i');
// The Look headline builds word by word with the scroll, and unbuilds when you scroll back.
{ const h = $('.beat-h', beat)!; h.setAttribute('aria-label', h.textContent!); h.querySelectorAll(':scope, em').forEach(el => [...el.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent!.trim()) { const f = document.createDocumentFragment(); n.textContent!.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const sp = document.createElement('span'); sp.className = 'bw'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = w; f.append(sp); } }); n.replaceWith(f); } })); }
const bwords = $$('.bw', beat), bblocks = $$('.bl', beat);
const jr = $('#after')!, jSteps = $$('[data-steps] li'), jDots = $$('#after .jr-dots i');
const portal = $('.portal');
let ticking = false;
function onScroll() {
  ticking = false;
  const m = S.motion, vh = innerHeight;
  updateScene();
  // Hero and the Look beat, inside the pinned sky.
  const r = sky.getBoundingClientRect(), p = clamp(-r.top / (r.height - vh));
  S.p = p;
  const ho = 1 - smooth(0.06, 0.3, p);
  hero.style.opacity = String(ho); hero.style.transform = m ? `translateY(${-p * 200}px)` : ''; hero.style.visibility = ho < 0.02 ? 'hidden' : '';
  if (cue) cue.style.opacity = String(1 - smooth(0, 0.08, p));
  let any = 0;
  // Full motion: words rise in one by one. Reduced: the whole line fades in together, nothing moves.
  const put = (el: HTMLElement, k: number) => { let o: number, y: number; if (m) { const a0 = 0.34 + k * 0.022, inn = smooth(a0, a0 + 0.1, p); o = inn; y = (1 - inn) * 0.55; } else { o = smooth(0.32, 0.5, p); y = 0; }
    any = Math.max(any, o); el.style.opacity = o.toFixed(3); el.style.transform = y ? `translateY(${y.toFixed(3)}em)` : ''; };
  put(bblocks[0], 0); bwords.forEach((w, k) => put(w, k + 1)); put(bblocks[1], bwords.length + 1);
  beat.style.visibility = any > 0.01 ? 'visible' : 'hidden';
  S.retAlpha = S.scene.labels;
  // The journey: one card at a time, keyed to how far the orbit is inked in.
  const jrR = jr.getBoundingClientRect(), inJ = jrR.top < vh * 0.4 && jrR.bottom > vh * 0.3, ink = S.scene.ink;
  const cur = inJ ? Math.max(0, Math.min(4, Math.floor(ink * 5 - 0.4))) : -1;
  S.jCur = cur;
  jSteps.forEach((li, i) => li.classList.toggle('on', i === Math.max(0, cur) && (inJ || jrR.top < vh)));
  jDots.forEach((d, i) => d.classList.toggle('on', i <= cur));
  // The promises: one at a time. Each one that arrives rings out across the ground.
  { const pr = prSec.getBoundingClientRect(), inP = pr.top < vh * 0.4 && pr.bottom > vh * 0.3, pc = Math.min(3, Math.floor(clamp(-pr.top / (pr.height - vh)) * 4));
    pSteps.forEach((li, i) => li.classList.toggle('on', i === pc && (inP || pr.top < vh))); pDots.forEach((d, i) => d.classList.toggle('on', i <= pc));
    if (inP && pc !== S.prCur) { if (S.prCur !== undefined) S.pingN++; S.prCur = pc; } }
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', () => { S.vh = innerHeight; layoutKeys(); onScroll(); });

// "See how it settles" lands on the Look beat.
// Section headlines build word by word, once, as their section arrives.
{ const hio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('play'); hio.unobserve(e.target); } }), { threshold: 0.6 });
  $$('.w-sec .h2, .jr-head .h2, #close-h').forEach(h => {
    h.setAttribute('aria-label', h.textContent!.trim()); h.classList.add('hb'); let n = 0;
    [h, ...h.querySelectorAll('em')].forEach(el => [...el.childNodes].forEach(nd => { if (nd.nodeType !== 3 || !nd.textContent!.trim()) return;
      const fr = document.createDocumentFragment();
      nd.textContent!.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) return fr.append(' ');
        const o = document.createElement('span'), i = document.createElement('span'); o.className = 'hw'; o.setAttribute('aria-hidden', 'true'); i.style.setProperty('--i', String(n++)); i.textContent = w; o.append(i); fr.append(o); });
      nd.replaceWith(fr); }));
    hio.observe(h); }); }

// The guide headline names the six tools, one at a time. The old name lifts away as the new one rises into
// its place; with reduced motion the two cross-fade and nothing moves. It only runs while the headline is on
// screen. A screen reader gets one sentence that lists all six.
{ const sw = $('.tool-swap'), h = sw && sw.closest('h2');
  if (sw) { const names = sw.dataset.tools!.split('|'); let i = 0, seen = false, timer: ReturnType<typeof setInterval> | 0 = 0;
    h!.setAttribute('aria-label', `You don't need to be an expert in ${names.slice(0, -1).join(', ')} or ${names[names.length - 1]} anymore.`);
    const next = () => { i = (i + 1) % names.length; const cur = sw.firstElementChild!, out = cur.cloneNode(true) as HTMLElement, m = S.motion;
      out.classList.add('ts-out'); sw.append(out); cur.textContent = names[i];
      out.animate(m ? [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-60%)' }] : [{ opacity: 1 }, { opacity: 0 }], { duration: m ? 320 : 200, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).onfinish = () => out.remove();
      cur.animate(m ? [{ opacity: 0, transform: 'translateY(70%)' }, { opacity: 1, transform: 'translateY(0)' }] : [{ opacity: 0 }, { opacity: 1 }], { duration: m ? 520 : 200, delay: m ? 90 : 0, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }); };
    const run = (on: boolean) => { clearInterval(timer); timer = on ? setInterval(next, 2600) : 0; };
    new IntersectionObserver(es => { seen = es[0].isIntersecting; run(seen && !document.hidden); }, { threshold: 0.6 }).observe(h!);
    document.addEventListener('visibilitychange', () => run(seen && !document.hidden)); } }

// Under the pointer: cards catch a light, the primary buttons lean in, the portal tips toward you. Mouse only.
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  $$('.bento .cell, .p-card, .promises li').forEach(c => { c.classList.add('fx-host'); const g = document.createElement('span'); g.className = 'fx'; g.setAttribute('aria-hidden', 'true'); c.append(g);
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px'); c.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px'); }, { passive: true }); });
  $$('.btn-primary').forEach(b => {
    b.addEventListener('pointermove', e => { if (!S.motion) return; const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`; }, { passive: true });
    b.addEventListener('pointerleave', () => { const from = b.style.translate || '0px 0px'; b.style.translate = ''; if (S.motion && b.animate) b.animate({ translate: [from, '0px 0px'] }, { duration: 420, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }); });
  });
  if (portal) { let pf = 0, ex = 0, ey = 0;
    addEventListener('pointermove', e => { ex = e.clientX; ey = e.clientY; if (pf || !S.motion) return; pf = requestAnimationFrame(() => { pf = 0; const r = portal.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      portal.style.setProperty('--px', (clamp((ex - r.left - r.width / 2) / innerWidth, -0.5, 0.5) * 7).toFixed(2) + 'deg'); portal.style.setProperty('--py', (clamp((ey - r.top - r.height / 2) / innerHeight, -0.5, 0.5) * -5).toFixed(2) + 'deg'); }); }, { passive: true }); }
}

// Reveal once, never again on scroll-back.
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
$$('.rv').forEach(el => io.observe(el));

// Headline, word by word.
const h1 = $('.h1')!;
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(() => h1.classList.add('play')));
setTimeout(() => h1.classList.add('play'), 1200);

layoutKeys();
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { layoutKeys(); onScroll(); });
addEventListener('load', () => { layoutKeys(); onScroll(); });
applyMotion();
