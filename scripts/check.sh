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

# Every source of truth named in AGENTS.md exists.
for f in design/DESIGN.md design/tokens.css design/home.html design/app.html design/roi-model.md supabase/config.toml; do
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
