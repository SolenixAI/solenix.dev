# Before/After examples: Claude (Team/Enterprise) or ChatGPT (Business) connected to real small-business tools

Scope and method: every row below is grounded in (1) an official vendor/connector source showing the action is real and whether it is read or write, and (2) a manual-time source — a published time study where one exists, otherwise a conservative estimate built from the documented step count, labeled as such. AI time is a measured study's number where a directly relevant one exists (Noy & Zhang 2023 for writing tasks, Brynjolfsson/Li/Raymond 2023 for support-style triage), otherwise a conservative estimate, labeled as such. Nothing below assumes a capability that isn't shipped today (Sept 2026).

Two baseline studies used throughout:
- **Noy & Zhang (MIT, Science 2023)** — 444 professionals given incentivized writing tasks; ChatGPT access cut average completion time by **40%** and raised output quality by 18%. https://www.science.org/doi/10.1126/science.adh2586 / PDF: https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf
- **Brynjolfsson, Li & Raymond (NBER 2023)** — 5,179 customer-support agents given a generative AI assistant; issues resolved per hour rose **14% on average, 34% for novice/low-skilled agents**. https://www.nber.org/papers/w31161

---

## 1. Shopify

Official connector: **Shopify connector for Claude**, Anthropic-verified, in Claude's Connectors Directory — 25 tools covering product search/retrieval, order & customer lookup, inventory checks, analytics queries, collection info (all read), plus product create/update, inventory adjustments, discount creation, collection edits, image uploads and bulk status updates (write, user must sign in and approve the connection; Shopify's own help docs describe bulk product edits in batches of up to 50). Sources: https://claude.com/marketplace/connectors/shopify , https://www.usecarly.com/blog/shopify-mcp/

| Task | Manual steps & time | Exact prompt | AI time | Capability source | Time source | Confidence |
|---|---|---|---|---|---|---|
| "Which products sold best last month and what should I reorder?" | Shopify Admin → Analytics → Reports → "Sales by product," set date range, sort by units sold, then separately check Inventory levels per product to decide reorder quantities. ~15–25 min for a small catalog. | "Pull last month's top 10 sellers by units sold, show current stock on hand for each, and tell me which ones will run out in the next 30 days at the current sell-through rate." | ~3–5 min (one query combines sales + inventory that otherwise live in two separate screens) | Read-only: `search_products`, analytics query tools — confirmed in Shopify connector tool list (claude.com/marketplace/connectors/shopify) | Manual time: conservative estimate from documented UI steps (no published time study found) | Medium |
| Draft product descriptions for 5 new items | Write ~50–200 words per item from scratch or brief a freelancer; small-business estimates range 15 min to over an hour per description depending on complexity. Source: https://realwaystoearnmoneyonline.com/writing-product-descriptions/ , https://www.stellarcontent.com/blog/writers-hub/how-to-complete-product-description-writing-jobs-like-a-pro/ | "Here are 5 new products with specs and a photo each [attach/paste]. Draft a 75-word Shopify product description for each, in our usual friendly-but-direct tone, and highlight the one standout feature per product." | ~40% less time per description (Noy & Zhang), i.e. roughly 10–30 min total for 5 drafts the owner still edits and approves before publishing | Write: `create-product`/`update-product` can push the approved text live, or the owner copy-pastes manually — both documented in the connector's tool list | Noy & Zhang 2023 (−40% on writing tasks) | Medium |
| Find unfulfilled orders | Admin → Orders → filter by "unfulfilled," scroll/review list, note which need shipping labels. ~5–10 min for a modest order volume. | "List every unfulfilled order older than 2 days, grouped by shipping method, with customer name and what's in the order." | ~1–2 min | Read-only: `list-orders`, `get-order` — confirmed tools | Manual time: conservative estimate from documented steps | Medium-High |

---

## 2. Meta Ads

Official connector: **Meta's own hosted MCP server at mcp.facebook.com/ads**, launched in open beta **April 29, 2026**, 29 tools across performance reporting, campaign management, catalog management and signal diagnostics. Meta's own docs name Claude, Claude Code, ChatGPT and Perplexity as supported clients. The connection gives "direct authenticated access to read from and write to a Meta ad account, with safety defaults built in at the connector level" — i.e., write actions like pausing a campaign are real but gated by Meta's own safety defaults (per-action confirmation). Sources: https://www.usecarly.com/blog/meta-ads-mcp/ , https://adadvisor.ai/blog/mcp-facebook-com-ads-official-meta-setup , https://pasqualepillitteri.it/en/news/1707/official-meta-ads-mcp-claude-29-tools-2026

| Task | Manual steps & time | Exact prompt | AI time | Capability source | Time source | Confidence |
|---|---|---|---|---|---|---|
| "How did last week's ads do, and which should I pause?" | Log into Ads Manager, set date range to last 7 days, scan spend/CPA/ROAS columns per campaign and ad set, cross-reference against last week, decide what's underperforming. ~15–20 min for a handful of active campaigns. | "Pull spend, cost per result, and ROAS for all active campaigns over the last 7 days vs. the 7 days before. Tell me which ad sets are underperforming and recommend which to pause." | ~3–5 min to get the comparison; owner still makes the pause call | Read: performance reporting tools in Meta's 29-tool set; Write: pausing requires the same connector's campaign-management tools, subject to Meta's approval/safety defaults | Manual time: conservative estimate from documented Ads Manager workflow | Medium |
| Draft new ad copy variants to test | Write 3–5 headline/body variants from scratch, matching brand voice and platform character limits. Loosely comparable to general copywriting; no ads-specific time study found. | "Here's our best-performing ad from last month [paste copy + results]. Draft 4 new headline/body variants testing a different angle (urgency, social proof, price, and a question hook), each under Meta's character limits." | ~40% less time (Noy & Zhang proxy for writing tasks) | Write: ad-creative tools in the connector's catalog-management set (owner reviews before anything goes live — Meta requires its own ad review regardless) | Noy & Zhang 2023, applied as a proxy (not ads-specific) | Low-Medium (proxy study, not ads-specific) |

---

## 3. Stripe (getting paid)

Why Stripe, not QuickBooks: Intuit says "The QuickBooks connector for Claude is currently available to US customers only" (checked 2026-10-01: https://quickbooks.intuit.com/learn-support/en-us/help-article/accounting-bookkeeping/use-quickbooks-connector-claude/L3YBlo6Ht_US_en_US). Solenix is in St. John's, so the race uses a connector a Canadian owner can use today. Revisit when Intuit opens QuickBooks Online Canada.

Official connector: the Stripe MCP server / Claude connector (https://docs.stripe.com/mcp, checked 2026-10-01). Its supported methods include listing, retrieving, creating, updating and finalising invoices, creating invoice items, and creating payment links. A finalised invoice with `collection_method: send_invoice` is emailed to the customer by Stripe. Stripe asks a human to confirm risky writes (refunds, outbound payments) through a link.

| Task | Manual steps & time | Exact prompt | AI time | Capability source | Time source | Confidence |
|---|---|---|---|---|---|---|
| "Who owes us money?" | Stripe Dashboard → Billing → Invoices, filter to Past due, then read each customer and decide who to chase: realistically 10–15 min. | "Who owes us? Sort by how late, and flag anyone over 60 days." | ~2–5 min including review | Read: List all invoices (Stripe MCP supported methods) | Manual time: estimate from the dashboard steps; no published study | Medium |
| Draft and send an invoice | Invoices → Create, pick the customer, add the item, set the due date, review, send: a few minutes with existing customer and product records. | "Send Harbour Dental their invoice for website care, due in 15 days." | ~1–2 min (one sentence replaces the form), then the owner approves | Write: Create an invoice, Create an invoice item, Finalize an invoice (Stripe MCP supported methods) | Manual time: estimate (comparable to QuickBooks' own "under five minutes" figure for the same job) | Medium |

Not possible today: automatic payment reminders through the connector aren't documented (Stripe's own reminder emails are a Dashboard setting).

---

## 4. Google Business Profile

**No official Google-published MCP/connector exists for Business Profile.** Every connector found (Markifact, ReputeMap, Windsor.ai, Localo, Data Bloo) is third-party, built on Google's Business Profile API, not an Anthropic/Google/OpenAI first-party integration. This is an honest capability gap worth stating plainly on the site: the action is real and shippable today, but through a third-party connector the owner has to trust and install themselves — not a verified first-party one like Shopify's or Meta's. Sources: https://www.markifact.com/google-business-profile-mcp , https://localo.com/mcp (explicitly read-only, no write), https://windsor.ai/connect/google-business-profile-to-claude-integration/

| Task | Manual steps & time | Exact prompt | AI time | Capability source | Time source | Confidence |
|---|---|---|---|---|---|---|
| Reply to a new review | Log into Google Business Profile, open Reviews, read it, write a personalized reply (5–15 min per review manually, per a 2026 review-response study). Source: https://www.replyonthefly.com/blog/google-review-response-time-study | "Reply to this new 4-star review mentioning our slow checkout line — thank them, acknowledge it, and mention we've added a second register." | Under 30 seconds per drafted reply (same study, AI-assisted condition), plus the owner's own quick read before posting | Write: via third-party connector only (e.g. Markifact describes "replying to reviews with approval controls"); **no first-party Google connector offers this yet** | https://www.replyonthefly.com/blog/google-review-response-time-study | Low (capability is third-party, not vendor-official) |
| Update holiday hours across locations | Google Business Profile → Info → Hours → Special hours, repeated per location. A few minutes per location, more with several locations. | "Set special hours for Thanksgiving and the day after at all 3 locations: closed Thanksgiving, 10am–4pm the day after." | A few minutes handled in one request instead of per-location clicking (estimate) | Write: third-party connector only, same caveat as above | Estimate — no published study found | Low |

---

## 5. Gmail & Google Calendar

Official connector: **Anthropic's Google Workspace connectors (Gmail, Calendar, Drive)**, generally available since ~Feb 2026. Gmail: search, summarize threads, draft/send/reply/forward — Claude asks approval before anything sends and never acts on an incoming message unprompted. Calendar: full read/write — create, update, delete events, find open times, RSVP, recurring meetings, Meet links. Source: https://www.usecarly.com/blog/claude-gmail-integration/ , https://www.usecarly.com/blog/claude-google-calendar-integration/

| Task | Manual steps & time | Exact prompt | AI time | Capability source | Time source | Confidence |
|---|---|---|---|---|---|---|
| Triage a backlog inbox | The average professional spends ~2.6 hrs/day processing email (Harvard Business Review figure, widely cited); working through a day's backlog of mixed-priority mail realistically runs 20–40 min for a small-business inbox. Source: https://agiled.app/statistics/email-productivity-statistics | "Go through today's inbox and group everything into: needs a reply today, can wait, and junk/newsletters. For the 'needs a reply today' ones, tell me what each is asking for in one line." | ~5 min to read the summary and decide what to act on | Read: Gmail connector search/summarize — confirmed GA capability | Manual baseline: HBR-cited average; AI time is a conservative estimate (no Gmail-specific controlled study found; Brynjolfsson's support-triage study used as a loose proxy for "AI speeds up sorting incoming messages") | Medium |
| Draft replies to 8 routine emails | ~3–5 min per reply typed from scratch = 25–40 min total. | "Draft replies to these 8 emails [or: the ones flagged 'needs a reply today'] — keep them short, match my usual tone, and flag any that need a number or date from me before you can finish them." | ~40% less time per Noy & Zhang, so roughly 15–24 min including the owner's review/edit/send-approval pass (Claude never sends without approval) | Write (draft/send with approval) — confirmed GA capability | Noy & Zhang 2023 | Medium |
| Schedule a meeting with a client | Calendly's own research found it takes an average of **7.3 emails** to schedule one meeting by hand. Source: https://calendly.com/blog/find-a-meeting-time | "Find a 30-minute slot next week that works for me and [client], and send them a Calendar invite with a Meet link." | ~2–3 min — one request instead of a multi-email back-and-forth | Write: Calendar connector create-event/find-time — confirmed GA capability | Calendly's own published benchmark (not an AI-specific study, used as the honest manual-cost baseline) | Medium |

---

## 6. Spreadsheets: Google Sheets vs. Excel

Important asymmetry to be honest about on the site: Anthropic has **no dedicated Google Sheets connector** — the only first-party path is the Google Drive connector, which reads a sheet as context and can generate a brand-new spreadsheet, but **cannot edit an existing Google Sheet in place**. By contrast, **Claude for Excel** is a native Microsoft 365 add-in (beta Oct 2025, opened to all Pro subscribers Jan 24, 2026, out of beta mid-2026) that reads AND edits an existing workbook directly — cells, formulas, pivot tables — without breaking dependencies. Sources: https://www.usecarly.com/blog/claude-google-sheets-integration/ , https://the-decoder.com/anthropic-opens-claudes-improved-excel-integration-to-all-pro-subscribers-after-limited-beta/

| Task | Manual steps & time | Exact prompt | AI time | Capability source | Time source | Confidence |
|---|---|---|---|---|---|---|
| Summarize a sales sheet (Google Sheets) | Open the sheet, scroll/skim totals, maybe build a quick pivot table if the owner knows how. ~10–20 min for an owner not fluent in pivot tables (estimate). | "Here's our sales tracker [attach/share from Drive]. Summarize this month vs. last month by product category and call out anything that moved more than 20%." | ~3–5 min to read the summary (read-only — Claude cannot write the summary back into that same sheet; it would need to generate a new file) | Read-only via Google Drive connector — confirmed; write-in-place NOT available for Sheets today | Manual time: conservative estimate, no published study found | Medium (capability is clearly scoped/limited — stated honestly) |
| Build on a sales workbook in place (Excel) | Same task, but the owner (or Claude) needs to actually update the live workbook — add a pivot, fix a formula, extend a chart. Manually: 15–30 min depending on Excel fluency (estimate). | "In this workbook, add a pivot table summarizing revenue by product category for this month vs. last month, and build a simple bar chart next to it." | ~5 min — Claude edits the open workbook directly, preserving existing formulas | Read + write in place — confirmed capability of the official Claude for Excel add-in | Manual time: conservative estimate; capability confirmed via Anthropic's own product rollout coverage | High

---

## Bonus: Square, HubSpot, Mailchimp (real connectors confirmed)

- **Square**: Official Square connector in Claude's Connectors Directory, added **Nov 2025**, read/write — transaction data, customer profiles, inventory, payments. No event triggers (nothing fires automatically on a new sale). Source: https://claude.com/connectors/square
- **HubSpot**: Official remote MCP server (mcp.hubspot.com) reached **General Availability in April 2026** with write access, activity history and marketing-content objects; a no-code "HubSpot connector for Claude" also exists for click-to-add setup. Source: https://www.hubspot.com/claude , https://syncgtm.com/blog/claude-code-hubspot-mcp
- **Mailchimp**: Official "Intuit Mailchimp" connector in Claude's Connectors Directory, read/write — campaigns and audience/subscriber data. Mailchimp itself announced a Claude integration alongside its own "Analytics AI" conversational agent in a **May 28, 2026** release. Source: https://www.usecarly.com/blog/claude-mailchimp-integration/

| Tool | Task | Manual steps & time | Exact prompt | AI time | Time source | Confidence |
|---|---|---|---|---|---|---|
| Square | "Which days and items sold best this week, and are we low on any of them?" | Square Dashboard → Reports → Sales, filter to this week, sort by item, then separately check Items → Inventory. ~10–15 min (estimate). | "What were our top 5 sellers this week by revenue, and which of them are below 10 units in stock?" | ~2–3 min | Manual time: conservative estimate from documented dashboard steps | Medium |
| HubSpot | "Which deals have gone quiet, and draft a follow-up for each" | Filter the deals list by last-activity date, sort, open each stalled deal, write a follow-up email per contact. ~20–30 min for ~10 deals (estimate). | "Show me every open deal with no activity in the last 14 days, and draft a short, specific follow-up email for each one referencing what we last talked about." | ~40% less time per Noy & Zhang proxy, roughly 12–18 min including review | Noy & Zhang 2023 (proxy, not CRM-specific) | Medium |
| Mailchimp | Draft a campaign email for a seasonal sale | Open Mailchimp, pick a template, write subject + body, select audience segment, schedule. ~30–45 min (estimate). | "Draft a short campaign email announcing our fall sale (20% off, ends Sunday) to our full subscriber list, with a clear subject line and one CTA button." | ~15–20 min (owner still reviews/approves before the actual send — Mailchimp requires its own send confirmation) | Noy & Zhang 2023 (proxy, not email-marketing-specific) | Low-Medium |

---

## Shortlist: the 6 strongest before/after pairs for the website

Picked for the combination of (a) an unambiguous, vendor-confirmed official connector, (b) a task every small-business owner recognizes instantly, and (c) a time/decision-quality gap that's honest, not hyped.

**1. Shopify — "What sold, what to reorder"**
Before: open Shopify Analytics, pull last month's top sellers, then flip to Inventory to check stock on each one — about 15–25 minutes of screen-hopping.
After: ask "Pull last month's top 10 sellers by units sold, show current stock for each, and tell me which will run out in 30 days" — about 3–5 minutes, same data, one answer.

**2. Meta Ads — "How did last week's ads do, and what should I pause?"**
Before: log into Ads Manager, set a 7-day window, scan spend/CPA/ROAS per campaign by eye — 15–20 minutes.
After: ask Meta's own official Ads MCP (live since April 2026, works in Claude) the same question directly — 3–5 minutes to a ranked answer; the owner still makes the pause call.

**3. Stripe — "Who owes us money" + send the invoice** (QuickBooks' connector is US only; see section 3)
Before: open Invoices, filter to past due, decide who to chase, then separately create, fill in and send an invoice: 10–15 minutes combined (estimate).
After: "Who owes us? Send Harbour Dental their invoice." Stripe's official connector lists invoices and creates and finalises the new one in one conversation, then the owner approves: 2–5 minutes.

**4. Gmail + Calendar — triage and book a meeting without the back-and-forth**
Before: 20–40 minutes sorting a backlog inbox by hand, plus Calendly's own measured average of 7.3 emails to land one meeting time.
After: "Group today's inbox into needs-a-reply-today / can-wait / junk" and "find 30 minutes next week with [client] and send the invite" — a few minutes total, through Anthropic's official, GA Google Workspace connector.

**5. Excel — edit the live sales workbook, not just read it**
Before: open the workbook, build a pivot table and chart by hand — 15–30 minutes depending on Excel fluency.
After: "Add a pivot table of revenue by category this month vs. last, with a bar chart" — Claude for Excel edits the actual open file in place, formulas intact, in about 5 minutes. (Worth stating the honest limit alongside it: the equivalent doesn't exist yet for Google Sheets — Claude can read a sheet but not edit it in place.)

**6. HubSpot — stop losing deals that went quiet**
Before: filter the pipeline for stale deals, open each one, write a follow-up by hand — 20–30 minutes for ten deals.
After: "Show every deal with no activity in 14 days and draft a follow-up for each" — HubSpot's own MCP server went GA with write access in April 2026, so the drafts land ready to send in 12–18 minutes, the owner just reviews and hits send.

---

## Example data shown in the homepage races

Every name and amount below is made up for the demonstration and is tagged "Example" on the page. None is a client, a result or a price.

| Race | What the race ends on | Example names and amounts |
|---|---|---|
| Stripe | The invoice, sent | Invoice to Harbour Dental · $450 · website care · due in 15 days |
| Shopify | The reorder email, waiting on Approve | Sea salt caramels, 14 left · Wool mitts, 9 left |
| HubSpot | A follow-up note on each quiet deal | Harbour Dental · Cove Road Cafe · East End Yoga |
| Meta Ads | The ad that brings no buyers, paused | Local awareness ad · no purchases in 7 days |
| Excel | The corrected total | Sales total $12,480 (was $11,930; one row was missed) |
| Gmail and Calendar | Replies drafted and the meeting booked | 3 replies · meeting with Harbour Dental, Tuesday 10:30 |

