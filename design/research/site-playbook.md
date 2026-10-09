# Site playbook: the movie homepage

Research of 2026-09-30. Every change goes through Impeccable, one named change at a time, and Jager judges each before the next. Every impact below is a target or estimate against an unmeasured baseline (PostHog shows 0 solenix.dev pageviews in 30 days), so rule 11 ships first.

## Decisions for the homepage

Ranked by effect on the founder's three verdicts.

1. **Plan: five equal stops on linear scroll.** Stop 1 holds about 161svh; stops 2 to 4 hold 25 to 29svh each (208 to 248 px on a phone) because the step index follows the eased orbit value. Give each stop 90svh or more, index by linear progress, show 10 words or fewer plus one visual. Metric: PostHog `plan_step_dwell` median 3 s or more per stop; stop 5 reached by 70% of stop 1 viewers. Impact: stops crossed per 500 px flick fall from 2.0 to 2.4 to 0.66. Watch scroll-away: too slow also tires users.
2. **Hero: one real race inside two screens.** 74% of viewing time falls in two screenfuls; most abandonment comes in 10 to 20 s. Of Canadian businesses with no AI plan, 79.1% say AI is not relevant to them, so show relevance. Use the cash race, on a connector a St. John's owner can use (QuickBooks is US only). Metric: 30 s engaged sessions 65% or more; 12 of 15 non-technical owners say what Solenix does in 5 s. Impact: first-10-s bounce down 5 to 10 points.
3. **Every race plays to Done and latches.** A race resets when the visitor leaves its window, so anyone faster than about 105 to 180 px/s never sees the clock stop. Run each to the end on its own clock, hold the last frame 2 s, reset two scenes away or on Replay, and add Pause/Replay (WCAG 2.2.2, Level A). Metric: `race_done` over `race_start` 80% or more. Impact: from slow scrollers only to 80% of arrivals.
4. **Show the gap as length.** Under each race, one tape: flat bars from one origin on a linear minutes axis (by hand grey, ask light ember), absolute times at the ends. Today both clocks read alike when the ask stops. Never encode minutes by planet size, area or log axis (80x area looks like 21x). Metric: 5-second test, 20 to 30 owners. Impact: 90% name the faster lane; 70% guess the ratio within 2x.
5. **Every race ends on an output.** Replace "You decide" endings with the thing produced and hours back from `before-after.md`, tagged Example. Add one Approve click and one sourced "cannot" line. Dollars only if `roi-model.md` sources them; ROI lives in the portal, so ask Jager. Metric: 8 of 10 owners state each outcome unprompted. Impact: recall from near 0 to 80%; scorecard Pull 78 to 85.
6. **Print measured times.** Run each ask 5 times on the real connector; footnote "median of 5 runs, [tool], example data, [date]; by hand: typical, estimated, [source]". Today's ask lanes (9.2 to 15.6 s) are scripted; `before-after.md` gives minutes. Metric: printed times with a footnote 100%, enforced in `check.sh`. Impact: honest ratios of 1.7 to 8x (HubSpot lowest), so the wow comes from the output.
7. **Enforce a text budget in `check.sh`.** 25 prose words or fewer per viewport, 10 per pinned step, reading grade 7 or lower, no "% faster". Metric: failing scroll samples 0. Impact: read time per step falls from 4.7 s to 2.5 s at 238 words a minute.
8. **Book a call where motivation peaks.** Today only hero and close carry it. Add one ember pill beside each stopped clock (the only solid fill in view), opening on the calendar, name and email only. Metric: clicks per 100 race completions, 5 or more; click to confirmed booking 50% or more. Impact: total clicks 1.5 to 3 times; mid-page placement is a hypothesis.
9. **Prove who is behind the page.** Real founder photo, "based in St. John's", a Verify link per race to the vendor's connector page, Example tags. Metric: 4 of 5 testers say who and where within 5 s; close-scene click rate 8% or more. Impact: close clicks up 10 to 25% relative (low confidence).
10. **Hold a performance budget.** Poster frame before three.js; mobile p75 LCP 2.5 s, INP 200 ms, CLS 0.1; lazy-load each race. Metric: 75% of loads good on each vital. Impact: each 0.1 s gained cuts lead-page bounce about 8% (correlation, an upper bound).
11. **Instrument first, then compare.** Use a site-only PostHog project (the current one holds 61,766 agent generations). Events: `scene_enter`, `plan_step_dwell`, `race_start`, `race_done`, `cta_click` by section. A 3% Book a call test needs 5,748 visitors per arm (38 weeks at 300 a week), so use before and after, replays and 5-second tests. Metric: 6 of 6 scenes with a baseline in 14 days. Impact: each later change is kept or reverted on a number.

Constraints. No smooth-scroll library; snap only as `proximity`, after a device test. DESIGN.md says three things about reduced motion; pick one. Never print vendor conversion stats on the page. Race order: cash first, Gmail and Calendar last (peak and end; low confidence, revert if completion falls).

## The six examples, rebuilt around purpose, value and impact

**Shopify.** Job: keep best sellers on the shelf, turn dead stock into cash. Output: a reorder email drafted in Gmail and a percentage-off code for slow stock, each behind Approve. By hand: 15 to 25 min (asked, 3 to 5). Connector: reads orders, inventory, analytics; writes products, stock, percentage-off codes; cannot refund or cancel. Shopify's Sidekick covers single-tool stock questions, so chain two tools. Show: SKUs with days-left counters; two glow as they run out, slow movers dim.

**Meta Ads.** Job: stop paying for ads that bring no customers. Output: one approved pause and a paused draft cloned from the best ad. By hand: 15 to 20 min (asked, 3 to 5). Connector: reads spend, ROAS, anomalies; creates ads paused; asks before activation. Docs are silent on confirming pauses and budget edits, so the Approve is Claude's, and Solenix sets Meta's rules that block budget changes. Show: spend streams ending in "bought" or "did not buy"; zero-purchase streams burn out.

**Cash (QuickBooks).** Job: get paid. Output: reminder drafts for invoices over 30 days; total owed as the hero number. By hand: 10 to 15 min to pick who to chase (asked, 2 to 5). Connector: QuickBooks invoices and reminders (writes since 28 July 2026, with preview) are US only. For St. John's use Stripe: creates and finalises invoices and payment links; reminders undocumented. Show: overdue invoices as planets with 30-day rings; the total falls as each is approved.

**Gmail and Calendar.** Job: never lose paying work sitting unanswered. Output: replies drafted, one send approved, an invite booked. By hand: 20 to 40 min triage (asked, 5). Connector: searches, drafts, sends with approval; creates events; cannot read attachment contents. Show: envelopes with an hours-waiting clock that reddens after one hour; three carry work and glow.

**Excel.** Job: trust the numbers and answer what-if without spreadsheet skill. Output: a corrected cell and a what-if result in the owner's own file. By hand: 15 to 30 min (asked, about 5). Connector: explains cells with citations; edits formulas and pivots; creating pivots or charts is undocumented, so drop that prompt until tested; no macros or VBA; Sheets edits are in beta. Show: the workbook as terrain; a SUM stops one row short; citations light the cells; "raise prices 5%" recomputes it.

**HubSpot.** Job: no deal dies in silence. Output: a task and drafted note logged on each quiet deal. By hand: 20 to 30 min for ten deals (asked, 12 to 18; the thinnest gap). Connector: reads deals; writes tasks, notes, activities; drafts or logs email, never sends. Many small owners have no CRM, so keep it mid-order. Show: deals as a corridor whose light fades with days of silence; three re-lit by value.

## Sources

- 2: StatCan 79.1% https://www150.statcan.gc.ca/n1/daily-quotidien/260831/dq260831a-eng.htm
- 2: 74% in two screenfuls https://www.nngroup.com/articles/scrolling-and-attention/
- 2: abandonment in 10 to 20 s https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/
- 1: too slow tires https://www.nngroup.com/articles/scrolljacking-101/
- 3: pause control, Level A https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html
- 4: length beats area https://math.pku.edu.cn/teachers/xirb/Courses/biostatistics/Biostatistics2016/GraphicalPerception_Jasa1984.pdf
- 4: area exponent 0.7 https://en.wikipedia.org/wiki/Stevens%27s_power_law
- 6: footnote pattern https://bun.sh/
- 7: 238 words a minute https://doi.org/10.1016/j.jml.2019.104047
- 7: grade 7 converts 12.9% https://unbounce.com/conversion-benchmark-report/professional-services-conversion-rate/
- 8: motivation, ability, prompt https://www.behaviormodel.org/
- 9: look drives credibility http://credibility.stanford.edu/pdf/How_Do_People_Evaluate_a_Web_Site's_Credibility_v37.pdf
- 9: disclosure, third-party links https://www.nngroup.com/articles/trustworthy-design/
- 10: 0.1 s, 8.3% bounce https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html
- 10: vitals thresholds https://web.dev/articles/vitals
- 11: sample size formula https://posthog.com/docs/experiments/sample-size-running-time
- Race order: peak and end https://lawsofux.com/peak-end-rule/
- Shopify: reads, writes, limits https://help.shopify.com/en/manual/ai-powered-tools/connecting-ai-tools/shopify-connector-for-claude
- Shopify: Sidekick https://www.shopify.com/enterprise/blog/sidekick-ai-questions
- Meta: reporting tools https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-comprehensive-reporting
- Meta: paused until confirmed https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-ad-creation-and-management
- Meta: rules block budget changes https://www.facebook.com/business/news/meta-ads-ai-connectors
- QuickBooks: US only https://quickbooks.intuit.com/learn-support/en-us/help-article/accounting-bookkeeping/use-quickbooks-connector-claude/L3YBlo6Ht_US_en_US
- QuickBooks: invoice writes https://quickbooks.intuit.com/r/news/quickbooks-expands-into-claude-and-chatgpt-with-new-features/
- Stripe: invoices, payment links https://docs.stripe.com/mcp
- Gmail, Calendar, Sheets beta https://support.claude.com/en/articles/10166901-use-google-workspace-connectors
- Excel: capabilities, limits https://claude.com/docs/office-agents/excel
- HubSpot: reads, writes, no send https://developers.hubspot.com/changelog/remote-hubspot-mcp-server-is-now-generally-available
- Times: `design/before-after.md`, `design/home.html`
