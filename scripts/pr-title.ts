// Checks the pull request title in PR_TITLE against lib/pr-title.ts. Run by .github/workflows/pr-title.yml.
import { prTitleProblems } from "../lib/pr-title.ts"

const title = process.env.PR_TITLE ?? ""
const problems = prTitleProblems(title)
for (const p of problems) console.log(`pr-title: "${title}" ${p}`)
process.exit(problems.length ? 1 : 0)
