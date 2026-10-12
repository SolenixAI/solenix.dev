// The world's stage: the fixed sky behind a page and its canvas. Until the world's first frame is drawn, the stage is
// the page colour, and the world fades up from it: no still picture of the world, ever (DESIGN.md, Decisions). The
// canvas stays hidden until its first frame is drawn, because an undrawn canvas can composite white.
// While the world shows, the page's content and footer sit above it. Rendered by components/space/world.tsx on
// every page that shows the world.
export const STAGE_CSS = `
.world { position: fixed; inset: 0; z-index: 0; background: var(--bg); pointer-events: none; }
.world canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.world #gl { opacity: 0; }
.world.gl-on #gl { opacity: 1; transition: opacity 400ms ease; }
.world.gl-on #gl.dip { opacity: 0; }
.world:not([hidden]) ~ main, .world:not([hidden]) ~ footer { position: relative; z-index: 2; }
`.trim()
