---
type: Agent Config
title: Triage Labels
description: The five triage roles and the label strings this repo uses for them.
tags: [agent-skills, triage, setup]
generated: { by: anthropic/claude-haiku-5-5, at: 2026-10-09T16:37:49-02:30 }
status: current
stale_after: 2026-11-09
---

# Triage labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the label strings used in this repo's issue tracker (Linear).

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.
