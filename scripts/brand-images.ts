// The brand images (logos, avatar, banners), drawn from the one source of each part:
//   the mark and the sun's light   lib/site-nav.ts
//   colours and the type face       design/tokens.css (dark and light values of light-dark())
// Writes public/brand/out/, which the site serves at /brand/out/ and GitHub profiles copy.
//   npm run brand           write the SVGs, then render avatar.png and apple-touch-icon.png
//   npm run brand -- --check  fail if any file differs from what the sources draw now (the commit check runs this)
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { NAV, markShapes, sunGradient } from "../lib/site-nav.ts"

const OUT = "public/brand/out"
const CSS = readFileSync("design/tokens.css", "utf8")

/** A token's value in one mode, with var() and light-dark() resolved. */
type Mode = "dark" | "light"

function token(name: string, mode: Mode): string {
  const m = CSS.match(new RegExp(`--${name}:\\s*([^;]+);`))
  if (!m) throw new Error(`design/tokens.css has no --${name}`)
  let v = (m[1] ?? "").replace(/\/\*.*?\*\//g, "").replace(/\s+/g, " ").trim()
  const ld = v.match(/^light-dark\(\s*([^,]+?)\s*,\s*(.+?)\s*\)$/)
  if (ld) v = (mode === "light" ? ld[1] : ld[2]) ?? v
  return v.replace(/var\(--([a-z0-9-]+)\)/g, (_, n: string) => token(n, mode))
}
const resolve = (svg: string, mode: Mode) => svg.replace(/var\(--([a-z0-9-]+)\)/g, (_, n: string) => token(n, mode))

const palette = (mode: Mode) => ({
  bg1: token("bg", mode), bg2: token("bg2", mode), line: token("line-solid", mode), text: token("text", mode),
  muted: token("muted", mode), accent: token("accent", mode), sun2: token("sun2", mode), ring: token("ring", mode),
})
const FONT = token("font-text", "dark").replaceAll('"', "'")

function mark(mode: Mode, x: number, y: number, s: number, uid: string, ringWidth?: number) {
  let shapes = resolve(markShapes(`url(#sun${uid})`), mode)
  if (ringWidth) shapes = shapes.replace(/stroke-width="[^"]*"/, `stroke-width="${ringWidth}"`)
  return `<g transform="translate(${x} ${y}) scale(${s / 32})">${shapes}</g>`
}

function banner(mode: Mode, eyebrow: string, title: string, line1: string, line2: string, desc: string) {
  const c = palette(mode), u = mode[0]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="340" viewBox="0 0 1200 340" role="img" aria-label="${title}. ${desc}">
  <defs><linearGradient id="bg${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.bg1}"/><stop offset="1" stop-color="${c.bg2}"/></linearGradient>${resolve(sunGradient(`sun${u}`), mode)}<radialGradient id="glow${u}" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="${c.sun2}" stop-opacity=".22"/><stop offset="1" stop-color="${c.sun2}" stop-opacity="0"/></radialGradient><clipPath id="card${u}"><rect x="1" y="1" width="1198" height="338" rx="24"/></clipPath></defs>
  <rect x="1" y="1" width="1198" height="338" rx="24" fill="url(#bg${u})" stroke="${c.line}" stroke-width="2"/>
  <g clip-path="url(#card${u})">
    <circle cx="1030" cy="400" r="270" fill="url(#glow${u})"/>
    <g fill="none" stroke="${c.ring}" stroke-opacity=".16" stroke-width="2">
      <circle cx="1030" cy="400" r="215"/><circle cx="1030" cy="400" r="280"/><circle cx="1030" cy="400" r="345"/>
    </g>
    <circle cx="1030" cy="400" r="150" fill="url(#sun${u})"/>
    <g fill="${c.ring}"><circle cx="829" cy="321" r="6"/><circle cx="1180" cy="140" r="5"/><circle cx="880" cy="104" r="4"/></g>
  </g>
  ${mark(mode, 70, 66, 30, u)}
  <g font-family="${FONT}">
    <text x="112" y="88" font-size="19" font-weight="600" letter-spacing="3" fill="${c.accent}">${eyebrow}</text>
    <text x="66" y="182" font-size="84" font-weight="700" letter-spacing="-2.5" fill="${c.text}">${title}</text>
    <text x="70" y="240" font-size="31" fill="${c.muted}">${line1}</text>
    <text x="70" y="283" font-size="31" fill="${c.muted}">${line2}</text>
  </g>
</svg>
`
}

/** Org avatar and touch icon: the mark on the dark background, full bleed. */
function avatar() {
  const c = palette("dark")
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><linearGradient id="bgA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.bg1}"/><stop offset="1" stop-color="${c.bg2}"/></linearGradient>${resolve(sunGradient("sunA"), "dark")}<radialGradient id="glowA" cx=".5" cy=".5" r=".5"><stop offset=".4" stop-color="${c.sun2}" stop-opacity=".28"/><stop offset="1" stop-color="${c.sun2}" stop-opacity="0"/></radialGradient></defs>
  <rect width="512" height="512" fill="url(#bgA)"/>
  <circle cx="256" cy="256" r="230" fill="url(#glowA)"/>
  ${mark("dark", 56, 56, 400, "A", 0.8)}
</svg>
`
}

const logo = (mode: Mode) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs>${resolve(sunGradient("sunL"), mode)}</defs>${mark(mode, 0, 0, 32, "L")}</svg>\n`

const NAME = NAV.home.label
const files: Record<string, string> = { "logo-dark.svg": logo("dark"), "logo-light.svg": logo("light"), "avatar.svg": avatar() }
for (const m of ["dark", "light"] as const) {
  files[`banner-org-${m}.svg`] = banner(m, "AI · WEBSITES · OPEN SOURCE", NAME, "AI and websites for small businesses",
    "Open-source tools that make AI agents easy to set up", "AI and websites for small businesses. Open-source tools that make AI agents easy to set up.")
  files[`banner-jager-${m}.svg`] = banner(m, "FOUNDER · SOLENIXAI", "Jager Cooper", "AI and websites for small businesses",
    "Open-source tools for AI agents", `Founder of ${NAME}. AI and websites for small businesses, open-source tools for AI agents.`)
}
// The PNGs are rendered from avatar.svg; this file records which avatar.svg they were rendered from.
const PNG_SOURCE = `${OUT}/png-source.sha256`
const sha = (s: string) => createHash("sha256").update(s).digest("hex")

if (process.argv.includes("--check")) {
  const stale = Object.entries(files).filter(([n, svg]) => !existsSync(`${OUT}/${n}`) || readFileSync(`${OUT}/${n}`, "utf8") !== svg).map(([n]) => n)
  if (!existsSync(PNG_SOURCE) || readFileSync(PNG_SOURCE, "utf8").trim() !== sha(files["avatar.svg"] ?? "")) stale.push("avatar.png, apple-touch-icon.png")
  if (stale.length) {
    console.log(`brand: ${stale.join(", ")} differ from what the sources draw now. Run: npm run brand`)
    process.exit(1)
  }
} else {
  for (const [n, svg] of Object.entries(files)) writeFileSync(`${OUT}/${n}`, svg)
  const { launch } = await import("./browser.ts")
  const browser = await launch()
  try {
    for (const [n, s] of [["avatar.png", 512], ["apple-touch-icon.png", 180]] as const) {
      const page = await browser.newPage({ viewport: { width: s, height: s }, deviceScaleFactor: 1 })
      await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${s}px;height:${s}px}</style>${files["avatar.svg"]}`)
      await page.screenshot({ path: `${OUT}/${n}` })
      await page.close()
    }
  } finally {
    await browser.close()
  }
  writeFileSync(PNG_SOURCE, sha(files["avatar.svg"]) + "\n")
  console.log(`wrote ${Object.keys(files).length} SVGs, avatar.png and apple-touch-icon.png to ${OUT}`)
}
