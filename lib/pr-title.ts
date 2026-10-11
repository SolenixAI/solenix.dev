// A pull request's title is the line main keeps (squash merges use it as the commit subject), so it reads like every
// other title in the history: one plain sentence about what changes for a person, sentence case, no commit-type prefix,
// no closing full stop. scripts/pr-title.ts runs this on every pull request (.github/workflows/pr-title.yml).

/** What is wrong with a pull request title; empty means it passes. */
export function prTitleProblems(title: string): string[] {
  const t = title.trim(), out: string[] = []
  if (t.length < 12 || t.length > 120) out.push(`is ${t.length} characters: write one plain sentence of 12 to 120`)
  // A commit type is one of the conventional set, lower case; "Agents: …" is a subject, not a prefix.
  if (/^(feat|fix|chore|docs|refactor|test|ci|build|perf|style|revert)(\([^)]*\))?!?:/.test(t)) out.push(`starts with a commit-type prefix ("${t.split(":")[0]}:"): say what changes, in a sentence`)
  // A first word in plain lower-case letters is a sentence not started; a code name (next.config, useEffect) is kept as written.
  else if (/^[a-z]+$/.test(t.split(/\s/)[0])) out.push("starts with a lower-case word: start with a capital, as a sentence does")
  if (/\.$/.test(t) && !/\.\.\.$/.test(t)) out.push("ends with a full stop: titles carry none")
  if (/^\[?wip\b|^\[draft\]|^draft:/i.test(t)) out.push("is marked work in progress: open the PR as a draft instead")
  return out
}
