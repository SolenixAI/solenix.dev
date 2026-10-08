// Files the pages load, copied from the installed npm packages into public/vendor, so the site
// depends on nothing outside itself. package.json is the one source of each version.
// Generated on every `npm run dev` and `npm run build` (predev, prebuild); never committed.
//   three.js: the core, plus every add-on the homepage imports, following each file's imports
//   fonts:    Sora and JetBrains Mono variable fonts, with @font-face rules in /vendor/fonts.css
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"

const OUT = "public/vendor"
rmSync(OUT, { recursive: true, force: true })
const put = (from, to) => {
  mkdirSync(path.dirname(to), { recursive: true })
  copyFileSync(from, to)
}

// three.js: the entry points come from the homepage's own imports.
const THREE = "node_modules/three"
const home = readFileSync("design/home.html", "utf8")
const queue = ["build/three.module.js", ...[...home.matchAll(/from ['"]three\/addons\/([^'"]+)['"]/g)].map((m) => `examples/jsm/${m[1]}`)]
const seen = new Set()
while (queue.length) {
  const rel = queue.shift()
  if (seen.has(rel)) continue
  seen.add(rel)
  const src = readFileSync(path.join(THREE, rel), "utf8")
  put(path.join(THREE, rel), path.join(OUT, "three", rel.replace(/^examples\/jsm\//, "addons/")))
  for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1])))
}

// Fonts: the package's own @font-face rules, renamed to the family the tokens use, and set to
// never swap (font-display: optional): a font that is late keeps the system face for that visit.
const FONTS = [
  { pkg: "@fontsource-variable/sora", family: "Sora" },
  { pkg: "@fontsource-variable/jetbrains-mono", family: "JetBrains Mono" },
]
let css = ""
for (const { pkg, family } of FONTS) {
  const dir = path.join("node_modules", pkg)
  for (const block of readFileSync(path.join(dir, "index.css"), "utf8").matchAll(/@font-face\s*{[^}]*}/g)) {
    const file = block[0].match(/url\(\.\/files\/([^)]+)\)/)[1]
    put(path.join(dir, "files", file), path.join(OUT, "fonts", file))
    css += block[0]
      .replace(/font-family:\s*'[^']*'/, `font-family: '${family}'`)
      .replace(/font-display:\s*\w+/, "font-display: optional")
      .replace(/url\(\.\/files\//, "url(fonts/") + "\n" // relative: works on the site and from a local folder
  }
}
writeFileSync(path.join(OUT, "fonts.css"), css)
if (!existsSync(path.join(OUT, "fonts", "sora-latin-wght-normal.woff2"))) throw new Error("vendor: the Sora latin file is missing")
console.log(`vendor: three.js (${seen.size} files) and ${FONTS.length} font families in ${OUT}`)
