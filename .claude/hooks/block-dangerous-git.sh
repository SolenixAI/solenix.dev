#!/bin/bash
# Blocks the git commands that destroy work: hard resets, cleans, force-deleting a branch, discarding every
# change, and every force push. Pushing a branch is how work ships (every change is a PR), and GitHub's
# "protect main" ruleset guards main for everyone, so a plain push passes.
# Each command in the line is checked from its start (split on && || ; |), so text that only mentions a
# command (a commit message, a file being written) never blocks. Proven by block-dangerous-git.test.sh.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

GIT='^git( -C [^ ]+)?'
DANGEROUS_PATTERNS=(
  "$GIT reset( .*)? --hard"
  "$GIT clean( .*)? -[a-zA-Z]*f"
  "$GIT branch( .*)? -D( |$)"
  "$GIT (checkout|restore)( --)? \.$"
  "$GIT push( .*)? (--force[a-z-]*|-f|\+[^ ]+)( |$)"
)

while IFS= read -r part; do
  part=$(echo "$part" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')
  for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if echo "$part" | grep -qE "$pattern"; then
      echo "BLOCKED: '$part' destroys work (pattern '$pattern'). Ask the user to run it." >&2
      exit 2
    fi
  done
done < <(printf '%s\n' "$COMMAND" | sed -E 's/(&&|\|\||;|\|)/\n/g')

exit 0
