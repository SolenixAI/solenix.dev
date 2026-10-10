// The night ground as a literal, for the first frame: it paints before any stylesheet or token resolves, so a
// reload can never flash white. It is --bg from design/tokens.css, written out because no var() exists yet;
// scripts/check.sh fails if the two ever differ.
export const GROUND = "#0b0d12"
export const GROUND_CSS = `html,body{background:${GROUND};color-scheme:dark}`
