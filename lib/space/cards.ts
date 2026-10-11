// Cards in the world: the things a page shows inside the space (an invoice, an email, a product, what was asked,
// what came back), drawn as lit planes beside a point in the world, facing the camera. Nothing flat is laid over the
// scene: the page says what each card is and where, and the engine draws it, so a card sits in the same light, depth
// and motion as everything else. Offsets and sizes are in view heights at the anchor's depth, so a layout reads the
// same on any screen and at any distance.
import * as THREE from 'three';

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
// Words set in the space: big Sora headlines with the ember on their em part, a softer line under them. No card
// behind them; a soft dark halo keeps them readable over the suns.
function drawType(c: HTMLCanvasElement, lines: TypeLine[], wrapAt = TW - 40): number {
  const g = c.getContext('2d')!;
  const px = (l: TypeLine) => l.px ?? (l.size === 'h' ? 132 : 56);
  const font = (l: TypeLine, ex?: boolean) => ex ? `600 ${Math.round(px(l) * 0.6)}px ${MONO}` : `${l.weight ?? (l.size === 'h' ? 800 : 500)} ${px(l)}px ${SANS}`;
  const lh = (l: TypeLine) => px(l) * (l.size === 'h' ? 1.0 : 1.45);
  type Word = { t: string; em?: boolean; ex?: boolean; w: number };
  const rows: { l: TypeLine; words: Word[] }[] = [];
  for (const l of lines) {
    const words: Word[] = [];
    for (const p of l.parts) for (const t of p.t.split(/\s+/).filter(Boolean)) { g.font = font(l, p.ex); (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = l.size === 'h' && !p.ex ? '-5px' : '0px'; words.push({ t, em: p.em, ex: p.ex, w: g.measureText(t).width + (p.ex ? 40 : 0) }); }
    let row: Word[] = [], width = 0; const space = px(l) * 0.27;
    for (const w of words) { if (row.length && width + space + w.w > wrapAt) { rows.push({ l, words: row }); row = []; width = 0; } width += (row.length ? space : 0) + w.w; row.push(w); }
    if (row.length) rows.push({ l, words: row });
  }
  const H = Math.ceil(rows.reduce((a, r) => a + lh(r.l), 0) + 60);
  c.width = TW; c.height = H; g.clearRect(0, 0, TW, H);
  let y = 20;
  for (const r of rows) {
    y += lh(r.l); let x = 20; const space = px(r.l) * 0.27, base = y - lh(r.l) * 0.18;
    for (const w of r.words) {
      g.font = font(r.l, w.ex); (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = r.l.size === 'h' && !w.ex ? '-5px' : '0px';
      g.shadowColor = 'rgba(5,6,10,0.75)'; g.shadowBlur = 28;
      if (w.ex) { g.shadowBlur = 0; g.strokeStyle = 'rgba(244,242,238,0.3)'; g.lineWidth = 2; g.beginPath(); const ph = px(r.l) * 0.95; g.roundRect(x, base - ph * 0.78, w.w, ph, ph / 2); g.stroke(); g.fillStyle = MUTED; g.fillText(w.t, x + 20, base - ph * 0.12); }
      else if (w.em) { const gr = g.createLinearGradient(x, 0, x + w.w, 0); gr.addColorStop(0, '#fbbf24'); gr.addColorStop(1, '#f97316'); g.fillStyle = gr; g.fillText(w.t, x, base); }
      else { g.fillStyle = r.l.size === 'h' ? '#efece6' : '#d6d1ca'; g.fillText(w.t, x, base); }
      x += w.w + space;
    }
  }
  return H / TW;
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
  if (card.kind === 'type') return drawType(c, card.lines ?? [], card.wrap);
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

  function update(cards: readonly SpaceCard[], dt: number) {
    right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1);
    const keep = new Set<string>(), k = 1 - Math.exp(-dt * 7);
    for (const c of cards) {
      keep.add(c.id);
      let e = live.get(c.id);
      if (!e) {
        const canvas = document.createElement('canvas'), map = new THREE.CanvasTexture(canvas);
        map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }));
        mesh.renderOrder = 20; mesh.frustumCulled = false; scene.add(mesh);
        e = { mesh, key: '', aspect: 0.2, pos: new THREE.Vector3(), seen: false, al: 0, w: 0, h: 0 }; live.set(c.id, e);
      }
      const key = `${c.kind}|${c.title}|${c.value ?? ''}|${c.state ?? ''}|${c.lines ? JSON.stringify(c.lines) : ''}`;
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
      if (!e.seen) { e.pos.copy(want); e.seen = true; } else e.pos.lerp(want, c.kind === 'type' ? 1 : k);
      // Each card turns a little toward the middle of the view, so a column reads as objects standing in space.
      e.mesh.position.copy(e.pos); e.mesh.quaternion.copy(camera.quaternion); if (c.kind !== 'type') e.mesh.rotateY(-c.dx * 0.55); e.mesh.scale.set(e.w, e.h, 1);
      e.al += ((c.state === 'dim' ? 0.45 : 1) * c.alpha - e.al) * k;
      e.mesh.material.opacity = e.al; e.mesh.visible = e.al > 0.004;
    }
    for (const [id, e] of live) if (!keep.has(id)) { e.al *= Math.max(0, 1 - k * 2.5); e.mesh.material.opacity = e.al; e.mesh.visible = e.al > 0.004; }
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

  function dispose() { for (const e of live.values()) { scene.remove(e.mesh); e.mesh.material.map?.dispose(); e.mesh.material.dispose(); } live.clear(); geo.dispose(); }
  return { update, render, where, rect, dispose };
}
