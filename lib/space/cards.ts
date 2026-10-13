// Cards in the world: the things a page shows inside the space (an invoice, an email, a product, what was asked,
// what came back), drawn as lit planes beside a point in the world, facing the camera. Nothing flat is laid over the
// scene: the page says what each card is and where, and the engine draws it, so a card sits in the same light, depth
// and motion as everything else. Offsets and sizes are in view heights at the anchor's depth, so a layout reads the
// same on any screen and at any distance.
import * as THREE from 'three';
import { Text } from 'troika-three-text';

export type CardState = "plain" | "hot" | "done" | "dim" | "new"

/** A line of type set in the space: a headline (h) or a smaller line (p); em parts take the ember, ex parts are the Example label. */
export interface TypeLine { size: "h" | "p"; parts: { t: string; em?: boolean; ex?: boolean }[]; px?: number; weight?: number }

/** One card, as the page wants it this frame. */
export interface SpaceCard {
  id: string
  /** The world point it sits beside. */
  at: { x: number; y: number; z: number }
  /** Offset from that point along the screen's right and up, and the card's width, in view heights at its depth. */
  dx: number
  dy: number
  w: number
  /** A thing (title and value), something said ("Sort today's inbox"), a reply, an ask the visitor can tap, or
   * words set in the space (type: lines, no card behind them). */
  kind: "thing" | "say" | "reply" | "ask" | "pill" | "type"
  lines?: TypeLine[]
  /** Type only: where its lines wrap, in canvas pixels (the canvas is 1600 wide). */
  wrap?: number
  /** Type only: each line centred on the card's point (a label on a thing), not starting at its left. */
  center?: boolean
  /** Which edge of the card dx, dy place (default its centre). */
  align?: "center" | "bottom"
  title: string
  value?: string
  state?: CardState
  /** 0 to 1. The engine eases to it. */
  alpha: number
}

const PAPER = '#f4f2ee', MUTED = '#a39e97', EMBER = '#fbbf24';
const EDGE: Record<CardState, string> = { plain: 'rgba(244,242,238,0.18)', hot: '#fb7185', done: '#34d399', dim: 'rgba(244,242,238,0.10)', new: '#fbbf24' };
const VALUE: Record<CardState, string> = { plain: MUTED, hot: '#fda4af', done: '#6ee7b7', dim: '#6f6a64', new: '#fcd34d' };
const WORD: Record<CardState, string> = { plain: '', hot: 'Needs you · ', done: 'Done · ', dim: '', new: 'New · ' };
const SANS = 'Sora, ui-sans-serif, system-ui, sans-serif', MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const CW = 720;

function wrap(g: CanvasRenderingContext2D, text: string, max: number): string[] {
  const out: string[] = []; let line = '';
  for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line);
  return out;
}

const TW = 1600;
// Words set in the space are SDF type (troika-three-text): sharp at any size, distance and screen density. Big Sora
// headlines with an ember gradient on their em part, a softer line under them, no card behind them; a soft dark
// halo (the outline blur) keeps them readable over the suns. Laid out in the same units as before: a card 1600
// wide, so the page's type sizes (TypeLine.px) and wraps carry over unchanged. Troika reads .woff, not .woff2, so
// the static weights are vendored for the world (scripts/vendor.ts, public/vendor/fonts/world).
const WORLD_FONTS = '/vendor/fonts/world/';
const SORA_WEIGHTS = [400, 500, 600, 700, 800];
const soraFile = (w: number) => `${WORLD_FONTS}sora-latin-${SORA_WEIGHTS.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a))}-normal.woff`;
const EMBER_A = new THREE.Color('#fbbf24'), EMBER_B = new THREE.Color('#f97316'), TINT = new THREE.Color();

/** One line of type as troika lays it out: its words joined by single spaces, the em words coloured along the
 * ember gradient one character at a time, the Example label muted. */
function typeLine(l: TypeLine, wrapAt: number, center: boolean): Text {
  const px = l.px ?? (l.size === 'h' ? 132 : 56);
  const base = l.size === 'h' ? 0xefece6 : 0xd6d1ca;
  const words: { t: string; em?: boolean; ex?: boolean }[] = [];
  for (const p of l.parts) for (const t of p.t.split(/\s+/).filter(Boolean)) words.push({ t, em: p.em, ex: p.ex });
  let text = '';
  const ranges: Record<number, number> = {};
  for (let i = 0; i < words.length; i++) {
    const w = words[i], at = text.length + (i ? 1 : 0);
    text += (i ? ' ' : '') + w.t;
    if (w.ex) { ranges[at] = 0xa39e97; ranges[at + w.t.length] = base; }
    else if (w.em) {
      // The gradient runs across the whole em run, as one stroke of colour.
      let j = i; while (j + 1 < words.length && words[j + 1].em) j++;
      const run = words.slice(i, j + 1).map((x) => x.t).join(' ');
      for (let k = 0; k < run.length; k++) ranges[at + k] = TINT.copy(EMBER_A).lerp(EMBER_B, run.length > 1 ? k / (run.length - 1) : 0).getHex();
      ranges[at + run.length] = base;
      text += run.slice(w.t.length); i = j;
    }
  }
  const t = new Text();
  t.text = text;
  t.font = soraFile(l.weight ?? (l.size === 'h' ? 800 : 500));
  t.fontSize = px;
  t.letterSpacing = l.size === 'h' ? -5 / px : 0;
  t.lineHeight = l.size === 'h' ? 1.0 : 1.45;
  t.maxWidth = wrapAt;
  t.textAlign = center ? 'center' : 'left';
  t.anchorX = center ? 'center' : 'left';
  t.anchorY = 'top';
  t.color = base;
  t.colorRanges = ranges;
  t.outlineWidth = 0;
  t.outlineBlur = px * 0.22;
  t.outlineColor = 0x05060a;
  t.outlineOpacity = 0.75;
  t.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false });
  t.renderOrder = 20;
  return t;
}

/** A card of type: its lines stacked from the top, centred on the group's origin once every line has its font and
 * layout. Calls back with the card's height over its width; until then it is not shown, so a fallback face never
 * shows. */
function buildType(lines: readonly TypeLine[], wrap = TW - 40, center = false, ready: (aspect: number) => void) {
  const group = new THREE.Group(), wrapAt = Math.min(wrap, TW - 40);
  const texts = lines.map((l) => typeLine(l, wrapAt, center));
  let left = texts.length;
  const done = () => {
    if (--left > 0) return;
    let y = 20;
    for (const t of texts) {
      const b = t.textRenderInfo?.blockBounds ?? [0, 0, 0, 0];
      t.position.set(center ? TW / 2 : 20, -y, 0);
      y += b[3] - b[1];
    }
    const H = Math.ceil(y + 40);
    for (const t of texts) { t.position.x -= TW / 2; t.position.y += H / 2; group.add(t); }
    ready(H / TW);
  };
  if (!texts.length) queueMicrotask(() => ready(0.05));
  for (const t of texts) t.sync(done);
  const dispose = () => { for (const t of texts) { t.dispose(); (t.material as THREE.Material).dispose(); } };
  return { group, texts, dispose };
}

// A name to tap: a pill with the word in it, the ember edge saying it can be pressed.
function drawPill(c: HTMLCanvasElement, text: string): number {
  const g = c.getContext('2d')!, font = `650 64px ${SANS}`;
  g.font = font; const w = Math.ceil(g.measureText(text).width + 96), H = 112;
  c.width = w; c.height = H; g.font = font;
  g.beginPath(); g.roundRect(3, 3, w - 6, H - 6, (H - 6) / 2); g.fillStyle = 'rgba(16,19,26,0.92)'; g.fill();
  g.lineWidth = 4; g.strokeStyle = 'rgba(251,191,36,0.75)'; g.stroke();
  g.fillStyle = PAPER; g.textBaseline = 'middle'; g.fillText(text, 48, H / 2 + 3);
  return H / w;
}

function draw(c: HTMLCanvasElement, card: SpaceCard): number {
  const g = c.getContext('2d')!, st = card.state ?? 'plain', pad = 36;
  // Measure first: the card's height follows its words.
  g.font = `600 ${card.kind === 'say' ? 44 : card.kind === 'reply' ? 38 : card.kind === 'ask' ? 34 : 38}px ${SANS}`;
  const lines = wrap(g, card.kind === 'say' || card.kind === 'ask' ? `“${card.title}”` : card.title, CW - pad * 2);
  if (card.kind === 'pill') return drawPill(c, card.title);
  const lh = card.kind === 'say' ? 54 : 46, valueH = card.value ? 44 : 0, H = Math.ceil(pad * 2 + lines.length * lh + valueH);
  c.width = CW; c.height = H;
  g.clearRect(0, 0, CW, H);
  const r = card.kind === 'ask' ? H / 2 : 26;
  g.beginPath(); g.roundRect(3, 3, CW - 6, H - 6, Math.min(r, (H - 6) / 2));
  g.fillStyle = card.kind === 'say' ? 'rgba(40,28,8,0.88)' : 'rgba(16,19,26,0.9)'; g.fill();
  g.lineWidth = st === 'plain' || st === 'dim' ? 2 : 4;
  g.strokeStyle = card.kind === 'say' || card.kind === 'ask' ? 'rgba(251,191,36,0.55)' : EDGE[st]; g.stroke();
  g.textBaseline = 'alphabetic';
  g.font = `600 ${card.kind === 'say' ? 44 : card.kind === 'reply' ? 38 : card.kind === 'ask' ? 34 : 38}px ${SANS}`;
  g.fillStyle = card.kind === 'say' || card.kind === 'ask' ? EMBER : st === 'dim' ? '#8f8983' : PAPER;
  lines.forEach((l, i) => g.fillText(l, pad, pad + (i + 1) * lh - 10));
  if (card.value) {
    g.font = `600 30px ${MONO}`; g.fillStyle = card.kind === 'reply' ? MUTED : VALUE[st];
    g.fillText((card.kind === 'thing' ? WORD[st] : '') + card.value, pad, pad + lines.length * lh + 34);
  }
  return H / CW;
}

/** The cards layer of one space. update() each frame after the camera moves, render() after the frame is drawn;
 * rect() for a card on screen. The cards have their own scene, drawn with the same camera after the post passes, so
 * they stand in the world's space and perspective but stay as crisp as the page's own words (no vignette or grain). */
export function createCards(camera: THREE.PerspectiveCamera) {
  const scene = new THREE.Scene();
  const geo = new THREE.PlaneGeometry(1, 1);
  const live = new Map<string, { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; key: string; aspect: number; pos: THREE.Vector3; seen: boolean; al: number; w: number; h: number }>();
  const right = new THREE.Vector3(), up = new THREE.Vector3(), want = new THREE.Vector3(), tmp = new THREE.Vector3();
  // Type cards: troika text, one group per card. A card whose words change keeps showing until its new words are
  // laid out, then swaps, so a change never blinks.
  type Built = ReturnType<typeof buildType> & { aspect: number };
  const types = new Map<string, { shown: Built | null; next: Built | null; key: string; pos: THREE.Vector3; seen: boolean; al: number }>();

  function updateType(c: SpaceCard, vh: number, k: number) {
    let e = types.get(c.id);
    if (!e) { e = { shown: null, next: null, key: '', pos: new THREE.Vector3(), seen: false, al: 0 }; types.set(c.id, e); }
    const key = `${c.center ? 'c' : ''}|${c.wrap ?? ''}|${JSON.stringify(c.lines ?? [])}`;
    if (key !== e.key) {
      e.key = key; e.next?.dispose();
      const entry = e, b = buildType(c.lines ?? [], c.wrap, c.center, (aspect) => {
        if (entry.next !== built) return; // replaced again before it was ready
        built.aspect = aspect; entry.shown?.dispose(); if (entry.shown) scene.remove(entry.shown.group);
        entry.shown = built; entry.next = null; scene.add(built.group);
      });
      const built: Built = Object.assign(b, { aspect: 0 });
      e.next = built;
    }
    const sh = e.shown; if (!sh) return;
    const w = c.w * vh, h = w * sh.aspect;
    if (c.align === 'bottom') want.addScaledVector(up, h / 2);
    if (!e.seen) { e.pos.copy(want); e.seen = true; } else e.pos.copy(want);
    sh.group.position.copy(e.pos); sh.group.quaternion.copy(camera.quaternion); sh.group.scale.setScalar(w / TW);
    e.al += (c.alpha - e.al) * k;
    for (const t of sh.texts) { t.fillOpacity = e.al; t.outlineOpacity = 0.75 * e.al; }
    sh.group.visible = e.al > 0.004;
  }

  function update(cards: readonly SpaceCard[], dt: number) {
    right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1);
    const keep = new Set<string>(), k = 1 - Math.exp(-dt * 7);
    for (const c of cards) {
      keep.add(c.id);
      if (c.kind === 'type') {
        tmp.set(c.at.x, c.at.y, c.at.z);
        const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.max(0.5, tmp.distanceTo(camera.position));
        want.copy(tmp).addScaledVector(right, c.dx * vh).addScaledVector(up, c.dy * vh);
        updateType(c, vh, k);
        continue;
      }
      let e = live.get(c.id);
      if (!e) {
        const canvas = document.createElement('canvas'), map = new THREE.CanvasTexture(canvas);
        map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }));
        mesh.renderOrder = 20; mesh.frustumCulled = false; scene.add(mesh);
        e = { mesh, key: '', aspect: 0.2, pos: new THREE.Vector3(), seen: false, al: 0, w: 0, h: 0 }; live.set(c.id, e);
      }
      const key = `${c.kind}|${c.center ? 'c' : ''}|${c.title}|${c.value ?? ''}|${c.state ?? ''}|${c.lines ? JSON.stringify(c.lines) : ''}`;
      if (key !== e.key) {
        const map = e.mesh.material.map!, cv = map.image as HTMLCanvasElement, w0 = cv.width, h0 = cv.height;
        e.key = key; e.aspect = draw(cv, c);
        // A texture keeps the size it was first sent at: a card whose canvas grew or shrank needs a new one.
        if (cv.width !== w0 || cv.height !== h0) map.dispose();
        map.needsUpdate = true;
      }
      // The view height at the anchor's depth turns the page's units into world units.
      tmp.set(c.at.x, c.at.y, c.at.z);
      const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.max(0.5, tmp.distanceTo(camera.position));
      want.copy(tmp).addScaledVector(right, c.dx * vh).addScaledVector(up, c.dy * vh);
      e.w = c.w * vh; e.h = e.w * e.aspect;
      if (c.align === 'bottom') want.addScaledVector(up, e.h / 2);
      if (!e.seen) { e.pos.copy(want); e.seen = true; } else e.pos.lerp(want, k);
      // Each card turns a little toward the middle of the view, so a column reads as objects standing in space.
      e.mesh.position.copy(e.pos); e.mesh.quaternion.copy(camera.quaternion); e.mesh.rotateY(-c.dx * 0.55); e.mesh.scale.set(e.w, e.h, 1);
      e.al += ((c.state === 'dim' ? 0.45 : 1) * c.alpha - e.al) * k;
      e.mesh.material.opacity = e.al; e.mesh.visible = e.al > 0.004;
    }
    for (const [id, e] of live) if (!keep.has(id)) { e.al *= Math.max(0, 1 - k * 2.5); e.mesh.material.opacity = e.al; e.mesh.visible = e.al > 0.004; }
    for (const [id, e] of types) if (!keep.has(id) && e.shown) { e.al *= Math.max(0, 1 - k * 2.5); for (const t of e.shown.texts) { t.fillOpacity = e.al; t.outlineOpacity = 0.75 * e.al; } e.shown.group.visible = e.al > 0.004; }
  }

  /** Where a card is: its centre in world space, or null. */
  const where = (id: string) => { const e = live.get(id); return e && e.mesh.visible ? e.pos : null; };

  /** A card's box on screen in CSS pixels (for taps), or null when it is not shown. */
  function rect(id: string, W: number, H: number) {
    const e = live.get(id); if (!e || e.al < 0.5) return null;
    const a = tmp.copy(e.pos).addScaledVector(right, -e.w / 2).addScaledVector(up, e.h / 2).project(camera), x0 = (a.x + 1) / 2 * W, y0 = (1 - a.y) / 2 * H;
    const b = tmp.copy(e.pos).addScaledVector(right, e.w / 2).addScaledVector(up, -e.h / 2).project(camera), x1 = (b.x + 1) / 2 * W, y1 = (1 - b.y) / 2 * H;
    return { x0, y0, x1, y1 };
  }

  function render(renderer: THREE.WebGLRenderer) {
    const auto = renderer.autoClear; renderer.autoClear = false; renderer.setRenderTarget(null); renderer.clearDepth(); renderer.render(scene, camera); renderer.autoClear = auto;
  }

  function dispose() {
    for (const e of live.values()) { scene.remove(e.mesh); e.mesh.material.map?.dispose(); e.mesh.material.dispose(); } live.clear(); geo.dispose();
    for (const e of types.values()) { e.shown?.dispose(); e.next?.dispose(); } types.clear();
  }
  return { update, render, where, rect, dispose };
}
