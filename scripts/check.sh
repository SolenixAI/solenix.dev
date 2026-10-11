#!/usr/bin/env bash
# The repo's rules (DESIGN.md, PRODUCT.md, design/approved.md, one source per fact), checked. Run by the git
# pre-commit hook and by CI on every pull request. Exits non-zero with one line per violation.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
fail=0
bad() { echo "check: $1"; fail=1; }
# A rule whose tool is not installed. CI installs every tool that scripts/check.sh calls (.github/workflows/ci.yml), so there a
# missing tool fails the check and no rule skips. On a laptop the rule skips, loudly, and the rest of the check still runs.
missing() { # missing <tool> <what it checks>
  if [ -n "${CI:-}" ]; then bad "$1 is not installed: $2 cannot run in CI (see .github/workflows/ci.yml)"
  else echo "skip: $1 is not installed; $2 did not run here (CI fails when $1 is missing)" >&2; fi
}

# The page scripts are compiled from client/*.ts first, and the raw pages' nav header is rendered: lib/site-nav.ts,
# lib/raw-nav.ts and the checks below import the results (lib/client.generated.ts, lib/nav.generated.ts, gitignored), so a fresh checkout (CI) must build it before anything reads it.
node --no-warnings scripts/build-client.ts >/dev/null || bad "client scripts do not compile (scripts/build-client.ts)"

# One version of everything: no versioned file names.
git ls-files --cached --others --exclude-standard \
  | grep -E '(^|/)[^/]*[-_.]v[0-9]+(\.|$)' \
  | while read -r f; do echo "check: versioned file name: $f"; done | grep . && fail=1

# No version labels in the design system or code (AGENTS.md quotes them as examples).
grep -rn -E '· v[0-9]|\(v[0-9]\)|/\* v[0-9]|\bv[0-9] ·' DESIGN.md design/tokens.css app components lib 2>/dev/null \
  | while read -r l; do echo "check: version label: $l"; done | grep . && fail=1

# The site is dark only: the root layout declares dark before first paint, and nothing follows the device.
# The first-frame ground (lib/site-ground.ts) is a literal by necessity; it must equal --bg in the tokens.
ground=$(sed -n 's/^export const GROUND = "\(#[0-9a-fA-F]*\)".*/\1/p' lib/site-ground.ts); bg=$(sed -n 's/^[[:space:]]*--bg:[[:space:]]*\(#[0-9a-fA-F]*\);.*/\1/p' design/tokens.css | head -1)
[ -n "$ground" ] && [ "$ground" = "$bg" ] || bad "lib/site-ground.ts GROUND ($ground) must equal --bg in design/tokens.css ($bg)"
grep -q 'colorScheme: "dark"' app/layout.tsx || bad "app/layout.tsx: the root viewport must declare colorScheme \"dark\" (the site is dark only)"
grep -rn -E 'light dark|light-dark\(|data-portal' app components lib client articles design/home.html design/tokens.css 2>/dev/null \
  | while read -r l; do echo "check: the site is dark only, nothing follows the device: ${l:0:80}"; done | grep . && fail=1
# A color-scheme that lists both light and dark follows the device, wherever it is declared (tokens included).
grep -rn -E 'color-scheme[[:space:]]*:[^;}]*(light[^;}]*dark|dark[^;}]*light)' app components lib design/tokens.css 2>/dev/null \
  | while read -r l; do echo "check: the site is dark only, nothing follows the device (color-scheme lists light and dark): ${l:0:80}"; done | grep . && fail=1
# light-dark() pairs are written once, in design/tokens.css (the design's contract); a pair written anywhere else is a second copy of a colour.
grep -rn -E 'light-dark\(' app components lib 2>/dev/null \
  | while read -r l; do echo "check: a light-dark() pair outside design/tokens.css (pairs are written once, in the tokens): ${l:0:80}"; done | grep . && fail=1
# The theme decision is dark only (DESIGN.md): the docs must not say that the portal or the site follows the device.
grep -n -i -E 'follows? the device' AGENTS.md DESIGN.md 2>/dev/null \
  | while read -r l; do echo "check: contradicts the theme decision (the site is dark only, DESIGN.md): ${l:0:80}"; done | grep . && fail=1

# No on-page Motion switch; the OS reduced-motion setting is the control.
grep -n -E 'motion-toggle|class="word">Motion<' design/*.html 2>/dev/null \
  | while read -r l; do echo "check: Motion switch (remove it; honour prefers-reduced-motion): ${l:0:80}"; done | grep . && fail=1

# Every page is measured: the site layout mounts one analytics component for all its pages, the homepage among them
# (app/(site)/page.tsx). The raw pages (Articles) keep the inline snippet (lib/site-page.ts).
grep -qF '<Analytics host={SITE_HOST} />' 'app/(site)/layout.tsx' && grep -q 'posthog.init' 'app/(site)/analytics.tsx' && grep -q 'capture_pageleave' lib/analytics.ts || bad "homepage has no analytics (app/(site)/layout.tsx → analytics.tsx → lib/analytics.ts)"
grep -q 'POSTHOG_SNIPPET' lib/site-page.ts || bad "raw pages have no analytics (lib/site-page.ts)"
grep -qF 'posthog.register(POSTHOG_PROPERTIES)' 'app/(site)/analytics.tsx' && grep -qF 'posthog.register(${JSON.stringify(POSTHOG_PROPERTIES)})' lib/analytics.ts || bad "an analytics loader does not tag events with app (lib/analytics.ts POSTHOG_PROPERTIES)"

# The agents page is called "Agents Marketplace" everywhere.
grep -rn ">Tools we use<" app components design/*.html 2>/dev/null | while read -r l; do echo "check: say \"Agents Marketplace\", not \"Tools we use\": ${l:0:80}"; done | grep . && fail=1

# Every article passes the article rules (lib/article-rules.ts; the build enforces the same rules).
node scripts/article-check.ts || fail=1
node scripts/sot-check.ts || fail=1
node scripts/journey-check.ts || fail=1
node scripts/origin-check.ts || fail=1
# Every skill is model-invocable for every agent; a skills install or update can lock one again (scripts/unlock-skills.sh fixes it).
bash scripts/unlock-skills.sh --check || fail=1
# The git guard blocks what destroys work and nothing else: its table of allowed and blocked commands.
bash .claude/hooks/block-dangerous-git.test.sh || fail=1
# TypeScript only: no JavaScript file outside scripts/js-allowlist.txt (a list that may only shrink).
# Installed skills are vendor code, like public/: their installers own them (Impeccable's live mode injects its JS into the page).
git ls-files -co --exclude-standard | grep -E '\.(js|jsx|mjs|cjs)$' | grep -vE '^(public/|\.(agents|claude|cursor|github|grok)/skills/)' | grep -vxFf <(grep -v '^#' scripts/js-allowlist.txt) \
  | while read -r f; do echo "check: JavaScript file $f (the repo is TypeScript; see scripts/js-allowlist.txt)"; done | grep . && fail=1
# Page scripts are TypeScript in client/*.ts, compiled and inlined where the page holds a
# <!--client:name--> marker (lib/client-script.ts). The homepage, the articles and the brand motion page (its
# script is brand/motion/piece.ts) hold no hand-written
# inline <script>, except: the one-line "js" class (it must run before the first paint), importmaps,
# JSON data (ld+json) and speculation rules. ALLOWED is the explicit list of pages that still hold their
# own script: it may only shrink (move the script to client/, then delete its line). An entry whose page
# no longer holds an inline script is a failure too, so the list cannot go stale.
python3 - <<'PY' || fail=1
import glob, re, sys
ALLOWED = ["articles/proof-flood/index.html"]
JS_CLASS = "document.documentElement.classList.add('js')"
TYPES = {"importmap", "application/ld+json", "speculationrules"}
bad = 0
for f in ["design/home.html", "brand/motion/index.html"] + sorted(glob.glob("articles/*/index.html")):
    text = re.sub(r"<!--.*?-->", lambda m: re.sub(r"[^\n]", " ", m.group()), open(f).read(), flags=re.S)  # comments, keeping line numbers
    inline = []
    for m in re.finditer(r"<script\b([^>]*)>(.*?)</script>", text, re.S | re.I):
        attrs, body = m.group(1), m.group(2).strip()
        kind = re.search(r"""\btype\s*=\s*["']?([^"'\s>]+)""", attrs)
        if re.search(r"\bsrc\s*=", attrs) or (kind and kind.group(1).lower() in TYPES) or body == JS_CLASS:
            continue
        inline.append(text[:m.start()].count("\n") + 1)
    if f in ALLOWED and not inline:
        print(f"check: {f} is in the inline-script list in scripts/check.sh but holds no inline script: delete it from the list"); bad = 1
    if f not in ALLOWED:
        for line in inline:
            print(f"check: {f}:{line} hand-written inline <script>: put it in client/<name>.ts and mark the spot with <!--client:<name>--> (lib/client-script.ts); on the brand motion page, in brand/motion/piece.ts"); bad = 1
sys.exit(bad)
PY
# CI workflows: valid (actionlint) and safe (zizmor: pinned actions, least privilege). ACTIONLINT and ZIZMOR name the binaries.
ACTIONLINT=${ACTIONLINT:-actionlint}; ZIZMOR=${ZIZMOR:-zizmor}
if command -v "$ACTIONLINT" >/dev/null; then "$ACTIONLINT" .github/workflows/*.yml || fail=1; else missing actionlint "the workflow check"; fi
if command -v "$ZIZMOR" >/dev/null; then "$ZIZMOR" --offline -q .github/workflows/ >/dev/null 2>&1 || { "$ZIZMOR" --offline .github/workflows/; fail=1; }; else missing zizmor "the workflow security check"; fi
# One 3D world: only lib/space imports three (the space engine, lib/space/engine.ts). A page that shows 3D imports
# lib/space instead, so there is never a second world beside the first.
git ls-files -co --exclude-standard -- '*.ts' '*.tsx' '*.html' | grep -v '^lib/space/' | xargs -r grep -n -E "(from|import)[[:space:]]*\(?[[:space:]]*['\"]three(/[^'\"]*)?['\"]" \
  | while read -r l; do echo "check: only lib/space may import three (one 3D world; import lib/space instead): ${l:0:120}"; done | grep . && fail=1
# Names of code that no longer exists: a comment or message that uses one points at nothing.
git grep -n -I -E "solenix-space|saved light/dark" -- ':!scripts/check.sh' ':!scripts/check-test.sh' 2>/dev/null \
  | while read -r l; do echo "check: names removed code (solenix-space, saved light/dark): ${l:0:120}"; done | grep . && fail=1
# A phone lede is never under 1.05rem (DESIGN.md): the floor of --fs-lede in the tokens.
lede=$(sed -n 's/^[[:space:]]*--fs-lede:[[:space:]]*clamp(\([0-9.]*\)rem.*/\1/p' design/tokens.css)
python3 -c "import sys; sys.exit(0 if float('${lede:-0}') >= 1.05 else 1)" || bad "design/tokens.css: --fs-lede starts at ${lede:-?}rem; a phone lede is 1.05rem or more"
# No eyebrow or kicker above a heading (DESIGN.md, Impeccable's ban): no page or template uses the classes.
git grep -n -I -E 'class(Name)?="[^"]*\b(eyebrow|sx-kicker|kicker)\b' -- app components lib design articles 2>/dev/null \
  | while read -r l; do echo "check: an eyebrow or kicker above a heading (banned; let the heading speak): ${l:0:120}"; done | grep . && fail=1
# Types: the compiler checks the whole repo (the page scripts were compiled at the top).
npx tsc --noEmit || fail=1
# Unit tests, next to the module they test (lib/**/*.test.ts, any depth), with Node's own test runner.
node --test 'lib/**/*.test.ts' >/dev/null 2>&1 || { node --test 'lib/**/*.test.ts'; fail=1; }
# The hero fit check opens pages in a browser, so locally it runs when something that shapes a first
# screen changes; in CI it always runs.
if [ -n "${CI:-}" ] || git diff --cached --name-only | grep -qE '^(articles/|app/\(site\)/|app/articles/|components/(home|site|space)/|design/(home\.html|tokens\.css|viewports\.json)|lib/(home|space)/|lib/site-(nav|hero|page)|lib/raw-nav|scripts/hero-check)'; then
  node scripts/hero-check.ts || fail=1
fi
node scripts/brand-images.ts --check || fail=1

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

# Impeccable's detector on the homepage. Findings may not rise above the baseline
# (7 on 2026-10-11: the seven are the ember glows DESIGN.md allows.)
# Fix findings and lower the baseline; never raise it.
# The launcher ships in this repo (.claude/skills/impeccable); on its first run it downloads its pinned, sha256-checked engine.
IMP=${IMPECCABLE:-.claude/skills/impeccable/scripts/impeccable}
IMPECCABLE_BASELINE=7
if [ -x "$IMP" ]; then
  det=$(mktemp)
  "$IMP" detect --json --no-advisory design/home.html >"$det" 2>/dev/null; rc=$?
  if [ "$rc" -gt 2 ]; then bad "impeccable detect failed on design/home.html (exit $rc)"
  else python3 - "$det" "$IMPECCABLE_BASELINE" <<'PYEOF' || fail=1
import json, sys
found, base = json.load(open(sys.argv[1])), int(sys.argv[2])
if len(found) > base:
    for x in found: print(f"check: impeccable {x['antipattern']} on design/home.html:{x['line']}: {x['snippet']}")
    print(f"check: impeccable found {len(found)} findings on design/home.html, above the baseline of {base} (scripts/check.sh)")
    sys.exit(1)
PYEOF
  fi
  rm -f "$det"
else
  missing impeccable "the homepage design detector"
fi

# Every source of truth named in AGENTS.md exists.
for f in DESIGN.md design/tokens.css design/home.html design/approved.md; do
  [ -f "$f" ] || bad "missing source of truth: $f"
done
# The marketing context is a real file, not a link to PRODUCT.md: every marketing skill reads it, and sot-check.ts keeps its one-liner and audience equal to PRODUCT.md's.
[ -f .agents/product-marketing.md ] && [ ! -L .agents/product-marketing.md ] || bad ".agents/product-marketing.md must be a real file, not a link (sot-check.ts compares it with PRODUCT.md)"

# The homepage is app/(site)/page.tsx, which reads design/home.html. No second route may serve "/".
[ -f app/route.ts ] && bad "second homepage: app/route.ts (/ is app/(site)/page.tsx, which reads design/home.html)"
grep -q 'homeSource' 'app/(site)/page.tsx' && grep -q '"design/home.html"' lib/home/source.ts || bad "the homepage must render design/home.html through lib/home/source.ts (app/(site)/page.tsx)"
# One 3D world, mounted once by the site layout; the homepage binds to it (lib/space/world.ts).
grep -q '<SpaceWorld />' 'app/(site)/layout.tsx' && grep -q 'HomeBinding' 'app/(site)/page.tsx' || bad "the 3D world must be mounted in app/(site)/layout.tsx, and the homepage must bind to it (app/(site)/page.tsx)"

# The page Jager looks at must load. When a local server is up, / answers 200.
# (A dev server that restarts onto a stale build cache serves 404 for every page.)
site=${SITE_URL:-http://localhost:3000/}
code=$(curl -s -o /dev/null -m 5 -w '%{http_code}' "$site" 2>/dev/null)
[ "$code" = "000" ] || [ "$code" = "200" ] \
  || bad "local site is broken: $site answers $code (restart the dev server; if it stays broken, move .next/dev aside)"
# Copy lives in the homepage source, the React pages, the articles and the metadata: the Voice check reads every page
# the sitemap lists, as the local site renders it, whenever that site is up.
if [ "$code" = "200" ]; then
  pages=$(curl -s -m 20 "${site%/}/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed -E 's#<loc>https?://[^/]+##; s#</loc>##' | sort -u)
  [ -n "$pages" ] || bad "the sitemap lists no pages, so the Voice check could not read them"
  for page in $pages; do python3 scripts/voice-check.py "${site%/}$page" || fail=1; done
fi

exit $fail
