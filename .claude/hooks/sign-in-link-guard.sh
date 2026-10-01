#!/usr/bin/env bash
# PreToolUse guard for Bash and the Supabase tools. Supabase keeps only the
# newest sign-in link per user, so generating an admin link kills the one
# Jager may have just been emailed (it locked him out on 2026-09-30).
input=$(cat)
grep -qiE 'generate_?link|generateLink|/auth/v1/admin/generate_link' <<<"$input" || exit 0
echo "Blocked: generating a sign-in link replaces any link Jager was just emailed. Ask Jager first, or use the email he already has. (Landmine 2026-09-30.)" >&2
exit 2
