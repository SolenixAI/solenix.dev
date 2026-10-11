// The site's one 3D world. The layout mounts it once (components/space/world.tsx): the stage and the canvas stay in
// the page for as long as the layout does, and the engine (lib/space/engine.ts) draws on that canvas. A page binds
// to the world while it is shown and unbinds when it leaves. Nothing is disposed, so the canvas is never torn down;
// the world only stops drawing while no page is bound to it.
//
// The engine module loads in the background when the layout mounts. The engine itself is created the first time a
// page binds, so a page that shows no world starts none, and the first frame is drawn with that page's own story.
import type { Space, SpaceEnv, SpaceFrame, SpaceParams, SpaceStory, SpaceWell } from "./engine";

/** What a page gives the world while it is shown. Each function is read at the moment it is needed, so the page may change its state. */
export type SpaceBinding = {
  wells: readonly SpaceWell[];
  motion: () => boolean;
  story: SpaceStory;
  openBand: (section: string) => { y0: number; y1: number; stacked: number } | null;
  onFrame: (frame: SpaceFrame) => void;
  onLock: (holding: boolean) => void;
  onPayoff: () => void;
  onResize: () => void;
};

type Engine = typeof import("./engine");

const NO_HERO = { el: 0, dist: 0, lens: 0 };
// Read only while a page is bound: the loop stops with the binding, so no frame ever reads these.
const NO_PARAMS = {} as SpaceParams;

/** The world, with its engine module loaded by `load` (the site loads ./engine; a test passes a fake). */
export function makeSpaceWorld(load: () => Promise<Engine>) {
  let engine: Engine | null = null;
  let loading: Promise<Engine> | null = null;
  let stage: HTMLElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let current: SpaceBinding | null = null;
  let space: Space | null = null;
  // One probe element for the world's life: the engine reads tokens through it while it runs.
  let probe: HTMLElement | null = null;

  // Creates the engine once the module is in, the canvas is mounted and a page is bound.
  function ensure() {
    if (space || !engine || !current || !stage || !canvas) return;
    const s = stage, c = canvas;
    // Colours come from the design tokens, as the browser resolves them: a probe element gives each token as it computes.
    const p = (probe ??= document.createElement("i"));
    p.style.display = "none";
    document.body.append(p);
    const env: SpaceEnv = {
      canvas: c,
      stage: s,
      token: (n) => { p.style.color = `var(${n})`; return getComputedStyle(p).color; },
      motion: () => (current ? current.motion() : false),
      story: {
        params: () => (current ? current.story.params() : NO_PARAMS),
        get hero() { return current ? current.story.hero : NO_HERO; },
        get stations() { return current ? current.story.stations : []; },
        get views() { return current ? current.story.views : {}; },
        section: () => (current ? current.story.section() : ""),
        pings: () => (current ? current.story.pings() : 0),
      },
      wells: current.wells,
      openBand: (section) => (current ? current.openBand(section) : null),
      onFrame: (f) => current?.onFrame(f),
      onReady: () => s.classList.add("gl-on"),
      onNoWebGL: () => s.classList.add("gl-off"),
      onLock: (holding) => current?.onLock(holding),
      onPayoff: () => current?.onPayoff(),
      onResize: () => current?.onResize(),
    };
    try {
      space = engine.createSpace(env);
    } catch (e) {
      // A world that could not start keeps nothing in the page; the next bind tries again with a new probe.
      p.remove();
      probe = null;
      console.error("the 3D world could not start", e);
    }
  }

  return {
  /** The layout mounts the world: keep its stage and canvas, and load the engine module in the background. */
  mount(s: HTMLElement, c: HTMLCanvasElement) {
    stage = s;
    canvas = c;
    void (loading ??= load()).then((m) => { engine = m; ensure(); }, (e) => console.error("the 3D world did not load", e));
  },
  /** A page is shown and takes the world: from now on its story and labels draw. */
  bind(b: SpaceBinding) {
    current = b;
    if (space) space.setActive(true);
    else ensure();
  },
  /** The page leaves: the world stops drawing and keeps its canvas and its engine. */
  unbind(b: SpaceBinding) {
    if (current !== b) return;
    current = null;
    space?.setActive(false);
  },
  };
}

/** The site's world. */
export const spaceWorld = makeSpaceWorld(() => import("./engine"));
