#!/usr/bin/env bash
# The rules in AGENTS.md, checked. Run by the git pre-commit hook and by
# Claude Code's Stop hook. Exits non-zero with one line per violation.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
fail=0
bad() { echo "check: $1"; fail=1; }

# One version of everything: no versioned file names.
git ls-files --cached --others --exclude-standard \
  | grep -E '(^|/)[^/]*[-_.]v[0-9]+(\.|$)' \
  | while read -r f; do echo "check: versioned file name: $f"; done | grep . && fail=1

# No version labels in the design system or code (AGENTS.md quotes them as examples).
grep -rn -E '· v[0-9]|\(v[0-9]\)|/\* v[0-9]|\bv[0-9] ·' DESIGN.md design/tokens.css app components lib 2>/dev/null \
  | while read -r l; do echo "check: version label: $l"; done | grep . && fail=1

# The public site is dark; only the portal ([data-portal]) may follow the device.
grep -q '^\[data-portal\]:not(\[data-theme\]) { color-scheme: light dark; }' design/tokens.css || bad "tokens.css: the portal must follow the device ([data-portal] color-scheme: light dark)"
grep -q 'data-portal' 'app/(portal)/layout.tsx' || bad "portal layout must set data-portal"
grep -s -n -i -E 'dark only|no light theme' AGENTS.md DESIGN.md \
  | while read -r l; do echo "check: contradicts the theme decision (site dark, portal follows the device): ${l:0:80}"; done | grep . && fail=1

# No on-page Motion switch; the OS reduced-motion setting is the control.
grep -n -E 'motion-toggle|class="word">Motion<' design/*.html 2>/dev/null \
  | while read -r l; do echo "check: Motion switch (remove it; honour prefers-reduced-motion): ${l:0:80}"; done | grep . && fail=1

# The portal is invite-only: self sign-up stays off.
# ([auth] enable_signup must be false; [auth.email] enable_signup must stay true, or email sign-in is disabled.)
awk '/^\[auth\]$/{s="auth"} /^\[auth\.email\]$/{s="email"} /^\[/{if($0!="[auth]"&&$0!="[auth.email]")s=""} /^enable_signup/{print s": "$0}' supabase/config.toml > /tmp/solenix-signup.txt
grep -qx 'auth: enable_signup = false' /tmp/solenix-signup.txt || bad "self sign-up is on: [auth] enable_signup must be false (portal is invite-only)"
grep -qx 'email: enable_signup = true' /tmp/solenix-signup.txt || bad "[auth.email] enable_signup must be true, or email sign-in is disabled"

# Every raw HTML page is measured: lib/site-page.ts adds analytics, and the homepage is served through it.
grep -q 'servePage' app/route.ts && grep -q 'POSTHOG_SNIPPET' lib/site-page.ts && grep -q 'capture_pageleave' lib/analytics.ts || bad "homepage has no analytics (app/route.ts → lib/site-page.ts → lib/analytics.ts)"

# The agents page is called "Agents Marketplace" everywhere.
grep -rn ">Tools we use<" app components design/*.html 2>/dev/null | while read -r l; do echo "check: say \"Agents Marketplace\", not \"Tools we use\": ${l:0:80}"; done | grep . && fail=1

# Every article passes the article rules (lib/article-rules.mjs; the build enforces the same rules).
node scripts/article-check.mjs || fail=1
node scripts/sot-check.mjs || fail=1
node scripts/journey-check.mjs || fail=1
node scripts/origin-check.mjs || fail=1
# CI workflows: valid (actionlint) and safe (zizmor: pinned actions, least privilege), where installed.
if command -v actionlint >/dev/null; then actionlint .github/workflows/*.yml || fail=1; fi
if command -v zizmor >/dev/null; then zizmor --offline -q .github/workflows/ >/dev/null 2>&1 || { zizmor --offline .github/workflows/; fail=1; }; fi
# Types: the TypeScript compiler, strict, over the whole repo.
npx tsc --noEmit || fail=1
# The hero fit check opens pages in a browser, so locally it runs when something that shapes a first
# screen changes; in CI it always runs.
if [ -n "${CI:-}" ] || git diff --cached --name-only | grep -qE '^(articles/|design/(home\.html|tokens\.css|viewports\.json)|app/articles/|lib/site-(nav|hero|page)|scripts/hero-check)'; then
  node scripts/hero-check.mjs || fail=1
fi
node scripts/brand-images.mjs --check || fail=1

# Copy follows the Voice rules: no banned words (the list lives in DESIGN.md).
python3 scripts/voice-check.py design/home.html || fail=1

# No industry pages: the site speaks to every small business (DESIGN.md Decisions).
find "app/(site)" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | grep -i -E '/(law|legal|lawyers?|dental|dentists?|clinic|medical|realty|real-estate|restaurants?|trades?|accountants?|accounting)$' \
  | while read -r d; do echo "check: industry page $d (no industry pages; one site for every small business)"; done | grep . && fail=1

# No public prices: both numbers are agreed on the call (DESIGN.md Pricing).
python3 - design/home.html <<'PY' || fail=1
import re, sys, importlib.util as u
s = u.spec_from_file_location("v", "scripts/voice-check.py"); v = u.module_from_spec(s); s.loader.exec_module(v)
text = re.sub(r"\s+", " ", v.visible_text(open(sys.argv[1]).read()))
hits = re.findall(r".{0,30}(?:\$\s?\d[\d,]*(?:\.\d+)?\s?(?:/|per )\s?(?:mo|month|year|yr|hour|hr)\b|starting at \$|from \$\d|plans? start).{0,30}", text, re.I)
for h in hits: print(f"check: public price on the homepage: …{h.strip()}…")
sys.exit(1 if hits else 0)
PY

# What Jager approved stays on the page, word for word (design/approved.md).
python3 - design/approved.md design/home.html <<'PY' || fail=1
import re, sys, importlib.util as u
s = u.spec_from_file_location("v", "scripts/voice-check.py"); v = u.module_from_spec(s); s.loader.exec_module(v)
page = re.sub(r"\s+", " ", re.sub("[\u2010\u2011]", "-", v.visible_text(open(sys.argv[2]).read()) + " " + " ".join(re.findall(r'aria-label="([^"]*)"', open(sys.argv[2]).read()))))
missing = [l[2:].strip() for l in open(sys.argv[1]) if l.startswith("- ") and l[2:].strip() not in page]
for m in missing: print(f"check: approved by Jager but missing from the homepage: \"{m}\" (design/approved.md)")
sys.exit(1 if missing else 0)
PY

# Open Design's own anti-slop linter: no P0 findings on the homepage.
if command -v od >/dev/null && curl -s -m 2 http://127.0.0.1:55666 >/dev/null; then
  OD_DAEMON_URL=http://127.0.0.1:55666 od lint design/home.html --fail-on p0 >/dev/null 2>&1 || bad "od lint: P0 design finding in design/home.html (run: od lint design/home.html)"
fi

# Every source of truth named in AGENTS.md exists.
for f in DESIGN.md design/tokens.css design/home.html design/approved.md supabase/config.toml; do
  [ -f "$f" ] || bad "missing source of truth: $f"
done

# No orphaned Open Design sidecars.
for s in design/*.artifact.json; do
  [ -e "$s" ] || continue
  [ -f "${s%.artifact.json}" ] || bad "orphaned sidecar: $s"
done

# The homepage is served from design/home.html, not a second React page.
[ -f "app/(site)/page.tsx" ] && bad "second homepage: app/(site)/page.tsx (/ is design/home.html)"

# The page Jager looks at must load. When a local server is up, / answers 200.
# (A dev server that restarts onto a stale build cache serves 404 for every page.)
site=${SITE_URL:-http://localhost:3000/}
code=$(curl -s -o /dev/null -m 5 -w '%{http_code}' "$site" 2>/dev/null)
[ "$code" = "000" ] || [ "$code" = "200" ] \
  || bad "local site is broken: $site answers $code (restart the dev server; if it stays broken, move .next/dev aside)"

exit $fail
