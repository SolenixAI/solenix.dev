# End-to-end user journey audit log

- **Last updated:** 2026-10-25
- **Iteration:** 4
- **Status:** All four application findings are fixed and verified. A separate native-share cancellation follow-up is fixed.

## Scope and method

This audit follows the visitor-facing application in the running local site at `http://localhost:3000`. Findings and fix verification come from visible browser behavior and interactions at mobile viewports of 390 × 844, 305 × 624, and 320 × 568, with the article Share control and wide atlas also checked at 1440 × 900. Source review was used to implement fixes; audit evidence below is from the application itself. Repository checks run by the pre-commit hook are separate from the browser walkthrough. The article-author workflow is outside scope because it is a repository workflow rather than a visitor journey in the application.

## Journey coverage

| Journey | What was exercised | Result |
| --- | --- | --- |
| Small-business owner | Homepage story and calls to action; Book a call through to the external appointment calendar; platform holding page and its navigation back to the Agents Marketplace | Homepage and holding page rendered. The calendar opened and showed appointment availability. No slot was selected and no booking was submitted. |
| Curious article reader | Articles listing; featured article; selecting a discovery; reading its detail panel; Surprise me; close/deep-link behavior; article atlas Map and Cards views; search and empty-state recovery; Erdős grid, fluid simulation, and Lean proof checker interactions | Main reading and playground flows worked. Findings A-01 to A-04 describe article discovery, sharing, and short-screen layout friction. |
| AI-agent / marketplace visitor | Setup copy action; Core toolkit and Vercel world detail; skill inventory and individual skill detail; marketplace copy action; direct marketplace catalog | Copy feedback appeared, the detail paths opened, and `/agents/worlds.json` rendered its catalog. |
| Feed reader | Article RSS feed | `/articles/rss.xml` rendered an RSS item for The Proof Flood. |
| AI guide reader | Direct visit to `/llms.txt` | Not verified: the in-app browser blocked this URL before displaying a page. This is a coverage limit, not a confirmed site defect. |

## Findings and fixes

### A-01 — P2: Featured article is hard to identify on a phone — fixed

- **Route:** `/articles`
- **Reproduction:** Set the viewport to 390 × 844 and open Articles from the site navigation.
- **Initial observation:** The featured cover was mostly blank, with the interactive preview reduced to a small thumbnail on the left. The article title, date, and summary were not readable on the listing itself.
- **Fix:** The mobile card now shows the date, title, and summary. The small-screen preview scales to fill the available frame width instead of leaving a large blank area beside a narrow portrait page.
- **Verified:** At 390 × 844, `/articles` shows the preview across the card and readable story metadata and description below it. Compact-height behavior is recorded in A-04.

### A-02 — P2: Article Share control gives no visible result — fixed

- **Route:** `/articles/proof-flood`
- **Reproduction:** At the sticky article navigation, click Share at either 390 × 844 or 1440 × 900.
- **Initial observation:** The page remained in place with no visible response, and the clipboard retained the previous discovery link.
- **Fix:** The control now announces “Shared” after native sharing or “Link copied” after copying, and falls back to copying when native sharing is unavailable or fails.
- **Verified:** At 390 × 844 and 1440 × 900, the control copied the canonical article URL (`/articles/proof-flood`) and showed “Link copied.” The browser clipboard was restored to its pre-check discovery URL after verification. Other browsers were not part of this audit.

### A-03 — P2: Atlas Map targets are too small to select comfortably on a phone — fixed

- **Route:** `/articles/proof-flood#atlas`
- **Initial observation:** At 390 × 844, the default Map view showed tiny clustered dots that were difficult to target individually.
- **Fix:** The atlas now starts in Cards view on small screens and Map view on wider screens.
- **Verified:** At 390 × 844, “Explore all 372” opened with Cards selected and the cards visible. At 1440 × 900, the same journey opened with Map selected and the map visible.

### A-04 — P2: Article hero elements overlap on short screens — fixed

- **Route:** `/articles`
- **Reproduction:** Open Articles at 305 × 624, 320 × 568, 640 × 360, or 667 × 300.
- **Initial observation:** On the two short phone sizes, the article card extended into the fixed scroll-cue area; its Play with it action collided with “Who made these,” and at 320 × 568 the card also covered Book a call. At both short landscape sizes, the card covered the page heading and its Play action collided with the cue.
- **Fix:** Short phone layouts use a shorter live preview, a two-line summary, and tighter hero spacing. Short landscape layouts keep the heading and Book a call in one compact row above a shorter preview and one-line summary.
- **Verified:** Reproduced and rechecked in the running app at all four viewports. The page heading, Book a call action, article context, Play with it action, and scroll cue remain distinct without overlap.

## Working flows and notes

- Discovery detail panels opened from the article grid, updated the URL fragment, and supported Surprise me and closing the panel. The detail panel’s Copy link action copied the selected discovery URL, including its fragment.
- The atlas Cards view showed results, and an unmatched search displayed a clear zero-results message with a way to recover.
- The Erdős grid controls updated pair counts; the fluid controls changed the simulation values; the Lean demo accepted the correct proof and rejected the planted error.
- Marketplace copy controls displayed copied-state feedback. World, skill-list, and skill-detail routes remained usable through their URL-backed states.
- Booking hands off to Google Calendar. The appointment schedule loaded with available 30-minute slots in the local timezone. The visual handoff is noticeable, but booking itself worked up to the point of selecting a slot; no booking was submitted.
- The local development overlay and the local-only analytics endpoint were excluded from findings because they are not visitor-facing application behavior in the audited journeys.

## Review follow-up

### R-01 — P2: Native share cancellation copied the link — fixed

- **Source:** Code review found that cancelling `navigator.share()` fell through to the clipboard fallback and recorded a successful share. The [W3C Web Share API](https://www.w3.org/TR/web-share/) rejects with `AbortError` when a share is cancelled.
- **Fix:** `AbortError` now stops the flow without copying the URL or recording a share. Other native-share failures still use the clipboard fallback.
- **Verification:** The fix is included in this PR and its CI passed. This cancellation branch was not separately exercised in the application browser walkthrough.

## Iteration log

| Date | Change |
| --- | --- |
| 2026-10-25 | Completed the browser-only walkthrough and added findings A-01 through A-03. No site code was changed. |
| 2026-10-25 | Fixed A-01 mobile preview and story context, A-02 Share feedback and copy fallback, and A-03 responsive atlas default. Rechecked the affected journeys in the running application at 390 × 844 and 1440 × 900. |
| 2026-10-25 | Rechecked the article hero at 305 × 624, 320 × 568, 640 × 360, and 667 × 300; found short-screen overlap A-04, compacted phone and landscape layouts, and verified all actions and the scroll cue remain distinct. All four findings are closed. |
| 2026-10-25 | Fixed the native-share cancellation issue found in code review; CI passed, and the cancellation branch is recorded as not separately exercised in the application walkthrough. |
