// The world's stage: the fixed sky behind a page, its canvas, and the still of the world's own first frame
// (public/space/poster*.webp) that paints with the page, so the 3D sky fades in over the same picture and never pops
// in. The canvas stays hidden until its first frame is drawn: an undrawn canvas can composite white. Regenerate the
// posters when the world's look changes. Rendered by components/space/world.tsx on every page that shows the world.
export const STAGE_CSS = `
.world { position: fixed; inset: 0; z-index: 0; background: var(--bg); pointer-events: none; }
.world canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.fallback { position: absolute; inset: 0; display: grid; place-items: center; background: url(/space/poster.webp) 80% 45% / cover no-repeat, url(data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAABwBgCdASpAACgAPrVKnkwnL6KiLVZrafAWiWdr21u9FBrqCEKc+CV92OdcmPMAHgpNU/eNzTdac//MouAA/vNDxMy8zWn0gak3/IDGzARPL2NVwjrLdYAk6TLPH004FajsJty5i7a0WTvExDwU0HrosITW7qDZQECu9ZXkVOkFqBMZ/vqJDHQjMYs6+7BZNP+mICjQdtXenLk0hFF4UnC5eG1tEKsUQagTZhDKe8aIeSyTdPExdxf5+1mEAA==) center / cover no-repeat, var(--bg); }
@media (max-aspect-ratio: 3/4) { .fallback { background-image: url(/space/poster-phone.webp), url(data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAABQBQCdASoeAEAAPrVKn0unJCKlMBQKAOAWiWcAzfws//1dLObvjIAmVCH5WGo0beIzL6AA/viSU30Rprkva6K5lhwn/h8HE/F4Rzp5DtSeIocaqlHTuob6v7FnWrrYJRYM2ykg+KJn2B+FFj+fYdDMhxt1xFkIA/PZv5rbOcHQtAPgkSWUG6zjd6TkjcLFCJJZYAAA); } }
.fallback svg { width: min(78vw, 900px); translate: 8% -12%; }
.world #gl { opacity: 0; }
.world.gl-on #gl { opacity: 1; }
`.trim()
