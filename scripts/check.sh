#!/usr/bin/env bash
# The rules in AGENTS.md, checked. Run by the git pre-commit hook and by
# Claude Code's Stop hook. Exits non-zero with one line per violation.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
fail=0
bad() { echo "check: $1"; fail=1; }

# The page scripts are compiled from client/*.ts first: lib/site-nav.ts and the checks below import the result
# (lib/client.generated.ts, gitignored), so a fresh checkout (CI) must build it before anything reads it.
node --no-warnings scripts/build-client.ts >/dev/null || bad "client scripts do not compile (scripts/build-client.ts)"

# One version of everything: no versioned file names.
git ls-files --cached --others --exclude-standard \
  | grep -E '(^|/)[^/]*[-_.]v[0-9]+(\.|$)' \
  | while read -r f; do echo "check: versioned file name: $f"; done | grep . && fail=1

# No version labels in the design system or code (AGENTS.md quotes them as examples).
grep -rn -E '· v[0-9]|\(v[0-9]\)|/\* v[0-9]|\bv[0-9] ·' DESIGN.md design/tokens.css app components lib 2>/dev/null \
  | while read -r l; do echo "check: version label: $l"; done | grep . && fail=1

# The site is dark only: the root layout declares dark before first paint, and nothing follows the device.
grep -q 'colorScheme: "dark"' app/layout.tsx || bad "app/layout.tsx: the root viewport must declare colorScheme \"dark\" (the site is dark only)"
grep -rn -E 'light dark|data-portal' app components lib design/tokens.css 2>/dev/null \
  | while read -r l; do echo "check: the site is dark only, nothing follows the device: ${l:0:80}"; done | grep . && fail=1

# No on-page Motion switch; the OS reduced-motion setting is the control.
grep -n -E 'motion-toggle|class="word">Motion<' design/*.html 2>/dev/null \
  | while read -r l; do echo "check: Motion switch (remove it; honour prefers-reduced-motion): ${l:0:80}"; done | grep . && fail=1

# Every page is measured: the site layout mounts one analytics component for all its pages, the homepage among them
# (app/(site)/page.tsx). The raw pages (Articles) keep the inline snippet (lib/site-page.ts).
grep -q '<Analytics />' 'app/(site)/layout.tsx' && grep -q 'posthog.init' 'app/(site)/analytics.tsx' && grep -q 'capture_pageleave' lib/analytics.ts || bad "homepage has no analytics (app/(site)/layout.tsx → analytics.tsx → lib/analytics.ts)"
grep -q 'POSTHOG_SNIPPET' lib/site-page.ts || bad "raw pages have no analytics (lib/site-page.ts)"

# The agents page is called "Agents Marketplace" everywhere.
grep -rn ">Tools we use<" app components design/*.html 2>/dev/null | while read -r l; do echo "check: say \"Agents Marketplace\", not \"Tools we use\": ${l:0:80}"; done | grep . && fail=1

# Every article passes the article rules (lib/article-rules.ts; the build enforces the same rules).
node scripts/article-check.ts || fail=1
node scripts/sot-check.ts || fail=1
node scripts/journey-check.ts || fail=1
node scripts/origin-check.ts || fail=1
# Every skill is model-invocable for every agent; a skills install or update can lock one again (scripts/unlock-skills.sh fixes it).
grep -rlE '^disable-model-invocation:[[:space:]]*true|allow_implicit_invocation:[[:space:]]*false' .agents/skills 2>/dev/null \
  | while read -r f; do echo "check: locked skill $f (run scripts/unlock-skills.sh)"; done | grep . && fail=1
# TypeScript only: no JavaScript file outside scripts/js-allowlist.txt (a list that may only shrink).
git ls-files -co --exclude-standard | grep -E '\.(js|jsx|mjs|cjs)$' | grep -v '^public/' | grep -vxFf <(grep -v '^#' scripts/js-allowlist.txt) \
  | while read -r f; do echo "check: JavaScript file $f (the repo is TypeScript; see scripts/js-allowlist.txt)"; done | grep . && fail=1
# Page scripts are TypeScript in client/*.ts, compiled and inlined where the page holds a
# <!--client:name--> marker (lib/client-script.ts). The homepage and the articles hold no hand-written
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
for f in ["design/home.html"] + sorted(glob.glob("articles/*/index.html")):
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
            print(f"check: {f}:{line} hand-written inline <script>: put it in client/<name>.ts and mark the spot with <!--client:<name>--> (lib/client-script.ts)"); bad = 1
sys.exit(bad)
PY
# CI workflows: valid (actionlint) and safe (zizmor: pinned actions, least privilege), where installed.
if command -v actionlint >/dev/null; then actionlint .github/workflows/*.yml || fail=1; fi
if command -v zizmor >/dev/null; then zizmor --offline -q .github/workflows/ >/dev/null 2>&1 || { zizmor --offline .github/workflows/; fail=1; }; fi
# One 3D world: only lib/space imports three (the space engine, lib/space/engine.ts). A page that shows 3D imports
# 'solenix-space' instead, so there is never a second world beside the first.
git ls-files -co --exclude-standard -- '*.ts' '*.tsx' '*.html' | grep -v '^lib/space/' | xargs -r grep -n -E "(from|import)[[:space:]]*\(?[[:space:]]*['\"]three(/[^'\"]*)?['\"]" \
  | while read -r l; do echo "check: only lib/space may import three (one 3D world; import 'solenix-space' instead): ${l:0:120}"; done | grep . && fail=1
# Types: the compiler checks the whole repo (the page scripts were compiled at the top).
npx tsc --noEmit || fail=1
# Unit tests, next to the module they test (lib/**/*.test.ts, any depth), with Node's own test runner.
node --test 'lib/**/*.test.ts' >/dev/null 2>&1 || { node --test 'lib/**/*.test.ts'; fail=1; }
# The hero fit check opens pages in a browser, so locally it runs when something that shapes a first
# screen changes; in CI it always runs.
if [ -n "${CI:-}" ] || git diff --cached --name-only | grep -qE '^(articles/|app/\(site\)/|app/articles/|components/(home|site|space)/|design/(home\.html|tokens\.css|viewports\.json)|lib/(home|space)/|lib/site-(nav|hero|page)|scripts/hero-check)'; then
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
# (30 on 2026-10-09). Fix findings and lower the baseline; never raise it.
# The launcher ships inside the installed plugin, whose path changes with each version: read it live.
imp_plugin=$(python3 -c 'import json,os;p=json.load(open(os.path.expanduser("~/.claude/plugins/installed_plugins.json")))["plugins"].get("impeccable@impeccable") or [{}];print(p[0].get("installPath",""))' 2>/dev/null)
IMP=${IMPECCABLE:-$imp_plugin/skills/impeccable/scripts/impeccable}
IMPECCABLE_BASELINE=30
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
  echo "skip: impeccable is not installed (set IMPECCABLE=path); the homepage design detector did not run" >&2
fi

# Every source of truth named in AGENTS.md exists.
for f in DESIGN.md design/tokens.css design/home.html design/approved.md; do
  [ -f "$f" ] || bad "missing source of truth: $f"
done

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

exit $fail
