#!/usr/bin/env bash
# Stop hook: Claude can't finish a turn while the repo breaks an AGENTS.md rule.
out=$(bash "$CLAUDE_PROJECT_DIR/scripts/check.sh" 2>&1) && exit 0
jq -n --arg r "Repo rules are broken (scripts/check.sh). Fix these before stopping:
$out" '{decision: "block", reason: $r}'
