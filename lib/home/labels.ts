// The homepage's label placement: where a tool's stack of things sits beside its world, and where each sun's tag sits
// under its sun, stepped apart from its neighbour and clear of the words. Pure: the measured numbers in, the places out.
// The scene (lib/home/scene.ts) reads the frame and the page, applies these places, and keeps the easing it owns.
//   node --test lib/home/labels.test.ts

/** A box the tags keep clear of: [left, top, right, bottom], already padded. */
export type Box = [number, number, number, number]
/** A sun's place on screen: its tag's index, where it sits, and how far it shows (0 to 1). */
export type Sun = { i: number; x: number; y: number; vis: number }
export type TagPlace = { i: number; x: number; y: number; opacity: number }
/** The easing the page fades with: 0 at a, 1 at b, smooth between. */
export type Smooth = (a: number, b: number, x: number) => number

/** Where a tag may sit: its centre is held this far in from the viewport edge, and the words hold it this far off. */
const EDGE = 10, WORD = 12
/** Two tags this close side by side (between their centres, beyond their half-widths) count as touching. */
const TOUCH = 8
/** A tag fades out as it nears the words, from the full gap down to none across this many pixels. */
const FADE = 28

/**
 * Where each sun's tag sits. Two tags that would touch: the lower one steps down by a whole tag, so neither hides the
 * other. A tag is held inside the viewport. Its opacity is its show, times how far it shows, times how clear it is of the
 * words: a tag that lands on the words fades out.
 */
export function placeTags(suns: Sun[], o: { width: number; tagW: number[]; tagH: number; readBox: Box[]; show: number; smooth: Smooth }): TagPlace[] {
  const pos = suns.map(s => ({ ...s })).sort((a, b) => a.y - b.y)
  const step = o.tagH + 6
  for (let n = 1; n < pos.length; n++) for (let m = 0; m < n; m++)
    if (Math.abs(pos[n].x - pos[m].x) < (o.tagW[pos[n].i] + o.tagW[pos[m].i]) / 2 + TOUCH && pos[n].y - pos[m].y < step) pos[n].y = pos[m].y + step
  return pos.map(p => {
    const hw = o.tagW[p.i] / 2 + EDGE, x = Math.min(Math.max(p.x, hw), o.width - hw)
    const clear = (b: Box) => Math.max(b[0] - (x + hw), (x - hw) - b[2], b[1] - (p.y + WORD), (p.y - WORD) - b[3])
    const gap = o.readBox.length ? Math.min(...o.readBox.map(clear)) : 99
    return { i: p.i, x, y: p.y, opacity: o.show * p.vis * o.smooth(0, FADE, gap) }
  })
}

/**
 * Where a tool's stack sits beside its world: on the world's left when it fits there, else on its right. On a phone it
 * sits centred under the world. Either way it stays in the open sky, between the nav and the words (band; null means
 * the whole height below the top).
 */
export function placeStack(o: { wx: number; wy: number; width: number; height: number; sw: number; sh: number; portrait: boolean; band: { y0: number; y1: number } | null }): { x: number; y: number } {
  const top = o.band ? o.band.y0 : 84, bottom = o.band ? o.band.y1 - 4 : o.height - 16
  const left = o.wx - 56 - o.sw >= 24
  const x = o.portrait ? Math.min(Math.max(o.wx - o.sw / 2, 16), o.width - o.sw - 16) : left ? o.wx - 56 - o.sw : Math.min(o.wx + 56, o.width - o.sw - 24)
  const y = Math.min(Math.max(o.portrait ? o.wy + 40 : o.wy - o.sh / 2, top), Math.max(top, bottom - o.sh))
  return { x, y }
}
