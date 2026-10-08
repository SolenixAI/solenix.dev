// The site's fonts, served from the site itself (scripts/vendor.mjs copies them from npm).
// One source for every page: raw HTML pages get fontHead() from lib/site-page.ts, React pages
// render the same links in app/layout.tsx. The main face is preloaded, so it is almost always
// there before the first paint; if it is late, font-display: optional keeps the system face.
export const FONT_CSS = "/vendor/fonts.css"
export const FONT_PRELOAD = "/vendor/fonts/sora-latin-wght-normal.woff2"
export const fontHead = () =>
  `<link rel="preload" href="${FONT_PRELOAD}" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${FONT_CSS}">`
