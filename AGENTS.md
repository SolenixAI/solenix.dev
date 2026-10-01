# solenix.dev

Solenix's website and client portal. Next.js on Vercel · Supabase · Stripe · PostHog · Linear.

## Sources of truth (one each; everything else derives from them)

- Brand rules and Jager's decisions: `design/DESIGN.md`
- Token values: `design/tokens.css` (the app imports it in `app/globals.css`)
- Homepage: `design/home.html` (served as-is at `/`)
- ROI model and every constant behind it, with sources: `design/roi-model.md`
- What Jager has approved (must stay, word for word): `design/approved.md`
- Review scores: `design/scorecard.md`. They're a guide; Jager's verdict is final.
- Research behind design decisions: `design/research/`
- Portal design: `design/app.html` (the app under `app/(portal)` is built to match it)
- Supabase config and schema: `supabase/config.toml`, `supabase/migrations/`
- Client projects: Linear. Billing: Stripe.

## Rules

- One version of everything. No copies, and no version names (`-v2`, `v3`) in files, headings or comments. History lives in git.
- Design changes go through Open Design runs, one named change per run. Its own harness supplies the skills and checks. Each result is reviewed and shown to Jager before the next (Jager, 2026-10-01).
- The site is dark. The portal follows the device (light or dark) and has a manual choice.
- Latest stable versions. No secrets in code or output.
- `npm run check` enforces these rules, and `npm run check:test` proves each one by breaking it on purpose. The git pre-commit hook and Claude Code's hooks (`.claude/settings.json`) run it. When you find a new failure mode, add a check for it.
