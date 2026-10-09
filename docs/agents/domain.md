---
type: Agent Config
title: Domain Docs
description: How the engineering skills read this repo's domain docs. Single-context layout.
tags: [agent-skills, domain-docs, setup]
sources:
  - id: seed-domain
    resource: https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/domain.md
    title: Matt Pocock's skills, domain-doc seed template (upstream main, 49dd158)
  - id: single-package
    resource: ../../package.json
    title: solenix.dev package.json, no "workspaces" field
  - id: no-monorepo
    resource: ../../pnpm-workspace.yaml
    title: Absent in solenix.dev, so no monorepo signal
generated: { by: anthropic/claude-haiku-5-5, at: 2026-10-09T16:37:49-02:30 }
status: current
stale_after: 2026-11-09
---

# Domain Docs

How the engineering skills consume this repo's domain documentation when exploring the codebase.

## Layout

This repo is **single-context**: one `GLOSSARY.md` and one `docs/adr/` at the repo root. Evidence: `package.json` has no `workspaces` field, and there is no `pnpm-workspace.yaml`.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root, or
- **`GLOSSARY-MAP.md`** at the repo root if it exists: it points at one `GLOSSARY.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `GLOSSARY-MAP.md` at the root):

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
