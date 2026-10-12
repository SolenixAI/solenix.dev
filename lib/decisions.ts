// The decisions gate. A line of DESIGN.md's "## Decisions" that ends in <!-- bans: /pattern/flags in <paths> --> says
// what the decision forbids and where. Every file under those paths must be free of the words, so a decision reaches
// every copy it could be contradicted by, not only the document it was written in. scripts/decisions-check.ts runs it.

export type Ban = { line: number; pattern: RegExp; paths: string[] }
export type File = { path: string; text: string }

/** Each bans comment in a markdown document, with its line number. */
export function bansIn(markdown: string): Ban[] {
  return markdown.split("\n").flatMap((text, i) => {
    const m = text.match(/<!--\s*bans:\s*\/(.+)\/([a-z]*)\s+in\s+(.+?)\s*-->/)
    return m ? [{ line: i + 1, pattern: new RegExp(m[1], m[2]), paths: m[3].split(/\s+/).filter(Boolean) }] : []
  })
}

/** Whether a file is one of the paths, or lies under one of them (a folder names everything inside it). */
export const inScope = (file: string, paths: string[]) => paths.some((p) => file === p || file.startsWith(`${p}/`))

/** Each line of the files that the pattern matches, as "path:line: text" (the text trimmed to 120 characters). */
export function hitsIn(ban: Ban, files: File[]): string[] {
  return files.flatMap((f) => f.text.split("\n").flatMap((line, i) =>
    ban.pattern.test(line) ? [`${f.path}:${i + 1}: ${line.trim().slice(0, 120)}`] : []))
}
