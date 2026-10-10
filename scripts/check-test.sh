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
  # A file deleted in the working tree is still in the commit the clone came from: remove it from the copy too.
  (cd "$root" && git ls-files) | while read -r f; do [ -e "$root/$f" ] || rm -f "$tmp/r/$f"; done
  # Dependencies are installed in the repo, not in the copy (node_modules is ignored): link them, or tsc fails in every copy.
  [ -e "$root/node_modules" ] && ln -sfn "$root/node_modules" "$tmp/r/node_modules"
}
expect() { # expect <pass|fail> <name>
  if (cd "$tmp/r" && bash scripts/check.sh >/dev/null 2>&1); then got=pass; else got=fail; fi
  if [ "$got" = "$1" ]; then pass=$((pass + 1)); echo "ok    $2"; else fail=$((fail + 1)); echo "WRONG $2 (expected check to $1, it did $got)"; fi
}
# run_check [VAR=value ...]: runs check.sh in the clone with extra environment; its output goes to out, its exit code to rc.
run_check() { out=$(cd "$tmp/r" && env "$@" bash scripts/check.sh 2>&1); rc=$?; }
# saw <needle> <name>: the last run failed and printed the needle. A failure for some other reason is not proof.
saw() {
  if [ "$rc" -ne 0 ] && grep -qF "$1" <<<"$out"; then pass=$((pass + 1)); echo "ok    $2"
  else fail=$((fail + 1)); echo "WRONG $2 (check did not fail naming: $1)"; fi
}
# saw_pass <needle> <name>: the last run passed and printed the needle (a loud skip, never a silent one).
saw_pass() {
  if [ "$rc" -eq 0 ] && grep -qF "$1" <<<"$out"; then pass=$((pass + 1)); echo "ok    $2"
  else fail=$((fail + 1)); echo "WRONG $2 (check did not pass with: $1)"; fi
}

fresh; expect pass "untouched repo passes"

fresh; cp "$tmp/r/design/home.html" "$tmp/r/design/home-v2.html"
expect fail "versioned file name (design/home-v2.html)"

fresh; sed -i '' 's#</body>#<p>Get started</p></body>#' "$tmp/r/design/home.html"
expect fail "banned word on the page (\"Get started\")"

fresh; sed -i '' 's#</body>#<script>console.log(1)</script></body>#' "$tmp/r/design/home.html"
expect fail "a hand-written inline script on the homepage"

fresh; sed -i '' 's#</body>#<a>Tools we use</a></body>#' "$tmp/r/design/home.html"
expect fail "old label \"Tools we use\""

fresh; echo 'export default function P(){return null}' > "$tmp/r/app/route.ts"
expect fail "a second homepage (app/route.ts)"

fresh; sed -i '' 's|colorScheme: "dark"|colorScheme: "light dark"|' "$tmp/r/app/layout.tsx"
expect fail "the root layout follows the device (the site is dark only)"

fresh; sed -i '' 's|<Analytics host={SITE_HOST} />||' "$tmp/r/app/(site)/layout.tsx"
expect fail "homepage analytics removed"

fresh; sed -i '' 's|<SpaceWorld />||' "$tmp/r/app/(site)/layout.tsx"
expect fail "the 3D world not mounted in the layout"

# A locked skill: the check must name it (the exit code alone also fails on unrelated rules in a bare clone).
locked_named() { # locked_named <file> <name>
  run_check; saw "check: locked skill $1" "$2"
}
fresh; f="$tmp/r/.agents/skills/tdd/SKILL.md"; awk 'NR==2{print "disable-model-invocation: true # upstream flag"}1' "$f" > "$f.new" && mv "$f.new" "$f"
locked_named .agents/skills/tdd/SKILL.md "a skill locked again by an install or update (SKILL.md)"
fresh; printf 'policy:\n  allow_implicit_invocation: false\n' >> "$tmp/r/.agents/skills/tdd/agents/openai.yaml"
locked_named .agents/skills/tdd/agents/openai.yaml "a skill locked again for Codex (agents/openai.yaml)"

# The theme decision is dark only (DESIGN.md). A doc that says the portal follows the device contradicts it.
fresh; echo "- The portal follows the device (light or dark)." >> "$tmp/r/AGENTS.md"
run_check; saw "contradicts the theme decision" "AGENTS.md says the portal follows the device (the old theme decision comes back)"

# The design-findings baseline runs from the launcher in this repo, on a machine with no Impeccable plugin (CI has none).
fresh; for i in 1 2 3 4 5 6; do sed -i '' 's|</body>|<div style="box-shadow: 0 0 40px #f59e0b"></div></body>|' "$tmp/r/design/home.html"; done
run_check HOME="$tmp/nohome" IMPECCABLE_HOME="$HOME/.impeccable"
saw "check: impeccable found" "homepage design findings above the Impeccable baseline (no plugin on the machine)"

# A tool a rule needs: CI installs every tool scripts/check.sh calls, so a missing one fails the check there.
# On a laptop the rule skips, loudly, and the rest still runs.
fresh; rm "$tmp/r/.claude/skills/impeccable/scripts/impeccable"
run_check CI=1; saw "impeccable is not installed" "the Impeccable launcher missing in CI fails the check (it does not skip)"
fresh; run_check CI=1 ACTIONLINT=/nonexistent/actionlint
saw "actionlint is not installed" "actionlint missing in CI fails the check (it does not skip)"
fresh; run_check CI=1 ZIZMOR=/nonexistent/zizmor
saw "zizmor is not installed" "zizmor missing in CI fails the check (it does not skip)"
fresh; run_check ACTIONLINT=/nonexistent/actionlint
saw_pass "skip: actionlint is not installed" "a laptop without actionlint skips it loudly and the rest still passes"

# The site is dark only: no color-scheme may list both light and dark, and light-dark() pairs are written once, in the tokens.
fresh; printf 'export const pair = "light-dark(#fff, #000)"\n' > "$tmp/r/lib/pair-probe.ts"
run_check; saw "a light-dark() pair outside design/tokens.css" "a light-dark() pair written outside the tokens"
fresh; printf ':root { color-scheme: dark light; }\n' >> "$tmp/r/design/tokens.css"
run_check; saw "(color-scheme lists light and dark)" "a color-scheme that lists light and dark (the page follows the device)"

# Colours come from the tokens by name, in every syntax; pure black stays free (a shadow or a scrim).
for c in 'rgb(244 242 238)' 'hsl(40 20% 95%)' 'oklch(0.97 0.01 80)' 'color(display-p3 1 0.5 0)' '#fff8'; do
  fresh; printf '<p style="color: %s">x</p>\n' "$c" >> "$tmp/r/articles/proof-flood/index.html"
  run_check; saw "raw colour \"$c\"" "an article with a raw colour, $c"
done
fresh; printf '<p style="background: rgb(0 0 0 / 50%%)">x</p>\n' >> "$tmp/r/articles/proof-flood/index.html"
expect pass "an article with pure black (rgb(0 0 0 / 50%)) still passes"

# Every resource a page loads comes from solenix.dev: images, frames, video, objects, srcset candidates, CSS and module URLs.
fresh; sed -i '' 's|</body>|<img src="https://cdn.example.test/img.png" alt=""><iframe src="https://cdn.example.test/frame"></iframe><video poster="https://cdn.example.test/poster.jpg"></video><img src="/a.png" srcset="/a.png 1x, https://cdn.example.test/second.png 2x" alt=""><object data="https://cdn.example.test/object.swf"></object></body>|' "$tmp/r/design/home.html"
run_check
saw "cdn.example.test/img.png" "an image from another host (img src)"
saw "cdn.example.test/frame" "a frame from another host (iframe src)"
saw "cdn.example.test/poster.jpg" "a video poster from another host"
saw "cdn.example.test/second.png" "a second srcset candidate from another host"
saw "cdn.example.test/object.swf" "an object from another host (object data)"
fresh; printf '.probe{background:url(//cdn.example.test/bg.png)}\n' >> "$tmp/r/design/tokens.css"
printf 'export const mod = import("//cdn.example.test/mod.js")\n' > "$tmp/r/lib/import-probe.ts"
sed -i '' 's|</body>|<script type="importmap">{"imports":{"probe":"//cdn.example.test/map.js"}}</script></body>|' "$tmp/r/design/home.html"
run_check
saw "//cdn.example.test/bg.png" "a protocol-relative CSS url()"
saw "an ES import from another host" "a protocol-relative ES import"
saw "//cdn.example.test/map.js" "a protocol-relative import map entry"

fresh; rm "$tmp/r/design/approved.md"
expect fail "a source of truth goes missing"

fresh; python3 -m http.server 8799 --bind 127.0.0.1 --directory "$tmp" >/dev/null 2>&1 & srv=$!; sleep 1
SITE_URL=http://127.0.0.1:8799/missing expect fail "local site answers 404"
kill "$srv" 2>/dev/null

fresh; mkdir -p "$tmp/r/app/(site)/law"
expect fail "an industry page (app/(site)/law)"

fresh; rm "$tmp/r/.agents/product-marketing.md"; ln -s ../PRODUCT.md "$tmp/r/.agents/product-marketing.md"
expect fail "the marketing context is a link to PRODUCT.md"

fresh; sed -i '' 's/^\*\*One-liner:\*\*.*/**One-liner:** Solenix is a tech expert for small businesses./' "$tmp/r/.agents/product-marketing.md"
expect fail "the one-liner in the marketing context differs from PRODUCT.md"

fresh; sed -i '' 's/^\*\*One-liner:\*\*.*/**One-liner:** Solenix is one tech expert for small businesses./' "$tmp/r/.agents/product-marketing.md"
expect fail "the one-liner in the marketing context is trimmed (drops the location)"

fresh; sed -i '' 's/^\*\*Target companies:\*\*.*/**Target companies:** small businesses./' "$tmp/r/.agents/product-marketing.md"
expect fail "the audience in the marketing context is trimmed (drops the location)"

fresh; sed -i '' 's/^\*\*Target companies:\*\*.*/**Target companies:** small businesses in Newfoundland./' "$tmp/r/.agents/product-marketing.md"
expect fail "the audience in the marketing context differs from PRODUCT.md"

fresh; sed -i '' 's#</body>#<p>Care plans from $199/month</p></body>#' "$tmp/r/design/home.html"
expect fail "a public price on the homepage"

fresh; printf "import * as THREE from 'three'\nexport const world = THREE\n" > "$tmp/r/lib/second-world.ts"
expect fail "a second 3D world outside lib/space (an import of three)"

# One owner per repo fact (scripts/sot-check.ts): a second copy of the site origin, the GitHub org, the marketplace repo
# or the catalog key fails the check, and the check names the copy. This file is scanned by that same gate, so every
# planted copy is built here from parts: no line of this file holds a whole copy of a repo fact.
part_host="solenix" part_tld=".dev" part_org="Solenix" part_ai="AI" part_repo="agents" part_key="catalog"
printed() { # printed <text the check must print> <name>
  out=$(cd "$tmp/r" && bash scripts/check.sh 2>&1) # captured first: under pipefail, check's own exit 1 would hide grep's match
  if grep -qF "$1" <<<"$out"; then pass=$((pass + 1)); echo "ok    $2"; else fail=$((fail + 1)); echo "WRONG $2 (check did not print: $1)"; fi
}
fresh; printf 'export const origin = "https://%s%s"\n' "$part_host" "$part_tld" > "$tmp/r/lib/second-origin.ts"
printed "sot: lib/second-origin.ts:1 copies the site origin" "a second copy of the site origin (lib/second-origin.ts)"
fresh; printf 'export const org = "%s%s"\n' "$part_org" "$part_ai" > "$tmp/r/lib/second-org.ts"
printed "sot: lib/second-org.ts:1 copies the GitHub org" "a second copy of the GitHub org (lib/second-org.ts)"
fresh; printf 'export const slug = "%s%s/%s-marketplace"\n' "$part_org" "$part_ai" "$part_repo" > "$tmp/r/lib/second-repo.ts"
printed "sot: lib/second-repo.ts:1 copies the marketplace repo" "a literal copy of the marketplace slug (lib/second-repo.ts)"
fresh; printf 'export const channel = (ref: string) => `%s:${ref}`\n' "$part_key" > "$tmp/r/lib/second-channel.ts"
printed "sot: lib/second-channel.ts:1 copies the catalog key" "a second copy of the bus channel (lib/second-channel.ts)"
fresh; printf 'export const channel = (ref: string) => "%s:" + ref\n' "$part_key" > "$tmp/r/lib/second-channel-concat.ts"
printed "sot: lib/second-channel-concat.ts:1 copies the catalog key" "a quoted concatenation of the bus channel (lib/second-channel-concat.ts)"

# The pre-commit hook refuses a staged secret (a made-up key in a known key format).
fresh; printf 'const key = "sk_live_%s"\n' "51Hq3bWd9ExampleOnlyNotARealKeyZx7Tn2Lm8Pq4Rs6Uv0Wy" > "$tmp/r/lib/leak.ts"
if (cd "$tmp/r" && git add lib/leak.ts && bash .githooks/pre-commit >/dev/null 2>&1); then fail=$((fail + 1)); echo "WRONG a staged secret got past pre-commit"; else pass=$((pass + 1)); echo "ok    a staged secret is refused at commit"; fi

fresh; python3 -c "import re,sys; p=sys.argv[1]; open(p,'w').write(re.sub(r'three.body', 'two-part', open(p).read()))" "$tmp/r/design/home.html"
expect fail "an approved line (the three-body hero) is removed"

echo
echo "check-test: $pass proven, $fail wrong"
exit $((fail > 0))
