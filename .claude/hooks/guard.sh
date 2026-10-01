#!/usr/bin/env bash
# PreToolUse guard for Write/Edit/MultiEdit. Blocks versioned copies
# (the mistake that caused divergence here).
path=$(jq -r '.tool_input.file_path // empty')
[ -z "$path" ] && exit 0
name=$(basename "$path")

if echo "$name" | grep -qE '[-_.]v[0-9]+(\.|$)'; then
  echo "Blocked: \"$name\" is a versioned file name. Keep one file and change it in place; history lives in git and Open Design." >&2
  exit 2
fi

exit 0
