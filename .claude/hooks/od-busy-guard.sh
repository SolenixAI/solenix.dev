#!/usr/bin/env bash
# PreToolUse guard for Bash. While an Open Design run is writing to design/,
# block git commands that would rewrite those files under it (stash, checkout,
# restore, reset). A run counts as active when its event log changed in the
# last 2 minutes and has no "end" event.
cmd=$(jq -r '.tool_input.command // empty')
# Only a git command at the start of a shell command counts, not the words in a commit message.
echo "$cmd" | grep -qE '(^|[;&|(]|&&)[[:space:]]*git[[:space:]]+(stash|checkout|restore|reset)([[:space:]]|$)' || exit 0
runs="$HOME/Library/Application Support/Open Design/namespaces/release-stable/data/runs"
while IFS= read -r f; do
  grep -q '"event":"end"' "$f" || {
    echo "Blocked: an Open Design run is still writing ($(basename "$(dirname "$f")")). Wait for it to end before touching design/ with git." >&2
    exit 2
  }
done < <(find "$runs" -name events.jsonl -mmin -2 2>/dev/null)
exit 0
