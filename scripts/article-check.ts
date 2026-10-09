#!/usr/bin/env node
// Commit gate for articles/: runs the same rules as the build (lib/article-rules.ts).
// Folders that start with "_" (the template) are not articles and are skipped.
import { readdir, readFile } from "node:fs/promises"
import { articleProblems } from "../lib/article-rules.ts"

let fail = 0
for (const e of await readdir("articles", { withFileTypes: true }).catch(() => [])) {
  if (!e.isDirectory() || e.name.startsWith("_")) continue
  const html = await readFile(`articles/${e.name}/index.html`, "utf8").catch(() => null)
  const problems = html === null ? ["index.html is missing"] : articleProblems(e.name, html)
  for (const p of problems) { console.log(`check: articles/${e.name}: ${p}`); fail = 1 }
}
process.exit(fail)
