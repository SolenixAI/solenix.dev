// Cards in the world: the things a page shows inside the space (an invoice, an email, a product, what was asked,
// what came back), drawn as lit planes beside a point in the world, facing the camera. Nothing flat is laid over the
// scene: the page says what each card is and where, and the engine draws it, so a card sits in the same light, depth
// and motion as everything else. Offsets and sizes are in view heights at the anchor's depth, so a layout reads the
// same on any screen and at any distance.
import * as THREE from 'three';

export type CardState = "plain" | "hot" | "done" | "dim" | "new"

/** One card, as the page wants it this frame. */
export interface SpaceCard {
  id: string
  /** The world point it sits beside. */
  at: { x: number; y: number; z: number }
  /** Offset from that point along the screen's right and up, and the card's width, in view heights at its depth. */
  dx: number
  dy: number
  w: number
  /** A thing (title and value), something said ("Sort today's inbox"), a reply, or an ask the visitor can tap. */
  kind: "thing" | "say" | "reply" | "ask"
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

function draw(c: HTMLCanvasElement, card: SpaceCard): number {
  const g = c.getContext('2d')!, st = card.state ?? 'plain', pad = 36;
  // Measure first: the card's height follows its words.
  g.font = `600 ${card.kind === 'say' ? 44 : card.kind === 'reply' ? 38 : card.kind === 'ask' ? 34 : 38}px ${SANS}`;
  const lines = wrap(g, card.kind === 'say' || card.kind === 'ask' ? `“${card.title}”` : card.title, CW - pad * 2);
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

/** The cards layer of one space. update() each frame after the camera moves; rect() for a card on screen. */
export function createCards(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
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
      const key = `${c.kind}|${c.title}|${c.value ?? ''}|${c.state ?? ''}`;
      if (key !== e.key) { e.key = key; e.aspect = draw(e.mesh.material.map!.image as HTMLCanvasElement, c); e.mesh.material.map!.needsUpdate = true; }
      // The view height at the anchor's depth turns the page's units into world units.
      tmp.set(c.at.x, c.at.y, c.at.z);
      const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.max(0.5, tmp.distanceTo(camera.position));
      want.copy(tmp).addScaledVector(right, c.dx * vh).addScaledVector(up, c.dy * vh);
      if (!e.seen) { e.pos.copy(want); e.seen = true; } else e.pos.lerp(want, k);
      e.w = c.w * vh; e.h = e.w * e.aspect;
      // Each card turns a little toward the middle of the view, so a column reads as objects standing in space.
      e.mesh.position.copy(e.pos); e.mesh.quaternion.copy(camera.quaternion); e.mesh.rotateY(-c.dx * 0.55); e.mesh.scale.set(e.w, e.h, 1);
      e.al += ((c.state === 'dim' ? 0.45 : 1) * c.alpha - e.al) * k;
      e.mesh.material.opacity = e.al; e.mesh.visible = e.al > 0.004;
    }
    for (const [id, e] of live) if (!keep.has(id)) { e.al *= 1 - k; e.mesh.material.opacity = e.al; e.mesh.visible = e.al > 0.004; }
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

  function dispose() { for (const e of live.values()) { scene.remove(e.mesh); e.mesh.material.map?.dispose(); e.mesh.material.dispose(); } live.clear(); geo.dispose(); }
  return { update, where, rect, dispose };
}
