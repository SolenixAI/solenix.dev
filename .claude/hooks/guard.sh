#!/usr/bin/env bash
# PreToolUse guard for Write/Edit/MultiEdit. Blocks the two mistakes that
# caused divergence here: versioned copies and hand-edits to Open Design files.
path=$(jq -r '.tool_input.file_path // empty')
[ -z "$path" ] && exit 0
name=$(basename "$path")

if echo "$name" | grep -qE '[-_.]v[0-9]+(\.|$)'; then
  echo "Blocked: \"$name\" is a versioned file name. Keep one file and change it in place; history lives in git and Open Design." >&2
  exit 2
fi

case "$path" in
  */design/*.html)
    echo "Blocked: $path is an Open Design file. Change it through Open Design (Studio, Solenix design system selected), not by hand." >&2
    exit 2 ;;
esac
exit 0
