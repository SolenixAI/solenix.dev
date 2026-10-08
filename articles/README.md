---
type: Guide
title: "Articles on solenix.dev"
description: "How to add an article: one folder, one self-contained page, two automatic gates."
tags: [articles, solenix.dev, poka-yoke]
sources:
  - lib/article-rules.mjs (the rules)
  - lib/articles.ts (how pages are served)
  - DESIGN.md (brand and voice)
generated: { by: agent:claude-opus-5-5, at: 2026-10-08T16:40-02:30 }
status: draft
stale_after: 2027-01-08
---

# Articles

Each article is one **self-contained, interactive page**: its own design, data and playgrounds. The site serves it at `solenix.dev/articles/<folder>` and lists it at `/articles`, in the sitemap and in the RSS feed. Nothing else needs to change.

## Add an article

1. Copy `articles/_template/` to `articles/<your-slug>/` (lower-case words joined by hyphens).
2. Write `index.html`. Keep the three required tags at the top: `<title>`, `<meta name="description">`, `<meta name="article:published_time">`.
3. Run `npm run dev` and open `http://localhost:3000/articles/<your-slug>`.
4. Run `npm run check`. It must print nothing.

The process around it (claim check, screenshot sweep, publish decision, launch) lives in Linear: start a project from the **Article** template.

## The two gates

| Gate | When | What it stops |
|---|---|---|
| `npm run check` (pre-commit) | before a commit | any rule below |
| `next build` | before a deploy | the same rules: the build fails |

The rules, from `lib/article-rules.mjs`:

* folder name is lower-case words joined by hyphens (`_template` and other `_` folders are never served)
* `<title>` 3–70 characters, description 50–200 characters, date `YYYY-MM-DD`
* a mobile viewport tag
* page under 8 MB
* no private data: local file paths, private email or inbox names, localhost links, internal Linear references, secret keys
* no nav of its own: the site adds the one nav
* no raw colours: name a token, `var(--name)`, from `design/tokens.css`
* nothing loaded from another host: fonts and libraries come from npm through `scripts/vendor.mjs` (`npm run check` fails otherwise)

## What the site adds

Everything every page shares, from one place (`lib/site-page.ts`), so a page cannot forget or copy it:

* dark from the first byte (`color-scheme`), the design tokens (`/tokens.css`), "Title · Solenix" in the tab
* the nav, from `lib/site-nav.mjs`: the same links and Solenix platform button as every page. Give a section an `id` and `data-nav="Label"` and it becomes a link in the nav, with a reading line.
* tab icons, link-preview tags from the page's own title and description, PostHog (on solenix.dev only) and Speed Insights

A page written without `<html>` (an artifact draft) is wrapped in a document automatically. `npm run check` also fails if a copy of the nav appears anywhere outside `lib/site-nav.mjs` (`scripts/sot-check.mjs`).

## Rules of thumb

* Colour and type come from the tokens by name; the check stops a raw value.
* Show before you tell: a picture or playground before each block of text.
* Every fact links to its source, with its date.
* End on one action: Book a call.
