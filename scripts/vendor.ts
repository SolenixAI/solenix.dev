// Files the pages load, copied from the installed npm packages into public/vendor, so the site
// depends on nothing outside itself. package.json is the one source of each version.
// Generated on every `npm run dev` and `npm run build` (predev, prebuild); never committed.
//   fonts: Sora and JetBrains Mono variable fonts, with @font-face rules in /vendor/fonts.css
// three.js and the space engine are not copied: the pages get them through Next's bundle, never from /vendor.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"

const OUT = "public/vendor"
rmSync(OUT, { recursive: true, force: true })
const put = (from: string, to: string) => {
  mkdirSync(path.dirname(to), { recursive: true })
  copyFileSync(from, to)
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
    const file = block[0].match(/url\(\.\/files\/([^)]+)\)/)?.[1]
    if (!file) throw new Error(`vendor: no font file in ${pkg}`)
    put(path.join(dir, "files", file), path.join(OUT, "fonts", file))
    css += block[0]
      .replace(/font-family:\s*'[^']*'/, `font-family: '${family}'`)
      .replace(/font-display:\s*\w+/, "font-display: optional")
      .replace(/url\(\.\/files\//, "url(fonts/") + "\n" // relative: works on the site and from a local folder
  }
}
writeFileSync(path.join(OUT, "fonts.css"), css)
if (!existsSync(path.join(OUT, "fonts", "sora-latin-wght-normal.woff2"))) throw new Error("vendor: the Sora latin file is missing")
console.log(`vendor: ${FONTS.length} font families in ${OUT}`)
