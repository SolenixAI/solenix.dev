// The figure-eight's stops: where the k-th of n stops sits along the orbit as the scroll inks it in.
// Shared by the engine (lib/space/engine.ts), which draws the orbit, and the homepage (lib/home/scene.ts),
// which pins its stop markers to it.
export const INK0 = 0.1, INK_SPAN = 0.9;

export function orbitStop(k: number, n: number): number {
  return INK0 + (k + 0.5) / n * INK_SPAN;
}
