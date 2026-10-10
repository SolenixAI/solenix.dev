---
type: Agent Config
title: Issue Tracker
description: Where solenix.dev work is tracked, and how the engineering skills reach it.
tags: [agent-skills, issue-tracker, setup]
sources:
  - id: setup-skill-section-a
    resource: https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md
    title: Setup skill, Section A (Other = one freeform paragraph)
generated: { by: anthropic/claude-haiku-5-5, at: 2026-10-09T16:37:49-02:30 }
status: current
stale_after: 2026-11-09
---

# Issue tracker: Linear

Work for this repo is tracked in Linear, in the Solenix workspace. The engineering skills (`to-spec`, `to-tickets`, `triage`, `wayfinder`, `implement-spec`) create and read issues there with the Linear tools in the agent session. Each issue links to the repo files, pull requests and commits it concerns.

The repo is public. Never write Linear issue IDs, internal names or private notes into repo files or commit messages. Put a public link to the repo in the Linear issue instead.

New issues come from the team template "Default issue", with an explicit assignee: yourself when the work is yours, none for an unclaimed wayfinder ticket. Pass no description, because it replaces the template body; fill each `{…}` slot afterwards with a patch edit.

## Wayfinding operations

Used by `/wayfinder`. The rules (map, ticket labels, claim, blocking, frontier, resolve) live in one place for every repo: the Linear team skill **Wayfinder on Linear**. Read it with the Linear tools (`list_agent_skills`, then `get_agent_skill`) before you chart or work a map.
