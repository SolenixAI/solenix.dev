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
grep -rn -E '· v[0-9]|\(v[0-9]\)|/\* v[0-9]|\bv[0-9] ·' design/DESIGN.md design/tokens.css app components lib 2>/dev/null \
  | while read -r l; do echo "check: version label: $l"; done | grep . && fail=1

# The public site is dark; only the portal ([data-portal]) may follow the device.
grep -q '^\[data-portal\]:not(\[data-theme\]) { color-scheme: light dark; }' design/tokens.css || bad "tokens.css: the portal must follow the device ([data-portal] color-scheme: light dark)"
grep -q 'data-portal' 'app/(portal)/layout.tsx' || bad "portal layout must set data-portal"
grep -n -i -E 'dark only|no light theme' AGENTS.md design/DESIGN.md \
  | while read -r l; do echo "check: contradicts the theme decision (site dark, portal follows the device): ${l:0:80}"; done | grep . && fail=1

# No on-page Motion switch; the OS reduced-motion setting is the control.
grep -n -E 'motion-toggle|class="word">Motion<' design/*.html 2>/dev/null \
  | while read -r l; do echo "check: Motion switch (remove it; honour prefers-reduced-motion): ${l:0:80}"; done | grep . && fail=1

# The portal is invite-only: self sign-up stays off.
# ([auth] enable_signup must be false; [auth.email] enable_signup must stay true, or email sign-in is disabled.)
awk '/^\[auth\]$/{s="auth"} /^\[auth\.email\]$/{s="email"} /^\[/{if($0!="[auth]"&&$0!="[auth.email]")s=""} /^enable_signup/{print s": "$0}' supabase/config.toml > /tmp/solenix-signup.txt
grep -qx 'auth: enable_signup = false' /tmp/solenix-signup.txt || bad "self sign-up is on: [auth] enable_signup must be false (portal is invite-only)"
grep -qx 'email: enable_signup = true' /tmp/solenix-signup.txt || bad "[auth.email] enable_signup must be true, or email sign-in is disabled"

# The homepage is measured: analytics are injected where it is served.
grep -q 'POSTHOG_SNIPPET' app/route.ts && grep -q 'capture_pageleave' lib/analytics.ts || bad "homepage has no analytics (app/route.ts + lib/analytics.ts)"

# The agents page is called "Agents Marketplace" everywhere.
grep -rn ">Tools we use<" app components design/*.html 2>/dev/null | while read -r l; do echo "check: say \"Agents Marketplace\", not \"Tools we use\": ${l:0:80}"; done | grep . && fail=1

# Copy follows the Voice rules: no banned words (the list lives in design/DESIGN.md).
python3 scripts/voice-check.py design/home.html design/app.html || fail=1

# The homepage happens inside the 3D world: a race is bodies and one tape, never lanes or screens of interface laid over it.
grep -n -E 'class="(lane|scr|rchat)[" ]' design/home.html \
  | while read -r l; do echo "check: race interface laid over the world (no .lane or .scr; play the race as bodies in the scene): ${l:0:60}"; done | grep . && fail=1
# Reduced motion quiets the camera only: the races must still play.
awk '/The flyby races\./,/<\/script>/' design/home.html | grep -n -E 'prefers-reduced-motion|reduce\.matches' \
  | while read -r l; do echo "check: the races must play under reduced motion (no reduced-motion branch in the race script): ${l:0:60}"; done | grep . && fail=1
# Reduced motion freezes keyframe animations at their first frame (tokens.css), so a stop marker's size and place
# must never depend on one: animate it only inside a prefers-reduced-motion: no-preference block.
grep -n -E '^\.stop-mk[^{]*\{[^}]*animation:' design/home.html \
  | while read -r l; do echo "check: stop marker animated outside a no-preference block (it freezes small under Reduce Motion): ${l:0:60}"; done | grep . && fail=1

# No industry pages: the site speaks to every small business (design/DESIGN.md Decisions).
find "app/(site)" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | grep -i -E '/(law|legal|lawyers?|dental|dentists?|clinic|medical|realty|real-estate|restaurants?|trades?|accountants?|accounting)$' \
  | while read -r d; do echo "check: industry page $d (no industry pages; one site for every small business)"; done | grep . && fail=1

# No public prices: both numbers are agreed on the call (design/DESIGN.md Pricing).
python3 - design/home.html <<'PY' || fail=1
import re, sys, importlib.util as u
s = u.spec_from_file_location("v", "scripts/voice-check.py"); v = u.module_from_spec(s); s.loader.exec_module(v)
text = re.sub(r"\s+", " ", v.visible_text(open(sys.argv[1]).read()))
hits = re.findall(r".{0,30}(?:\$\s?\d[\d,]*(?:\.\d+)?\s?(?:/|per )\s?(?:mo|month|year|yr|hour|hr)\b|starting at \$|from \$\d|plans? start).{0,30}", text, re.I)
for h in hits: print(f"check: public price on the homepage: …{h.strip()}…")
sys.exit(1 if hits else 0)
PY

# Sight over text: each stop of the plan says ten words or fewer (design/research/site-playbook.md, decision 1).
python3 - design/home.html <<'PY' || fail=1
import re, sys
html = open(sys.argv[1]).read()
m = re.search(r'<ol class="jr-steps" data-steps>(.*?)</ol>', html, re.S)
bad = 0
for li in re.findall(r"<li[^>]*>(.*?)</li>", m.group(1) if m else "", re.S):
    words = re.sub(r"<span class=\"no\">.*?</span>|<[^>]+>", " ", li).split()
    if len(words) > 10: print(f"check: plan stop over ten words ({len(words)}): {' '.join(words)[:60]}"); bad = 1
if not m: print("check: the plan's stops were not found in design/home.html (ol.jr-steps[data-steps])"); bad = 1
sys.exit(bad)
PY

# Every race on the homepage is sourced in design/before-after.md (one source of truth for the examples).
python3 - design/home.html design/before-after.md <<'PY' || fail=1
import json, re, sys
html, ba = open(sys.argv[1]).read(), open(sys.argv[2]).read()
m = re.search(r"const RACES = (\{.*?\});\n", html, re.S)
names = [r["name"] for r in json.loads(m.group(1)).values()] if m else []
heads = " ".join(re.findall(r"^## .*$", ba, re.M)).lower()
missing = [n for n in names if not all(w in heads for w in re.findall(r"[a-z]+", n.lower()) if w not in ("and",))]
for n in missing: print(f"check: race \"{n}\" on the homepage has no section in design/before-after.md")
if not m: print("check: no RACES table found in design/home.html")
sys.exit(1 if missing or not m else 0)
PY

# What Jager approved stays on the page, word for word (design/approved.md).
python3 - design/approved.md design/home.html <<'PY' || fail=1
import re, sys, importlib.util as u
s = u.spec_from_file_location("v", "scripts/voice-check.py"); v = u.module_from_spec(s); s.loader.exec_module(v)
page = re.sub(r"\s+", " ", v.visible_text(open(sys.argv[2]).read()) + " " + " ".join(re.findall(r'aria-label="([^"]*)"', open(sys.argv[2]).read())))
missing = [l[2:].strip() for l in open(sys.argv[1]) if l.startswith("- ") and l[2:].strip() not in page]
for m in missing: print(f"check: approved by Jager but missing from the homepage: \"{m}\" (design/approved.md)")
sys.exit(1 if missing else 0)
PY

# Every source of truth named in AGENTS.md exists.
for f in design/DESIGN.md design/tokens.css design/home.html design/app.html design/roi-model.md design/before-after.md supabase/config.toml; do
  [ -f "$f" ] || bad "missing source of truth: $f"
done

# No orphaned Open Design sidecars.
for s in design/*.artifact.json; do
  [ -e "$s" ] || continue
  [ -f "${s%.artifact.json}" ] || bad "orphaned sidecar: $s"
done

# The homepage is served from design/home.html, not a second React page.
[ -f "app/(site)/page.tsx" ] && bad "second homepage: app/(site)/page.tsx (/ is design/home.html)"

exit $fail
