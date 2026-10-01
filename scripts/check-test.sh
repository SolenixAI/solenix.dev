#!/usr/bin/env bash
# Proves scripts/check.sh works: for every rule, break it on purpose in a
# throwaway clone and confirm the check fails; the untouched clone must pass.
# A check that never fails protects nothing.   npm run check:test
set -uo pipefail
root=$(git rev-parse --show-toplevel)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
pass=0; fail=0

# A clone of the repo as it is on disk now, uncommitted changes included (so new rules are tested before they're committed).
fresh() {
  rm -rf "$tmp/r"; git clone -q --local "$root" "$tmp/r"
  (cd "$root" && git ls-files -co --exclude-standard) | rsync -a --files-from=- "$root/" "$tmp/r/"
}
expect() { # expect <pass|fail> <name>
  if (cd "$tmp/r" && bash scripts/check.sh >/dev/null 2>&1); then got=pass; else got=fail; fi
  if [ "$got" = "$1" ]; then pass=$((pass + 1)); echo "ok    $2"; else fail=$((fail + 1)); echo "WRONG $2 (expected check to $1, it did $got)"; fi
}

fresh; expect pass "untouched repo passes"

fresh; cp "$tmp/r/design/home.html" "$tmp/r/design/home-v2.html"
expect fail "versioned file name (design/home-v2.html)"

fresh; sed -i '' 's#</body>#<p>Get started</p></body>#' "$tmp/r/design/home.html"
expect fail "banned word on the page (\"Get started\")"

fresh; sed -i '' 's#</body>#<a>Tools we use</a></body>#' "$tmp/r/design/home.html"
expect fail "old label \"Tools we use\""

fresh; mkdir -p "$tmp/r/app/(site)"; echo 'export default function P(){return null}' > "$tmp/r/app/(site)/page.tsx"
expect fail "a second homepage (app/(site)/page.tsx)"

fresh; awk 'BEGIN{s=0} /^\[auth\]$/{s=1} /^\[/{if($0!="[auth]")s=0} s&&/^enable_signup/{print "enable_signup = true"; next} {print}' "$tmp/r/supabase/config.toml" > "$tmp/c" && mv "$tmp/c" "$tmp/r/supabase/config.toml"
expect fail "self sign-up switched on"

fresh; awk 'BEGIN{s=0} /^\[auth\.email\]$/{s=1} /^\[/{if($0!="[auth.email]")s=0} s&&/^enable_signup/{print "enable_signup = false"; next} {print}' "$tmp/r/supabase/config.toml" > "$tmp/c" && mv "$tmp/c" "$tmp/r/supabase/config.toml"
expect fail "email sign-in switched off"

fresh; sed -i '' 's/POSTHOG_SNIPPET/NO_SNIPPET/g' "$tmp/r/app/route.ts"
expect fail "homepage analytics removed"

fresh; echo "- Dark only. There is no light theme." >> "$tmp/r/AGENTS.md"
expect fail "the old 'dark only' rule comes back"

fresh; echo '{}' > "$tmp/r/design/ghost.html.artifact.json"
expect fail "orphaned Open Design sidecar"

fresh; rm "$tmp/r/design/roi-model.md"
expect fail "a source of truth goes missing"

fresh; mkdir -p "$tmp/r/app/(site)/law"
expect fail "an industry page (app/(site)/law)"

fresh; sed -i '' 's#</body>#<p>Care plans from $199/month</p></body>#' "$tmp/r/design/home.html"
expect fail "a public price on the homepage"

# The pre-commit hook refuses a staged secret (a made-up key in a known key format).
fresh; printf 'const key = "sk_live_%s"\n' "51Hq3bWd9ExampleOnlyNotARealKeyZx7Tn2Lm8Pq4Rs6Uv0Wy" > "$tmp/r/lib/leak.ts"
if (cd "$tmp/r" && git add lib/leak.ts && bash .githooks/pre-commit >/dev/null 2>&1); then fail=$((fail + 1)); echo "WRONG a staged secret got past pre-commit"; else pass=$((pass + 1)); echo "ok    a staged secret is refused at commit"; fi

# The sign-in link guard (.claude/hooks/sign-in-link-guard.sh).
lg() { jq -n --arg c "$1" '{tool_name:"Bash",tool_input:{command:$c}}' | bash "$root/.claude/hooks/sign-in-link-guard.sh" >/dev/null 2>&1; echo $?; }
if [ "$(lg 'curl -X POST $SUPABASE_URL/auth/v1/admin/generate_link')" = 2 ] && [ "$(lg 'npm run build')" = 0 ]; then pass=$((pass + 1)); echo "ok    sign-in link guard blocks admin link generation, allows the rest"; else fail=$((fail + 1)); echo "WRONG sign-in link guard"; fi

fresh; python3 -c "import re,sys; p=sys.argv[1]; open(p,'w').write(re.sub(r'three.body', 'two-part', open(p).read()))" "$tmp/r/design/home.html"
expect fail "an approved line (the three-body hero) is removed"

# The Claude Code edit guard (.claude/hooks/guard.sh).
hook() { jq -n --arg p "$1" '{tool_input:{file_path:$p}}' | bash "$root/.claude/hooks/guard.sh" >/dev/null 2>&1; echo $?; }
hcheck() { if [ "$(hook "$2")" = "$1" ]; then pass=$((pass + 1)); echo "ok    $3"; else fail=$((fail + 1)); echo "WRONG $3"; fi; }
hcheck 0 "$root/design/home.html" "edit guard: editing the homepage directly is allowed"
hcheck 2 "$root/lib/home-v2.ts" "edit guard: a versioned file name is blocked"
hcheck 0 "$root/lib/marketplace.ts" "edit guard: ordinary code edits are allowed"

echo
echo "check-test: $pass proven, $fail wrong"
exit $((fail > 0))
