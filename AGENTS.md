# solenix.dev

Solenix's website and client portal. Next.js on Vercel · Supabase · Stripe · PostHog · Linear.

## Sources of truth (one each; everything else derives from them)

- Brand rules: the Open Design design system "Solenix", exported to `design/DESIGN.md`
- Token values: `design/tokens.css` (the app imports it in `app/globals.css`)
- Homepage: `design/home.html` (served as-is at `/`)
- Portal design: `design/app.html` (the app under `app/(portal)` is built to match it)
- Supabase config and schema: `supabase/config.toml`, `supabase/migrations/`
- Client projects: Linear. Billing: Stripe.

## Rules

- One version of everything. No copies, and no version names (`-v2`, `v3`) in files, headings or comments. History lives in git.
- Change a design in Open Design first, then the app. Don't hand-edit `design/*.html`.
- Dark only. There is no light theme.
- Latest stable versions. No secrets in code or output.
- `npm run check` enforces these rules. The git pre-commit hook and Claude Code's hooks (`.claude/settings.json`) run it. When you find a new failure mode, add a check for it.

## Open Design

`design/` is the Open Design project "solenix.dev". Start design runs from its Studio with the "Solenix" design system selected in the composer. Keep the app window open during runs, because headless mode can't render, so it can't check its own work.
