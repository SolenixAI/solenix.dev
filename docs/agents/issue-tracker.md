---
type: Agent Config
title: Issue Tracker
description: Where solenix.dev work is tracked, and how the engineering skills reach it.
tags: [agent-skills, issue-tracker, setup]
sources:
  - id: setup-skill-section-a
    resource: https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md
    title: Setup skill, Section A (Other = one freeform paragraph)
  - id: wayfinder-skill
    resource: https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md
    title: Wayfinder skill (assignee is the claim; unassigned is unclaimed)
  - id: linear-assigning-issues
    resource: https://linear.app/docs/assigning-issues
    title: Linear docs, assigning issues (assignee is optional at create)
generated: { by: anthropic/claude-opus-5-5, at: 2026-10-10T18:33-02:30 }
verified: 2026-10-10T18:35-02:30
status: current
stale_after: 2026-11-09
---

# Issue tracker: Linear

Work for this repo is tracked in Linear, in the Solenix workspace. The engineering skills (`to-spec`, `to-tickets`, `triage`, `wayfinder`, `implement-spec`) create and read issues there with the Linear tools in the agent session. Each issue links to the repo files, pull requests and commits it concerns.

The repo is public. Never write Linear issue IDs, internal names or private notes into repo files or commit messages. Put a public link to the repo in the Linear issue instead.

New issues start from the team template "Default issue": `save_issue` with `template` "Default issue" (MCP), or `issueCreate` with `teamId` (from the `teams` query) and `templateId` (from the `templates` query) (GraphQL). Set the assignee: `me` when the work is yours, `null` for an unclaimed wayfinder ticket. A description replaces the template body, so pass none. Then fill each `{…}` slot: call `save_issue` with the issue `id` and its `patch` parameter (one replace per slot).

## Wayfinding operations

Used by `/wayfinder`. The rules live in one place for every repo: the Linear team skill **Wayfinder on Linear**. Read it with the Linear tools (`list_agent_skills`, then `get_agent_skill`) before you chart or work a map.
