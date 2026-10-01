# ROI Calculator — Evidence Base & Model (solenix.dev)

Research date: 2026-09-30. 32 targeted searches + primary-source verification fetches across StatCan, CFIB, BDC, Goldman Sachs 10KSB, Microsoft WTI, Asana, Anthropic Economic Index, NBER/Science RCTs, Zylo/Productiv, and others. All figures below are extracted with year, sample (where disclosed), and URL. Every weak/vendor/non-SMB-specific figure is flagged **[WEAK]** or **[NOT SMB-SPECIFIC]** or **[VENDOR]** — these are excluded from the calculator's hard-coded constants and used only as narrative color, discounted heavily, or replaced with a more conservative number.

---

## 1. Top problems / time burden on small business owners

| Figure | Source |
|---|---|
| Small businesses spent **735 hours/year** complying with regulation in 2024; **256 hours (32 business days)** of that is "red tape" that could be cut without harming health/safety — up **35% since 2020**. Businesses <5 employees spend **$10,208/employee/year** on compliance vs **$1,374/employee** for 100+ employee firms. 87% of owners say regulation significantly reduces productivity/growth. | [CFIB, "Canada's Red Tape Report," Jan 2025, with Intuit QuickBooks](https://www.cfib-fcei.ca/en/media/small-businesses-spend-over-250-hours-or-32-business-days-a-year-wrapped-up-in-red-tape) — verified via fetch |
| NFIB 2024 Small Business Economic Trends: **73%** of owners name administrative workload as a primary time drain, above hiring, regulation, cash flow. | [NFIB via secondary summary](https://heyteo.ai/resources/small-business-admin-statistics) — **[WEAK: couldn't verify directly on nfib.com, treat as indicative]** |
| 2025 Time Etc survey: small business owners average **16 hrs/week** on admin tasks. | [Time Etc, 2025](https://heyteo.ai/resources/small-business-admin-statistics) — **[WEAK: vendor-adjacent secondary source]** |
| Clockify/Toggl Track analysis of 600,000 time-tracking records (2024): owners **underestimate admin time by 35–50%** vs logged time; owners who *think* they spend 10 hrs/week on admin actually log 14–16 hrs. | [Clockify/Toggl via secondary](https://stealthagents.com/research/startup-admin-burden-statistics-2026) — **[WEAK: secondary aggregator, methodology not independently confirmed]** but directionally useful (self-reported admin-time inputs in a calculator likely understate reality — supports being conservative on the "savings" side, not the "baseline" side) |
| **Intuit QuickBooks 2024 Business Solutions Survey** (Aug 2024, n=630 owners/execs, businesses with 10–99 employees, US): respondents report **~25 hrs/week** spent on manual data entry / reconciling data across apps; **54%** report manual/repetitive tasks as a major challenge. | [Intuit QuickBooks Business Solutions Survey 2024](https://erp.intuit.com/blog/research/business-solutions-survey-2024/) |
| Small business owners report working **~52 hrs/week** on average; 33% work ≥50 hrs/wk, 25% work >60 hrs/wk; 70% work at least one weekend regularly. | [SCORE / OnDeck / Funding Circle survey aggregation](https://www.score.org/articles/how-hard-small-business-owners-work/) — moderate confidence, well-established SCORE source |
| **Goldman Sachs 10,000 Small Businesses** (2024–25 Voices surveys): 89% of hiring businesses struggle to recruit; 53% can't afford a loan at current rates; **57%** say regulatory red tape holds the business back; top policy ask is inflation relief (54%). | [Goldman Sachs 10,000 Small Businesses, 2025](https://www.goldmansachs.com/community-impact/10000-small-businesses-voices/insights/small-business-owners-optimistic-for-2025-but-urge-washington-to-act-on-key-challenges) |
| **US Census Small Business Pulse Survey**-adjacent data (2024–25): inflation named top challenge by 45%; 75% cite rising costs of goods/services/wages; 57% say reaching customers/growing sales is the top *operational* challenge (up from 53% in 2023); 56% struggle paying operating expenses; 43% say lack of capital limits growth. | [Aggregated small-business survey data, 2024-25](https://www.nerdwallet.com/business/learn/2024-small-business-report) — moderate confidence, cross-checked against Fed Small Business Credit Survey framing |

**Takeaway for the calculator:** admin burden is large (16–25 hrs/week depending on business size/definition) and self-reported numbers are likely *underestimates*. Use owner-entered hours as the baseline and don't inflate it further.

---

## 2. Tool sprawl at SMB scale

| Figure | Source |
|---|---|
| Average SMB runs **~29–36 apps**; the smallest businesses (≤50 employees) deploy around **36 apps** on average, vs 93 for large enterprises (Okta). Statista cites SMB average growing from 14 apps (2018) to 29 (2024). | [Okta "SMBs at Work 2024"](https://www.okta.com/blog/industry-insights/smbs-at-work-2024-what-apps-make-the-smb-stack/) — good primary source (Okta identity logs, not self-report) |
| SaaS spend per employee: broad market figures range from **$2,500–$10,800+/employee/year** depending on company size and year; mid-market/SMB-specific per-FTE estimates: $8,000/FTE for startups (0-20 employees), falling to ~$1,741–2,583/FTE for 50–200 employee firms. | [Multiple vendor benchmark aggregators](https://www.cledara.com/blog/average-saas-spend-per-employee-2026) — **[WEAK/VENDOR: wide variance between sources (2.5x–4x), no single authoritative SMB number — use as a sanity-check range only, not a hard constant]** |
| **Zylo 2024/2025 SaaS Management Index**: organizations use only ~51–60% of provisioned licenses (40–53% unused); 2024 index found ~$18M average annual license waste; 2025 index found 52.7% of licenses unused, ~$21M average waste. | [Zylo 2024 Index](https://zylo.com/news/2024-saas-management-index/), [Zylo 2025 Index](https://zylo.com/news/2025-saas-management-index) — **[NOT SMB-SPECIFIC: Zylo's customer base is large/mid-market enterprise — dollar figures ($18-21M waste) are meaningless at SMB scale; only the *percentage* unused is potentially transferable, and even that should be discounted since large orgs provision far more speculative seats]** |
| **Vertice SaaS Wastage & Shelfware Benchmark 2025**: 15% of applications entirely unused; 51% underutilized. **Productiv 2025 Benchmark** (mid-market, 500–2,500 employees): 44% of licenses underutilized or idle. | [Vertice 2025](https://www.breeze.pm/articles/saas-tool-sprawl-statistics), [Productiv 2025](https://www.breeze.pm/articles/saas-tool-sprawl-statistics) — **[NOT SMB-SPECIFIC: mid-market/enterprise samples, not 1-50 employee businesses]** |
| CostLoop "2026 SaaS Waste Report for SMBs": SMBs waste **~27%** of annual SaaS budget on unused/underused/duplicated tools; one analysis of 332,000 subscriptions found only 34% actively used; 67% of businesses auto-renewed ≥1 unused tool in the past year. | [CostLoop 2026 SaaS Waste Report](https://costloop.app/saas-waste-report/) — **[VENDOR: CostLoop sells SaaS-spend-management software — self-interested source, but it is the only report that claims to be SMB-specific; treat the 27% figure as a plausible upper-middle anchor, not gospel]** |
| Capterra 2024 US Tech Trends Survey: **58%** of US software buyers regret at least one purchase made in the past 12–18 months; 65% planned to spend *more* on software in 2024 than 2023. | [Capterra 2024 Tech Trends Report](https://www.capterra.com/resources/us-tech-trends/) — decent SMB-relevant source (Capterra's panel skews SMB) |
| Canadian context — **CFIB 2025 digital transformation report** (n=1,683 owners, Apr–Jun 2025): 92% of Canadian small businesses use *some* digital tool, but only **10%** have fully integrated digital tools across operations; top barriers to further adoption are "don't know which tools are worth paying for" and "lack of time/internal expertise," not cost. Digital adoption correlates with **29% higher productivity** and **$1.60 return per $1 invested**. | [CFIB, "Digital Transformation: SMEs in Canada," Sept 2025](https://www.cfib-fcei.ca/en/media/digital-adoption-including-ai-paying-off-for-smes-but-gaps-remain) |

**Takeaway for the calculator:** the enterprise SaaS-waste numbers (40–53% unused, Zylo/Productiv/Vertice) are **not usable as SMB constants** — flagged out. The best SMB-anchored number is CostLoop's 27% (vendor, moderate confidence) combined with CFIB's finding that most Canadian SMBs are *not* fully integrated (10%) and don't know what's worth paying for. **Recommended conservative constant: 15–25% recoverable software spend**, well under the enterprise 40%+ figures.

---

## 3. Legacy/outdated software

| Figure | Source |
|---|---|
| "62% of IT professionals still rely on legacy systems"; "outdated software holding back ~74% of businesses"; legacy tech averages 31% of an org's technology footprint; legacy upgrades cost the average business **$2.9M in 2023**; legacy systems consume up to 80% of IT budgets; IT teams spend ~17 hrs/week maintaining legacy systems; ~$40,000/year average maintenance cost per legacy system. | [Various enterprise-IT sources, e.g. CIO Dive citing Asperitas/other analyst data](https://www.ciodive.com/news/legacy-technology-technical-debt-costs-enterprise-data-AI/721885/) — **[NOT SMB-SPECIFIC, WEAK: these are enterprise-IT benchmark aggregator pieces, dollar figures ($2.9M, $40k/system) assume large-org IT estates; not transferable to a 1-50 person business]** |
| ERP/accounting-system migration for small business: **$5,000–$20,000** typical first-year migration cost for 1–10 users; **$20,000–$200,000** for 10–50 users; data migration alone **$5,000–$30,000+**; QuickBooks Desktop→Online migrations can be as fast as "a couple hours" for simple files; cleanup of customer/vendor master records commonly needs **40–120 hours** of staff time (~$1,600–$7,200 in labor); 55–75% of ERP switches run over budget/schedule without proper prep; done right, switch typically pays back in **12–18 months** via 15–25% process time savings. | [ERP/accounting migration cost aggregators](https://virexra.com/erp-migration-cost/), [friendhood.net on accounting platform switching costs](https://www.friendhood.net/the-hidden-cost-of-switching-accounting-platforms-and-how-to-cut-it/) — **[WEAK-MODERATE: directionally useful ranges, but these are industry-consultant estimates, not controlled studies; wide ranges reflect real variance by complexity]** |

**Takeaway for the calculator:** there is **no credible SMB-specific hard dollar constant** for "cost of running legacy software" or "savings from migrating off it" — this entire category is a **narrative/qualitative selling point** (reduce 40–120 hours of future migration pain, avoid vendor rate hikes, consolidate data) rather than a formula input. The calculator should surface this as a *flagged, low-confidence, optional* line item — e.g., a small fixed "legacy tax" estimate only when the user says they're on legacy/on-prem software, clearly labeled as an estimate requiring a real conversation, not precision math.

---

## 4. Scattered data / context switching

| Figure | Source |
|---|---|
| **Microsoft Work Trend Index** (annual report, large-scale telemetry + survey): workers spend **~1 hour/day searching** for information scattered across apps; 62% struggle with too much time spent searching; employees interrupted by a meeting/email/ping roughly **every 2 minutes**, totaling 275+ interruptions/day; 57% of M365 time goes to communicating (meetings/email/chat), 43% to creating; 68% say they lack enough uninterrupted focus time; 80% of the global workforce says it lacks time/energy to do its job. | [Microsoft Work Trend Index 2024/2025](https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday) — strong source (telemetry-based for interruption/time-in-app data, survey for sentiment), but **[NOT SMB-SPECIFIC: sample skews to Microsoft 365 enterprise/knowledge-worker users, not 1-50 person shops/trades/clinics]** |
| **Asana Anatomy of Work**: average knowledge worker spends **209 hours/year** on duplicative work; teams see duplication increase ~30% YoY; workers lose **57 min/day** switching between collaboration tools, plus **30 min/day** deciding which tool to use; each tool-switch costs a "reorientation tax" of 20+ minutes; 27% of messages/actions missed, 26% less efficient, 24% of work duplicated due to app overload; nearly 2/3 report digital exhaustion. | [Asana, "Anatomy of Work" / context-switching research](https://asana.com/resources/context-switching) — **[NOT SMB-SPECIFIC: Asana's own customer base and survey panel are knowledge-work/tech-adjacent companies, not trades/retail/clinics; numbers likely overstate the small-business case where staff use fewer, simpler tools]** |

**Takeaway for the calculator:** context-switching costs are real and well documented, but the specific hour figures (1 hr/day searching, 57 min/day switching) come from large-company/knowledge-worker panels. For a 1–50 person shop with 5–15 apps (not 29–58), apply a **heavily discounted** version — e.g., 15–20 minutes/day/employee of friction recovered by having one AI assistant as the "front door" to scattered tools, not a full hour. Treat this as supporting narrative for the "findable information" pillar rather than a standalone calculator line (it's largely captured already inside the general "admin hours" reduction).

---

## 5. Missed revenue (leads, calls, no-shows, cart abandonment)

| Figure | Source |
|---|---|
| **Harvard Business Review study** (2,241 US companies, academic/peer-reviewed-adjacent): firms contacting a lead within 1 hour are **7x more likely** to have a meaningful conversation with the decision-maker than waiting just one more hour; leads contacted after 24+ hours are **60x less likely** to qualify. Average small company (1–300 employees) actual response time: **~48 minutes**; but average across all businesses in some studies is as slow as 47 hours. 78% of customers buy from the first company that responds. | [HBR lead-response-time study, cited widely](https://www.teamgate.com/blog/lead-response-time-study-speed-impacts-revenue/) — credible, widely cross-cited academic-style study; exact original citation (Oldroyd/McElheran/Elkington, HBR 2011, "The Short Life of Online Sales Leads") is dated but **repeatedly reconfirmed** in later industry data; treat 7x/60x as directionally strong but note it is **>10 years old research**, re-reported, not a fresh 2024-26 figure |
| Velocify: responding within 1 minute increases conversion **391%**; leads reached within 5 minutes are **21x** more likely to convert than those reached after 30 minutes. | [Velocify / InsideSales.com study, widely re-cited](https://www.leadangel.com/blog/operations/speed-to-lead-statistics/) — **[WEAK/VENDOR: original Velocify (lead-management vendor) study, exact year/sample unclear from secondary citations — treat 391%/21x as upper-bound, not a planning number]** |
| "62% of business calls go unanswered," costing the average small business **$126,000/year** (~$10,500/month); missed-call cost ranges **$100–$1,200** per call depending on industry; home-service missed-call rate ~27%, costing ~$1,200/missed call; **85%** of callers who can't reach a business never call back, and most call a competitor instead. | [Dialzara / GetAira / CallJolt-style blog aggregators, 2025-26](https://www.getaira.io/blog/missed-business-calls-statistics) — **[WEAK, VENDOR: these are AI-answering-service vendors marketing their own product; the $126,000/year figure in particular should NOT be hard-coded — it is almost certainly back-calculated from assumed call volume × assumed value, not an independent survey]** |
| Cart abandonment: global average **~70–79%** depending on year/source (70.2% in 2024, 75.4% in 2025 per one tracker; other trackers report up to 78.8%). Top reasons: extra costs at checkout (47%), slow delivery (21%), distrust of entering card details (19%). Email recovery: ~39% open rate, ~23% CTR on abandoned-cart emails. $4.6T in abandoned cart value annually worldwide; up to $260B estimated recoverable. | [Multiple e-commerce analytics aggregators (Baymard-style methodology, re-reported), 2024-25](https://www.upcounting.com/blog/average-ecommerce-cart-abandonment-rate) — moderate confidence for the % (consistent 70-79% range across many trackers over many years, including Baymard Institute's long-running benchmark which these aggregators cite), but **[the $ recoverable figures are back-of-envelope, not SMB-specific]** |
| No-shows: blended average no-show rate across service industries **~23%**; healthcare ~27% (dental w/o reminders ~30%, subsidized clinics ~35%); salons/spas ~20–30% (Phorest 2023 Industry Report); fitness ~15%; professional-service consults ~18%. Automated SMS/email reminders cut no-shows from 20-30% down to **5-10%**; deposit-at-booking systems cut no-shows to 3-5%. A salon with a 20% no-show rate loses roughly $3,600/month; small businesses overall lose an estimated **~14% of potential revenue** to missed appointments. | [Scheduling-industry reports (SchedulingKit, SimplyBook, Phorest), 2023-26](https://schedulingkit.com/hub/scheduling/appointment-no-show-statistics) — **[VENDOR-ADJACENT: scheduling-software companies publish most of these; Phorest's underlying Industry Report is closer to a real salon-industry survey and the most citable of the group]** |

**Takeaway for the calculator:** the strongest, least vendor-tainted number in this whole category is the **HBR speed-to-lead study (7x / 60x)** — old but methodologically solid and endlessly reconfirmed. The "$126,000/year missed-call" and "391% conversion" figures are vendor marketing math and should **not** be hard-coded as constants; use them only as illustrative framing with a clear caveat, and build the calculator's actual lead-loss formula on user-provided lead volume/value with a conservative, self-defined uplift rate (see model, section 8).

---

## 6. Measured AI effects (the credible core of the model)

This is the strongest part of the evidence base — real RCTs and large administrative-data studies, not vendor surveys.

| Study | Design | Result | Source |
|---|---|---|---|
| **Brynjolfsson, Li & Raymond, "Generative AI at Work"** (NBER 2023, published QJE 2025) | 5,172 customer-support agents at a Fortune 500 software firm; staggered rollout of GPT-based chat assistant (quasi-experimental, admin data) | **+15%** average agent productivity (issues resolved/hour); **+34%** for novice/low-skill agents, ~0 for experienced top performers; also improved customer sentiment and retention | [NBER w31161](https://www.nber.org/papers/w31161) |
| **Noy & Zhang, "Experimental evidence on the productivity effects of generative AI"** (Science, 2023) | Preregistered RCT, 444 college-educated professionals, incentivized mid-level writing tasks, half given ChatGPT | Time to complete task **down ~40%** (0.8 SD); output quality **up ~18%** (0.4 SD); biggest gains for weaker writers; reduced output inequality | [Science 381, 187-192 (2023)](https://www.science.org/doi/10.1126/science.adh2586) |
| **Dell'Acqua et al. / BCG, "Navigating the Jagged Technological Frontier"** (HBS working paper 2023) | Preregistered RCT, 758 BCG consultants, randomized to no-AI / GPT-4 / GPT-4+prompt training | On in-frontier tasks: **+12.2% more tasks completed, 25.1% faster, 40%** higher quality; on out-of-frontier tasks, AI users did **19 points worse** — the "jagged frontier" caveat matters for setting expectations | [HBS Working Paper 24-013](https://www.hbs.edu/ris/Publication%20Files/24-013_d9b45b68-9e74-42d6-a1c6-c72fb70c7282.pdf) |
| **GitHub Copilot RCT** (Peng et al. 2023, Microsoft Research) | Controlled experiment, recruited developers, HTTP server task | **55.8% faster** task completion with Copilot; largest gains for less-experienced developers | [arXiv:2302.06590](https://arxiv.org/pdf/2302.06590) |
| ANZ Bank / Chatterjee et al. Copilot field study | Enterprise field study, real programming tasks | **~42%** average productivity boost; beginners +52%, intermediate +42%, advanced +40% | cited via multiple secondary reviews of the Chatterjee et al. study |
| Google 96-engineer RCT | RCT, complex enterprise-grade coding task | **~21%** time reduction with AI assistance | [arXiv:2410.12944](https://arxiv.org/pdf/2410.12944) |
| **St. Louis Fed, "The Rapid Adoption of Generative AI"** (2024 survey + 2025 follow-ups) | Large-scale US worker survey (nationally representative-style sampling) | Among workers who used genAI in the prior week: time saved = **5.4% of work hours (~2.2 hrs in a 40-hr week)**; 20.5% of frequent (daily) users save **4+ hours/week**; across *all* workers including non-users, aggregate time savings = **1.6%** of total work hours, implying up to **+1.3% labor productivity** since ChatGPT's release; savings lowest in personal-services and leisure/accommodation industries (closest proxy to many Solenix target sectors) | [St. Louis Fed, Feb 2025 / Oct 2025](https://www.stlouisfed.org/on-the-economy/2025/feb/impact-generative-ai-work-productivity) |
| **Anthropic Economic Index** (Jan 2026 report, ~2M Claude.ai + API conversations analyzed) | Observational analysis of real usage, not an RCT | Among tasks where Claude is actually used, estimated time savings are **uneven, mostly 50–95%, median ~81%** per completed task; legal/management tasks save ~2 hrs each, food-prep-adjacent tasks ~30 min; tasks at "high-school" skill level ~9x faster, "college" level ~12x faster | [Anthropic Economic Index, Jan 2026](https://assets.anthropic.com/m/218c82b858610fac/original/Economic-Index.pdf) — **[Caveat: this measures time-per-task-when-AI-is-used, not time saved across a whole work week — it is not comparable to the St. Louis Fed whole-week figure and should not be used interchangeably]** |

**Reconciling these for a conservative model:** task-level RCTs show 15–55% speedups on the specific tasks studied (support tickets, writing, coding, consulting deliverables); the one *whole-economy, self-reported* survey (St. Louis Fed) shows a much smaller **~5% of hours saved among actual users**, because real usage today is narrow and inconsistent, especially in "personal services" industries closest to Solenix's client base. **For a credible, conservative small-business calculator, anchor the time-savings rate to the St. Louis Fed range (5–15%) for *overall admin hours*, not the flashier task-specific RCT numbers (15–55%), and cite the RCTs only as upside/ceiling evidence**, not the default.

---

## 7. Canadian specifics

| Figure | Source |
|---|---|
| Average hourly wage, Newfoundland & Labrador, Q3 2024: **$32.35**; national average: **$35.24**; NL *offered* wage (job postings) **$25.15**. | [StatCan, "Average offered hourly wage and average hourly wage by province," Dec 2024](https://www150.statcan.gc.ca/n1/daily-quotidien/241216/mc-a001-eng.htm) — verified by direct fetch |
| National average usual hourly wage, employees 15+, April 2025: **$36.13** (up from $35.83 in Dec 2024). | [StatCan, Aug 2025 release](https://www150.statcan.gc.ca/n1/daily-quotidien/250818/cg-d001-eng.htm) |
| Retail trade average hourly wage (2024, Canada): **$23.08**; wholesale trade: **$29.93**; general "trades" ~$28.78 (ISED Canadian Industry Statistics, drawing on StatCan Table 14-10-0064). Legal/accounting-specific hourly figures were not isolated from this table in available results — recommend pulling NOC-specific rows (e.g., NOC 1311 bookkeepers, NOC 4112 lawyers) directly from Job Bank/StatCan before finalizing calculator defaults. | [ISED Canadian Industry Statistics – Retail Trade](https://ised-isde.canada.ca/app/ixb/cis/salaries-salaires/44-45), [StatCan Table 14-10-0064](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410006401) |
| Canada small-business counts (Dec 2024): **1,079,188** businesses with 1–99 employees = **98.2%** of all employer businesses; micro-enterprises (1-4 employees) = 59.2% of all businesses, rising to 77.3% including 5-9 employee firms; small businesses employ **5.8 million** people = 46.6% of the private labour force. | [ISED, Key Small Business Statistics 2024/2025 + StatCan Canadian Business Counts](https://ised-isde.canada.ca/site/sme-research-statistics/en/key-small-business-statistics/key-small-business-statistics-2024) |
| **BDC 2024/2025 AI-adoption research**: only 39% of entrepreneurs initially *believed* they used AI, but when shown a list of AI-powered tools, **66%** recognized they actually use at least one AI function; AI-using SMEs are **24% more productive** (higher sales/employee) than non-users; if all Canadian SMEs adopted AI, BDC estimates **+6% GDP (~$150B)**; 97% of AI-using SMEs report tangible benefits (efficiency, cost, sales, service, inventory); adoption skews to larger (100+ employees: 86%) and younger (≤5 years: 78%) firms vs. smaller (60%) and older (≥25 years: 48%) firms. | [BDC, 2024 press release](https://www.bdc.ca/en/about/mediaroom/news-releases/new-bdc-study-reveals-27-pourcent-of-canadian-entrepreneurs-don-t-know-they-re-using-artificial-intelligence-ai) |
| **CFIB 2025** (n=1,683, Apr–Jun 2025): **41%** of Canadian SMEs use generative AI, only **18%** daily; 47% say they're investing in AI (42% of smallest firms vs 62% of 20–49 employee firms); top barriers are "don't know which tools are worth it" and lack of time/expertise, not cost; digital adoption linked to 29% average productivity gain, $1.60 return per $1 invested. | [CFIB, Sept 2025](https://www.cfib-fcei.ca/en/media/digital-adoption-including-ai-paying-off-for-smes-but-gaps-remain) |
| Microsoft/Canada release (June 2025): **71%** of Canadian SMBs are "actively using AI tools" to drive efficiency/growth (note: broader AI definition than CFIB's genAI-specific 41%, so these are not contradictory, just measuring different things). | [Microsoft News Canada, June 2025](https://news.microsoft.com/source/canada/2025/06/25/majority-of-canadian-small-and-medium-sized-businesses-embrace-ai-with-71-actively-using-tools-to-drive-efficiency-and-growth/) |

---

## 8. The calculator model

### Design principle
Owner answers 5–7 simple questions in well under a minute. Every output ties to **hours/week**, **$/year saved**, or **$/year made**. Every constant below is deliberately set at or below the **low end** of the credible literature (section 6 + flagged exclusions), not the vendor-hype numbers. Each output shows a **range (low–mid–high)**, not a single falsely-precise number, and a one-line "based on" citation is shown in a tooltip.

### Inputs (owner-facing, plain language)

| # | Question | Type | Notes |
|---|---|---|---|
| 1 | What kind of business is this? | Picklist: Retail/Shop · Restaurant/Café · Trades/Field service · Law/Accounting/Professional services · Health/Dental clinic · Salon/Spa/Personal care · E-commerce · Other | Drives defaults for hours/week, avg ticket value, appointment vs. lead model |
| 2 | How many people work there (including you)? | Slider/picklist: 1–5 / 6–15 / 16–30 / 31–50 | Drives default admin hours and default software spend if unknown |
| 3 | Which of these do you use today? | Multi-select picklist: QuickBooks/Sage/Xero · Shopify/Square/e-commerce · Google Workspace/Microsoft 365 · Meta/Google Ads · HubSpot/Mailchimp/CRM-email · Calendly/scheduling tool · Spreadsheets only · Older/on-premise or industry-specific legacy software · None of these | Flags "legacy software" case; used for qualitative "what we'd consolidate" output, not hard math |
| 4 | Roughly, what do you spend on software/subscriptions per month? | Picklist bands: <$200 · $200–500 · $500–1,000 · $1,000–2,500 · $2,500+ · Not sure | "Not sure" → default by team-size band |
| 5 | About how many hours a week go to admin — email, bookkeeping, scheduling, data entry, chasing paperwork? | Slider 0–40, pre-filled with an industry/team-size default the owner can drag | Default per section 1: see below |
| 6 | When someone calls, messages, or submits a form, what usually happens? | Picklist: We answer almost every time, fast · We get back to most people, sometimes slowly · We often miss or take a long time to respond | Drives the missed-lead uplift input |
| 7 (optional) | Roughly how many new customer inquiries do you get a month, and what's a typical sale worth? | Two optional numeric fields | If skipped, use industry defaults below |

### Defaults by industry (used only when the owner doesn't override)

| Industry | Default admin hrs/wk (team-scaled) | Default monthly software spend | Default new leads/mo | Default avg sale value |
|---|---|---|---|---|
| Retail/Shop | 12 | $300 | 80 | $60 |
| Restaurant/Café | 14 | $250 | 150 (reservations/orders) | $40 |
| Trades/Field service | 12 | $350 | 40 | $400 |
| Law/Accounting/Professional | 15 | $500 | 20 | $1,500 |
| Health/Dental clinic | 14 | $450 | 60 (bookings) | $150 |
| Salon/Spa | 10 | $200 | 100 (bookings) | $70 |
| E-commerce | 14 | $600 | 500 (site inquiries/carts) | $75 |

*(Team-size scaling: multiply the base admin-hours default by 1.0 for 1–5 staff, 1.4 for 6–15, 1.8 for 16–30, 2.2 for 31–50 — reflecting QuickBooks' finding that larger small businesses (10–99 staff) report ~25 hrs/week of manual data work vs. Time Etc's ~16 hrs/week for small/solo owners.)*

### Output A — Hours saved per week

```
Hours_saved_per_week = Admin_hours_input × AI_time_savings_rate
```
- **AI_time_savings_rate: low 8%, default 15%, high 25%**
- Source/logic: anchored to **St. Louis Fed 2024** survey (5.4% of hours saved among actual genAI users, 1.6% economy-wide) as the conservative floor, nudged up because Solenix installs and *trains* usage (closer to the "daily/frequent user" cohort, where 20.5% save 4+ hrs/week) rather than passive/occasional use; capped well below the task-specific RCT range (15–55%, Brynjolfsson/Noy&Zhang/Copilot) which measures *in-task* speedups, not whole-week averages.
- **Flag:** this is a modeled extrapolation, not a direct citation — the St. Louis Fed number is whole-economy self-report, not Solenix-specific. Present as a range with the lowest end defensible on its own (8% ≈ St. Louis Fed's lower-middle respondent bands).

### Output B — Dollars saved per year (tool consolidation)

```
Annual_tool_savings = Monthly_software_spend × 12 × Consolidation_rate
```
- **Consolidation_rate: low 10%, default 18%, high 28%**
- Source/logic: deliberately set below CostLoop's SMB-specific 27% waste claim **[VENDOR]** and far below Zylo/Productiv/Vertice's 40–53% **[NOT SMB-SPECIFIC — enterprise]**. CFIB's finding that only 10% of Canadian SMEs are "fully integrated" and most don't know what's worth paying for supports meaningful recoverable spend; 18% default is a deliberately conservative blend.
- **Legacy migration line (qualitative, not formula-driven):** if the owner flags "older/on-premise/legacy software," show a *qualitative* callout — not a dollar figure — because no credible SMB-specific migration-savings constant exists (enterprise figures like "$2.9M/yr legacy cost" and "25% cost cut from modernizing" are not transferable). Optionally show migration cost *context* ($5k–$20k typical one-time cost for a 1–10 user system switch, 40–120 hours of data cleanup) so it reads as credible, not inflated.

### Output C — Dollars made per year (fewer missed leads/appointments)

```
Extra_customers_per_year = Monthly_new_leads × 12 × Lead_recovery_rate
Extra_revenue_per_year   = Extra_customers_per_year × Avg_sale_value
```
- **Lead_recovery_rate** depends on Q6 answer:
  - "We answer almost every time, fast" → **0%** (no upside modeled; already good)
  - "We get back to most people, sometimes slowly" → **low 3%, default 6%, high 10%**
  - "We often miss or take a long time to respond" → **low 8%, default 15%, high 25%**
- Source/logic: grounded in the **HBR speed-to-lead study** (7x more likely to connect within 1 hr vs. 2 hrs; 60x more likely to qualify vs. 24 hrs+) as directional evidence that speed matters enormously — but the recovery-rate numbers themselves are **conservative, Solenix-defined assumptions**, deliberately far below vendor claims like "391% conversion lift" or "$126,000/year lost to missed calls" **[WEAK/VENDOR — excluded as hard constants]**.
- **Appointment-based businesses (salon/clinic/restaurant):** optional second output using a no-show reduction:
```
No_show_savings_per_year = Weekly_appointments × 52 × No_show_rate_reduction × Avg_appointment_value
```
  - **No_show_rate_reduction: low 5pp, default 8pp, high 12pp** (reduction in percentage points, e.g. from an assumed ~20% baseline toward ~12% with automated reminders/confirmations) — anchored to the (vendor-adjacent but industry-standard) scheduling-industry finding that reminders cut no-shows from 20–30% to 5–10%, discounted substantially for a conservative default.
- **Revenue vs. profit caveat:** Extra_revenue_per_year is top-line. The calculator should either ask for a rough gross-margin % (optional 8th question) or clearly label the output "additional revenue opportunity," not profit.

### Output D — Combined annual value
```
Total_annual_value_low  = (Hours_saved_low × 52 × Owner's hourly value) + Annual_tool_savings_low + Extra_revenue_low
Total_annual_value_high = (Hours_saved_high × 52 × Owner's hourly value) + Annual_tool_savings_high + Extra_revenue_high
```
- **Owner's hourly value:** default to StatCan's NL average hourly wage **$32.35** (or national $35.24/$36.13 if outside NL), adjustable; this treats an owner's or staff's recovered hour conservatively at a wage rate, not at the owner's full billing rate, to stay credible.
- Present as a **range**, always rounded down to avoid false precision (e.g., "$14,000–$31,000/year" not "$22,347.50").

### What to flag to the user/visitor (transparency builds credibility)
A small "how we calculate this" expandable section should state plainly: *figures are built from published research (Statistics Canada, CFIB, Goldman Sachs 10,000 Small Businesses, BDC, Microsoft, Asana, and peer-reviewed/NBER studies on AI productivity), always using the conservative end of the range, and adjusted down further for small-business-specific contexts where the underlying study was enterprise-only.* This itself is a credibility differentiator versus competitors who use vendor-sourced "$126,000 lost to missed calls" style numbers.

---

## 5 strongest, most quotable stats for the website

Chosen for: (a) primary/reputable source, (b) specific and verifiable, (c) directly supports the Solenix pitch (time/money), (d) not vendor-hype.

1. **"Small businesses spend 735 hours a year on regulatory compliance — 256 of those hours are pure red tape that adds nothing."** — CFIB, Canada's Red Tape Report, Jan 2025, with Intuit QuickBooks. [cfib-fcei.ca](https://www.cfib-fcei.ca/en/media/small-businesses-spend-over-250-hours-or-32-business-days-a-year-wrapped-up-in-red-tape)

2. **"A Fortune 500 study of 5,172 customer-support agents found AI assistance lifted productivity 15% on average — and 34% for newer, less-experienced staff."** — Brynjolfsson, Li & Raymond, NBER/Quarterly Journal of Economics. [nber.org/papers/w31161](https://www.nber.org/papers/w31161)

3. **"In a Harvard Business Review study of 2,241 companies, firms that contacted a new lead within an hour were 7x more likely to have a meaningful conversation than if they waited just one more hour — and leads left 24+ hours were 60x less likely to ever qualify."** — HBR lead-response-time research. [teamgate.com summary](https://www.teamgate.com/blog/lead-response-time-study-speed-impacts-revenue/)

4. **"Only 1 in 10 Canadian small businesses has fully integrated digital tools into how they operate — even though digital adopters see 29% higher productivity and $1.60 back for every $1 invested."** — CFIB, Digital Transformation report, Sept 2025 (n=1,683 Canadian owners). [cfib-fcei.ca](https://www.cfib-fcei.ca/en/media/digital-adoption-including-ai-paying-off-for-smes-but-gaps-remain)

5. **"In a preregistered Science study, giving professionals access to ChatGPT cut the time needed to complete writing tasks by about 40% while raising quality — with the biggest gains going to the people who started out weakest."** — Noy & Zhang, Science, 2023. [science.org/doi/10.1126/science.adh2586](https://www.science.org/doi/10.1126/science.adh2586)

*(Runner-up, Canada-specific and strong but slightly softer sourcing on the "66%" framing: BDC found that when shown examples, 66% of Canadian entrepreneurs realized they were already using AI without knowing it — and the ones using it are 24% more productive. Good for a "you're probably closer to AI than you think" hook.)*

---

## Index of all sources used (deduplicated)

- CFIB, Canada's Red Tape Report (Jan 2025) — https://www.cfib-fcei.ca/en/media/small-businesses-spend-over-250-hours-or-32-business-days-a-year-wrapped-up-in-red-tape
- CFIB, Digital Transformation: SMEs in Canada (Sept 2025) — https://www.cfib-fcei.ca/en/media/digital-adoption-including-ai-paying-off-for-smes-but-gaps-remain
- CFIB, AI Adoption and Workforce Training Investment — https://www.cfib-fcei.ca/en/research-economic-analysis/ai-adoption
- Intuit QuickBooks Business Solutions Survey 2024 — https://erp.intuit.com/blog/research/business-solutions-survey-2024/
- NFIB Small Business Economic Trends (via secondary) — https://heyteo.ai/resources/small-business-admin-statistics
- Time Etc 2025 survey (via secondary) — https://heyteo.ai/resources/small-business-admin-statistics
- Clockify/Toggl Track 2024 analysis (via secondary) — https://stealthagents.com/research/startup-admin-burden-statistics-2026
- SCORE / small-business work-hours surveys — https://www.score.org/articles/how-hard-small-business-owners-work/
- Goldman Sachs 10,000 Small Businesses Voices (2024-25) — https://www.goldmansachs.com/community-impact/10000-small-businesses-voices/insights/small-business-owners-optimistic-for-2025-but-urge-washington-to-act-on-key-challenges
- US small-business challenge survey aggregation (NerdWallet 2024 report) — https://www.nerdwallet.com/business/learn/2024-small-business-report
- Okta, "SMBs at Work 2024" — https://www.okta.com/blog/industry-insights/smbs-at-work-2024-what-apps-make-the-smb-stack/
- Zylo 2024 SaaS Management Index — https://zylo.com/news/2024-saas-management-index/
- Zylo 2025 SaaS Management Index — https://zylo.com/news/2025-saas-management-index
- Vertice / Productiv benchmark summary (via Breeze aggregator) — https://www.breeze.pm/articles/saas-tool-sprawl-statistics
- CostLoop 2026 SaaS Waste Report for SMBs — https://costloop.app/saas-waste-report/
- Capterra 2024 US Tech Trends Report — https://www.capterra.com/resources/us-tech-trends/
- Legacy-system enterprise cost aggregation (CIO Dive) — https://www.ciodive.com/news/legacy-technology-technical-debt-costs-enterprise-data-AI/721885/
- ERP/accounting migration cost aggregators — https://virexra.com/erp-migration-cost/ ; https://www.friendhood.net/the-hidden-cost-of-switching-accounting-platforms-and-how-to-cut-it/
- Microsoft Work Trend Index — https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday
- Asana, Context Switching / Anatomy of Work research — https://asana.com/resources/context-switching
- HBR lead-response-time study (via Teamgate summary) — https://www.teamgate.com/blog/lead-response-time-study-speed-impacts-revenue/
- Velocify speed-to-lead stats (via LeadAngel) — https://www.leadangel.com/blog/operations/speed-to-lead-statistics/
- Missed-business-calls vendor stats (GetAira) — https://www.getaira.io/blog/missed-business-calls-statistics
- Cart abandonment stats (Upcounting aggregator) — https://www.upcounting.com/blog/average-ecommerce-cart-abandonment-rate
- Appointment no-show statistics (SchedulingKit) — https://schedulingkit.com/hub/scheduling/appointment-no-show-statistics
- Salesforce Small & Medium Business Trends 2025 — https://www.salesforce.com/news/stories/smbs-ai-trends-2025/
- Thryv Small Business AI/Index reports (2024-25) — https://www.thryv.com/2024-small-business-software/ ; https://www.thryv.com/news/new-survey-data-from-thryv-finds-51-of-small-businesses-will-be-using-ai-by-end-of-2025/
- Brynjolfsson, Li & Raymond, "Generative AI at Work" (NBER w31161) — https://www.nber.org/papers/w31161
- Noy & Zhang, "Experimental evidence on the productivity effects of generative AI" (Science, 2023) — https://www.science.org/doi/10.1126/science.adh2586
- Dell'Acqua et al., "Navigating the Jagged Technological Frontier" (HBS WP 24-013) — https://www.hbs.edu/ris/Publication%20Files/24-013_d9b45b68-9e74-42d6-a1c6-c72fb70c7282.pdf
- Peng et al., GitHub Copilot RCT (arXiv:2302.06590) — https://arxiv.org/pdf/2302.06590
- Google 96-engineer Copilot RCT (arXiv:2410.12944) — https://arxiv.org/pdf/2410.12944
- St. Louis Fed, "The Rapid Adoption of Generative AI" + follow-ups (2024-25) — https://www.stlouisfed.org/on-the-economy/2025/feb/impact-generative-ai-work-productivity
- Anthropic Economic Index (Jan 2026) — https://assets.anthropic.com/m/218c82b858610fac/original/Economic-Index.pdf
- StatCan, average hourly wage by province, Q3 2024 — https://www150.statcan.gc.ca/n1/daily-quotidien/241216/mc-a001-eng.htm (verified by fetch)
- StatCan, average usual hourly wage, Aug 2025 — https://www150.statcan.gc.ca/n1/daily-quotidien/250818/cg-d001-eng.htm
- StatCan Table 14-10-0064, employee wages by industry — https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410006401
- ISED Canadian Industry Statistics — Retail Trade salaries — https://ised-isde.canada.ca/app/ixb/cis/salaries-salaires/44-45
- ISED, Key Small Business Statistics 2024/2025 — https://ised-isde.canada.ca/site/sme-research-statistics/en/key-small-business-statistics/key-small-business-statistics-2024
- BDC AI adoption study (2024) — https://www.bdc.ca/en/about/mediaroom/news-releases/new-bdc-study-reveals-27-pourcent-of-canadian-entrepreneurs-don-t-know-they-re-using-artificial-intelligence-ai
- Microsoft News Canada, SMB AI adoption (June 2025) — https://news.microsoft.com/source/canada/2025/06/25/majority-of-canadian-small-and-medium-sized-businesses-embrace-ai-with-71-actively-using-tools-to-drive-efficiency-and-growth/
