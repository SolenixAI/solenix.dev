#!/bin/bash
# Every skill in this repo is model-invocable, for every agent: any agent
# that starts here may run any skill itself. Upstream skill packs mark some
# skills user-only, and an install or update restores that, so run this after
# every one. `--check` changes nothing: it lists each locked skill and exits 1
# (the repo's check runs it, so a commit with a locked skill fails).
#   Claude Code, Cursor, Copilot: `disable-model-invocation: true` in SKILL.md
#   Codex: `allow_implicit_invocation: false` in agents/openai.yaml (absent = true)
set -euo pipefail
cd "$(dirname "$0")/.."
# One definition of "locked", used to find, to fix and to check. A trailing comment still counts.
SKILL_MD_LOCK='^disable-model-invocation:[[:space:]]*true([[:space:]]|#|$)'
CODEX_LOCK='^[[:space:]]*allow_implicit_invocation:[[:space:]]*false'
# Each agent's skills folder that exists here; grep -r skips the per-agent symlinks to .agents/skills.
dirs=()
for d in .agents/skills .claude/skills .cursor/skills .github/skills .grok/skills; do [ -d "$d" ] && dirs+=("$d"); done
locked() { [ ${#dirs[@]} -eq 0 ] || grep -rlE "$SKILL_MD_LOCK|$CODEX_LOCK" "${dirs[@]}" 2>/dev/null || true; }

case "${1:-}" in
  --check)
    locked_files=$(locked)
    [ -z "$locked_files" ] || { echo "$locked_files" | sed 's|.*|check: locked skill & (run scripts/unlock-skills.sh)|'; exit 1; }
    exit 0 ;;
  "") ;;
  *) echo "usage: scripts/unlock-skills.sh [--check]" >&2; exit 2 ;;
esac
locked | while IFS= read -r f; do
  sed -i.bak -E "/$SKILL_MD_LOCK/d; s/allow_implicit_invocation:[[:space:]]*false/allow_implicit_invocation: true/" "$f" && rm -f "$f.bak"
done
locked_count=$(locked | grep -c . || true)
echo "locked skills left: $locked_count"
[ "$locked_count" = "0" ]
