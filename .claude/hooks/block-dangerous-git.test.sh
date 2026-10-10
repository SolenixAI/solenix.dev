#!/bin/bash
# Proves block-dangerous-git.sh: each line is "<expected exit>|<command>". 0 = allowed, 2 = blocked.
# Work ships by pushing branches, so a push must pass; what destroys work must not. A pattern that blocks
# safe work is a landmine too, so both kinds of line are here. Run by scripts/check.sh.
cd "$(dirname "$0")" || exit 1
wrong=0
while IFS='|' read -r want cmd; do
  [ -z "$want" ] && continue
  got=0; jq -n --arg c "$cmd" '{tool_input:{command:$c}}' | bash block-dangerous-git.sh 2>/dev/null || got=$?
  [ "$got" = "$want" ] || { echo "git guard: '$cmd' gave $got, want $want"; wrong=1; }
done <<'CASES'
0|git push -u origin HEAD
0|git push origin jagerdcooper/fix-x
0|git commit -m "fix -f flag docs" && git status
0|cat > notes.md <<'X' (a file that mentions git reset --hard and git push --force)
0|git checkout .claude/settings.json
0|git checkout -- .github/workflows/ci.yml
0|git restore .gitleaks.toml
0|git restore --staged app/page.tsx
0|git switch -c jagerdcooper/fix-y
0|git branch -d merged-branch
2|git push --force origin x
2|git push --force-with-lease
2|git push -f origin x
2|git push origin +x
2|git reset --hard HEAD~1
2|cd app && git reset --hard
2|git clean -fd
2|git clean -f
2|git branch -D x
2|git restore .
2|git checkout .
2|git checkout -- .
CASES
exit $wrong
