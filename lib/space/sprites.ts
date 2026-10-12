// Things in the world: envelopes, invoices, crates, coins, bars of a chart. Each is a small lit glyph that always
// faces the camera and lives in the scene with the suns (it glows, it takes the world's light). The page moves them
// (lib/home/scenes.ts says where each one is at each moment); this layer only draws what it is told.
import * as THREE from 'three';

export type SpriteIcon = "mail" | "invoice" | "box" | "coin" | "bar" | "spark"
export type SpriteTone = "plain" | "hot" | "done" | "dim" | "new"

/** One thing, as the page wants it this frame. Positions and sizes are in world units. */
export interface SpaceSprite { id: string; x: number; y: number; z: number; size: number; icon: SpriteIcon; tone: SpriteTone; alpha: number; aspect?: number }

const TONE: Record<SpriteTone, string> = { plain: '#e9e4dc', hot: '#fb7185', done: '#34d399', dim: '#7a746d', new: '#fbbf24' };

function glyph(icon: SpriteIcon): HTMLCanvasElement {
  const c = document.createElement('canvas'), S = 128; c.width = c.height = S;
  const g = c.getContext('2d')!; g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round';
  g.shadowColor = 'rgba(255,255,255,0.6)'; g.shadowBlur = 10;
  if (icon === 'mail') { g.beginPath(); g.roundRect(14, 32, 100, 66, 10); g.globalAlpha = 0.22; g.fill(); g.globalAlpha = 1; g.stroke(); g.beginPath(); g.moveTo(18, 38); g.lineTo(64, 72); g.lineTo(110, 38); g.stroke(); }
  else if (icon === 'invoice') { g.beginPath(); g.roundRect(30, 12, 68, 104, 8); g.globalAlpha = 0.22; g.fill(); g.globalAlpha = 1; g.stroke(); for (const y of [40, 58, 76]) { g.beginPath(); g.moveTo(44, y); g.lineTo(84, y); g.stroke(); } g.beginPath(); g.moveTo(60, 96); g.lineTo(84, 96); g.stroke(); }
  else if (icon === 'box') { g.beginPath(); g.moveTo(64, 14); g.lineTo(110, 38); g.lineTo(110, 90); g.lineTo(64, 114); g.lineTo(18, 90); g.lineTo(18, 38); g.closePath(); g.globalAlpha = 0.22; g.fill(); g.globalAlpha = 1; g.stroke(); g.beginPath(); g.moveTo(18, 38); g.lineTo(64, 62); g.lineTo(110, 38); g.moveTo(64, 62); g.lineTo(64, 114); g.stroke(); }
  else if (icon === 'coin') { g.beginPath(); g.arc(64, 64, 40, 0, Math.PI * 2); g.globalAlpha = 0.45; g.fill(); g.globalAlpha = 1; g.stroke(); g.font = '700 46px ui-sans-serif, system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 64, 66); }
  else if (icon === 'bar') { g.fillRect(24, 8, 80, 112); }
  else { const r = g.createRadialGradient(64, 64, 0, 64, 64, 60); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, S, S); }
  return c;
}

/** The sprites layer of one space: update() each frame with the page's list. */
export function createSprites(scene: THREE.Scene) {
  const maps = new Map<SpriteIcon, THREE.CanvasTexture>();
  const map = (i: SpriteIcon) => { let m = maps.get(i); if (!m) { m = new THREE.CanvasTexture(glyph(i)); m.colorSpace = THREE.SRGBColorSpace; maps.set(i, m); } return m; };
  const live = new Map<string, THREE.Sprite>();
  const col = new THREE.Color();

  function update(list: readonly SpaceSprite[]) {
    const keep = new Set<string>();
    for (const s of list) {
      keep.add(s.id);
      let sp = live.get(s.id);
      if (!sp) { sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: map(s.icon), transparent: true, depthWrite: false })); sp.renderOrder = 7; scene.add(sp); live.set(s.id, sp); }
      if (sp.material.map !== map(s.icon)) { sp.material.map = map(s.icon); sp.material.needsUpdate = true; }
      sp.position.set(s.x, s.y, s.z); sp.scale.set(s.size, s.size * (s.aspect ?? 1), 1);
      // A little over 1 so the bloom catches the bright ones: they glow like the rest of the world's light.
      sp.material.color.copy(col.set(TONE[s.tone])).multiplyScalar(s.tone === 'dim' ? 0.8 : 1.35);
      sp.material.opacity = s.alpha; sp.visible = s.alpha > 0.004;
    }
    for (const [id, sp] of live) if (!keep.has(id)) { sp.material.opacity *= 0.85; sp.visible = sp.material.opacity > 0.004; if (!sp.visible) { scene.remove(sp); sp.material.dispose(); live.delete(id); } }
  }

  function dispose() { for (const sp of live.values()) { scene.remove(sp); sp.material.dispose(); } live.clear(); for (const m of maps.values()) m.dispose(); maps.clear(); }
  return { update, dispose };
}
