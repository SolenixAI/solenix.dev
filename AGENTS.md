<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues are tracked in Linear. See `docs/agents/issue-tracker.md`.

### Triage labels

The five triage roles use the default label names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Engines

Three engines own the work. For each task, use the engine's skill:

- Design, any change a person sees: Impeccable (`impeccable`).
- Engineering: Matt Pocock's skills (`mattpocock/skills`), for example `code-review`, `diagnosing-bugs`, `tdd`, `improve-codebase-architecture`.
- Selling and being found: Corey Haines' skills (`coreyhaines31/marketingskills`), for example `seo-audit`, `copywriting`, `launch`.

Never use Anthropic's look-alike packs, even when they load: `engineering:*`, `marketing:*`, `product-management:*`, `finance:*`. When two skills have the same name (`code-review`, `seo-audit`), use the engine's skill in `.agents/skills/`.
