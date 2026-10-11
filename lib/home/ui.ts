// The homepage's page UI: reduced motion, the scroll-to-scene keyframes, the reveals and the section behaviour.
// No WebGL here: the page still reads in full if the 3D world fails to load. startUi() runs when the homepage mounts
// (lib/home/attach.ts); its stop() removes every listener, observer and timer it started. Types: lib/home/home.d.ts.
import { listener } from "./listen";
import { FINALE, JOURNEY } from "./journey";
import { PROOF } from "./proof";
import { slotAz, TOOL_WORLDS } from "./worlds";

// One keyframe of the story: where in the scroll it sits, and the scene values it pins.
type HomeKey = { sel: string; f: number; pin?: number } & Partial<HomeSceneParams>;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

// The opening is seen from above and pulled back, so all three bodies read as one system pulling apart.
const HERO = { el: 30, dist: 11.5, lens: 4 };
// The tool worlds (lib/home/worlds.ts), as the camera flies to them: each world's place, view and the place beside it
// where the three bodies roam.
const FLY: HomeFlyWorld[] = TOOL_WORLDS.map(w => ({ id: w.id, tx: w.x, tz: w.z, el: w.el, dist: w.dist, a: w.roam, sp: w.sp, rw: w.rw }));
// A tool world is seen from its own side: its slot's angle plus 30 degrees, kept within half a turn of the guide's view
// (34 degrees) so the camera never spins the long way round.
const GUIDE_AZ = 34;
const nearGuide = (az: number) => ((az - GUIDE_AZ + 180) % 360 + 360) % 360 - 180 + GUIDE_AZ;
const toolView = (i: number): Partial<HomeSceneParams> => {
  const w = FLY[i], az = nearGuide(slotAz(TOOL_WORLDS[i].slot) + 30);
  return { wsel: i, tx: w.tx, tz: w.tz, el: w.el, dist: w.dist, az, rf: w.a[0], rs: w.a[1], sp: w.sp, rw: w.rw };
};
// Each stop holds still through the middle of its stretch of scroll, and the world moves only between stops, so a
// stop is never skipped past and the scroll stays the visitor's own. Each stop owns an equal share of the scroll; HOLD
// of its share is still.
const HOLD = 0.55;
const stopAt = (k: number): [number, number] => { const n = JOURNEY.length, c = (k + 0.5) / n, h = HOLD / n / 2;
  return [Math.max(0, c - h), Math.min(1, c + h)]; };
// The scene's keyframes, one per journey stop (lib/home/journey.ts), then the close. A tool stop takes its world's
// view (toolView); every value a stop leaves out carries on from the one before.
const toolKey = (id: string): Partial<HomeSceneParams> => ({ ...toolView(FLY.findIndex(w => w.id === id)), fly: 1, conn: 0, k: 0, free: 0, dim: 0.6, ox: 0.26, oy: 0.02, poy: 0.12 });
const KEYS: HomeKey[] = [
  ...JOURNEY.flatMap((s, k): HomeKey[] => { const v = 'tool' in s.scene ? toolKey(s.scene.tool) : s.scene, at = stopAt(k);
    return [{ sel: '#journey', f: at[0], pin: 1, ...v }, { sel: '#journey', f: at[1], pin: 1 }]; }),
  { sel: '.finale', f: 0.5, ...FINALE },
];
const PARAMS = Object.keys(KEYS[0]).filter(k => !['sel', 'f', 'pin'].includes(k)) as (keyof HomeSceneParams)[];
for (let i = 1; i < KEYS.length; i++) PARAMS.forEach(k => { if (KEYS[i][k] === undefined) KEYS[i][k] = KEYS[i - 1][k]; });

/** Starts the page's UI. The returned stop() removes everything it started. */
export function startUi(): { S: Solenix; stop: () => void } {
  const root = document.documentElement;
  // The object is made here and filled in below (hero, fly, stops, ...) before any other part reads it.
  const S = window.solenix = { motion: true, vh: innerHeight, scene: {}, cur: 0, jCur: -1 } as Solenix;
  S.smooth = smooth;
  S.hero = HERO;
  S.fly = FLY;
  const l = listener();
  let alive = true;
  let keyY: number[] = [];
  let ticking = false;
  let scrollRaf = 0;

  // Motion follows the operating system. Reduced motion stills the scene's own drift; it still follows the scroll, and
  // every value stays on screen.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotion() {
    S.motion = !reduce.matches;
    root.dataset.motion = S.motion ? 'on' : 'off';
    if (!S.motion) $$('.rv').forEach(el => el.classList.add('in'));
    dispatchEvent(new Event('solenix:motion'));
    onScroll();
  }
  l.on(reduce, 'change', applyMotion);

  const journey = $('#journey')!, stage = $('.stage', journey)!, caps = $$('.cap', journey), ticks = $$('.jticks i', journey);
  const finale = $('.finale')!;
  journey.style.setProperty('--n', String(JOURNEY.length));
  // The pinned stage is the unit: each stop's stretch of scroll is measured from it, so a phone's moving toolbar never
  // shifts a stop.
  const run = () => journey.offsetHeight - stage.offsetHeight;
  function layoutKeys() {
    keyY = KEYS.map(K => { const el = $(K.sel)!, top = el.getBoundingClientRect().top + scrollY, h = el.offsetHeight;
      return K.pin ? top + K.f * (h - stage.offsetHeight) : top + K.f * h - innerHeight * 0.5; });
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
  }

  S.stops = $$('.stop-mk'); S.pingN = 0; S.jCur = -1; S.cur = 0; S.asked = {};
  // The asks at each tool stop: plain words a visitor would say. A tap answers at once, in the world (lib/home/scene.ts).
  // Arriving at a tool, its first ask is already answered, so every visitor sees one answer.
  const asks = $$('.asks', journey).map(box => { const p = PROOF.find(x => x.tool === box.dataset.tool)!;
    const reply = document.createElement('p'); reply.className = 'reply'; reply.setAttribute('aria-live', 'polite');
    const btns = p.asks.map((a, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ask'; b.textContent = `“${a.say}”`;
      b.setAttribute('aria-pressed', 'false'); l.on(b, 'click', () => answer(p.tool, i)); return b; });
    box.replaceChildren(...btns, reply);
    return { tool: p.tool, btns, reply, p }; });
  function answer(tool: string, i: number) {
    const a = asks.find(x => x.tool === tool); if (!a) return;
    S.asked[tool] = i; a.btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    a.reply.textContent = a.p.asks[i].reply + ' ';
    const ex = document.createElement('span'); ex.className = 'ex'; ex.textContent = 'Example'; a.reply.append(ex);
  }

  function onScroll() {
    ticking = false;
    updateScene();
    // The stop the page is at: each owns an equal stretch of the scroll, its words held through all of it.
    const p = clamp(-journey.getBoundingClientRect().top / Math.max(1, run()));
    const atEnd = finale.getBoundingClientRect().top < innerHeight * 0.5;
    const cur = atEnd ? JOURNEY.length : Math.min(JOURNEY.length - 1, Math.floor(p * JOURNEY.length));
    if (cur !== S.cur) {
      if (JOURNEY[cur]?.sec === 'promises') S.pingN++;
      S.cur = cur;
      caps.forEach((c, k) => c.classList.toggle('on', k === cur));
      ticks.forEach((d, k) => d.classList.toggle('on', k === cur));
      journey.dataset.stop = JOURNEY[cur]?.id ?? 'close';
      const sc = JOURNEY[cur]?.scene, tool = sc && 'tool' in sc ? sc.tool : null;
      // The first answer is there the moment the stop is: nothing to wait for.
      if (tool && S.asked[tool] === undefined) answer(tool, 0);
    }
    const stop = JOURNEY[cur];
    S.sec = stop ? stop.sec : 'close';
    const lastPlan = JOURNEY.reduce((m, s, k) => (s.step !== undefined ? k : m), -1);
    S.jCur = stop?.step ?? (cur > lastPlan ? 4 : -1);
  }
  l.on(window, 'scroll', () => { if (!ticking) { ticking = true; scrollRaf = requestAnimationFrame(onScroll); } }, { passive: true });
  l.on(window, 'resize', () => { S.vh = innerHeight; layoutKeys(); onScroll(); });

  // The close's headline builds word by word, once, as it arrives.
  const hio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('play'); hio.unobserve(e.target); } }), { threshold: 0.6 });
  l.add(() => hio.disconnect());
  $$('#close-h').forEach(h => {
    if (!h.dataset.split) { h.dataset.split = '1'; h.setAttribute('aria-label', h.textContent!.trim()); h.classList.add('hb'); let n = 0;
      [h, ...h.querySelectorAll('em')].forEach(el => [...el.childNodes].forEach(nd => { if (nd.nodeType !== 3 || !nd.textContent!.trim()) return;
        const fr = document.createDocumentFragment();
        nd.textContent!.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) return fr.append(' ');
          const o = document.createElement('span'), i = document.createElement('span'); o.className = 'hw'; o.setAttribute('aria-hidden', 'true'); i.style.setProperty('--i', String(n++)); i.textContent = w; o.append(i); fr.append(o); });
        nd.replaceWith(fr); })); }
    if (h.getBoundingClientRect().top > innerHeight) { h.classList.add('arm'); hio.observe(h); } });

  // Under the pointer, the primary buttons lean in. Mouse only.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.btn-primary').forEach(b => {
      l.on(b, 'pointermove', e => { if (!S.motion) return; const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`; }, { passive: true });
      l.on(b, 'pointerleave', () => { const from = b.style.translate || '0px 0px'; b.style.translate = ''; if (S.motion && b.animate) b.animate({ translate: [from, '0px 0px'] }, { duration: 420, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }); });
    });
  }

  // Reveal once, never again on scroll-back.
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  l.add(() => io.disconnect());
  $$('.rv').forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('arm'); io.observe(el); } });

  // The headline is on screen from the first frame: it never hides and replays.
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

  layoutKeys();
  fonts.then(() => { if (alive) { layoutKeys(); onScroll(); } });
  // The page may already be loaded (a visit after the first): then the load step runs now.
  if (document.readyState === 'complete') { layoutKeys(); onScroll(); }
  else l.on(window, 'load', () => { layoutKeys(); onScroll(); });
  applyMotion();

  return {
    S,
    stop() {
      alive = false;
      cancelAnimationFrame(scrollRaf);
      l.stop();
    },
  };
}
