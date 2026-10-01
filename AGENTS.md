# solenix.dev

Solenix sets up AI inside the tools a small business already uses. This repo is its website and client portal.

**The goal:** a small-business owner who has barely used AI lands on the homepage, understands in seconds what Solenix does, believes it, and books a call. Judge every change by that.

## Before you change a page

- Read Jager's decisions (`design/DESIGN.md`, "Decisions") and the lines he approved word for word (`design/approved.md`). Both are binding.
- The homepage is `design/home.html`, served as it is at `/`. Its 3D scene is the main experience; the text sits in it and never covers it with panels.
- Change one named thing at a time, through Open Design. Look at the result yourself at his browser size, then show him before the next change. His verdict on what he sees is the only test of a design.
- The portal (`app/(portal)`) is built to match `design/app.html`. The site is dark; the portal follows the device.

## Run and check

- `npm run dev` serves the site. `npm run shots` captures each section in a real GPU browser.
- `npm run check` enforces the rules here, and `npm run check:test` proves each rule by breaking it on purpose. Both run before every commit.
- When you find a new way to fail, add a check for it.

## Stack

Next.js on Vercel, Supabase (`supabase/`), Stripe for billing, PostHog, Linear for the plan. Keep one version of everything; history lives in git.
