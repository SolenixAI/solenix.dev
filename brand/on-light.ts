// The brand's colours on a light surface: logo-light.svg (the tab icon on a light browser tab bar) and
// banner-*-light.svg (the GitHub profile banners, shown when GitHub is in light mode).
// The site is dark only, so design/tokens.css has one value per token, and none of them is light.
// scripts/brand-images.ts reads this file. A token not listed here keeps its design/tokens.css value
// on a light surface too.

/** The light surface's colours, by their design/tokens.css name. */
export const ON_LIGHT = {
  bg: "#fbfaf8",
  bg2: "#f3f1ed",
  "line-solid": "#e4e0d9",
  text: "#1c1917",
  muted: "#57534e",
  accent: "#c2410c",
  sun2: "#ea580c",
  ring: "#ea580c",
} as const
