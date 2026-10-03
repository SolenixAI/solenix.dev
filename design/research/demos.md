# Demo research: what makes a before/after demo believable

Method: live pages opened in a browser on 2026-09-30 (DOM counts, screenshots). `<.>` marks anything not verified. Effort sizes are my estimates `<.>`.

Starting point: `design/home.html` already runs two stopwatches per race (Shopify race, lines 740–770). What it lacks is the tool's real screens, and the tool's world as a place.

## 1. Ten demos worth studying

1. **TypeSafe Jev race.** [Page](https://typesafe.ai/blog/introducing-system-one-models-and-jev). A recorded Vimeo clip of a real run: two terminal panes, "Same 27 questions. Same order.", started together. The gap shows without a number. A "Nuance" list admits the query was simplified and one answer differed.
2. **Raycast.** [Page](https://www.raycast.com). The product window rebuilt in live DOM text, not video. Its AI chat prints named steps ("Fetching assigned tasks", "Create Things task") against Linear and Things.
3. **Stripe.** [Page](https://stripe.com/en-ca). A "Global GDP running on Stripe" figure to eight decimals, projected from a growth rate. The source states the method, the IMF source and "last updated 2026-02-20". Live ticking not observed `<.>`.
4. **Shopify Editions Spring '26.** [Page](https://www.shopify.com/editions/spring2026). One WebGL canvas hero, then 13 muted, non-looping, lazy-loaded video clips of the admin. One shows "Your spring sales were strong. Let's focus on repeat buyers."
5. **Apple AirPods Pro 3.** [Page](https://www.apple.com/airpods-pro/). At least 12 named scroll groups ("Noise Control", "Battery"), 16 videos, pause controls. One claim per scene.
6. **Oryzo (Lusion).** [Page](https://oryzo.ai/), Site of the Day ([post](https://x.com/awwwards/status/2043600792184099160)). A WebGL object that is the product; the camera moves through depth, not layers ([source](https://www.utsubo.com/blog/best-threejs-websites-2026)). It ends: "We caught your attention with a non-existent product."
7. **Linear.** [Page](https://linear.app/ai). Mockups with dull real titles ("ENG-2288 Dashboard takes seconds to load"). A script adds an "enhanced" class only when `navigator.hardwareConcurrency > 4`; what it gates not checked `<.>`.
8. **Superhuman.** [Page](https://superhuman.com). The hero video plays once, not looped: the agent working inside a document.
9. **Claude in Chrome and Claude for Microsoft 365.** [Chrome](https://claude.com/claude-in-chrome), [M365](https://claude.com/claude-for-microsoft-365). Lottie scenes behind a play button. M365 states "Nothing goes out or gets saved until you say so."
10. **Cursor.** [Page](https://cursor.com). A still image of the real product, with job names, durations ("10m", "45m") and a diff. Specifics, no motion.

Not visited `<.>`: Cartier Watches & Wonders, six 3D rooms entered on scroll ([source](https://www.utsubo.com/blog/best-threejs-websites-2026)).

Counter-examples: Google admitted the Gemini hands-on video was staged ([Futurism](https://futurism.com/google-gemini-ai-demo)). Rabbit r1's "Large Action Model" claims drew controversy ([Wikipedia](https://en.wikipedia.org/wiki/Rabbit_r1)). Humane's Pin was slow and wrong in review ([Dexerto](https://www.dexerto.com/tech/marques-brownlee-slams-humane-ai-pin-as-the-worst-product-hes-ever-reviewed-2646829/)).

## 2. Seven principles

1. **Both paths run at once, in real time.** Test: mute the page; a stranger still names the slower lane. (TypeSafe.)
2. **Show effort in named steps, even when the AI is fast.** Visible effort raises perceived value ([Buell & Norton](https://pubsonline.informs.org/doi/10.1287/mnsc.1110.1376)). Test: each AI step carries a real connector tool name.
3. **Use the tool's own screens and words.** Test: a Shopify owner recognises the menu names in two seconds. No invented labels. (Raycast, Linear, Shopify Editions.)
4. **Dull specifics beat polish.** Test: every number looks like data ("212 sold · 14 left", "+135 −21"), not a round figure.
5. **Show the approval gate and the limit.** Test: every write shows an Approve click; every race has one "cannot yet" line. Gmail asks approval by default ([usecarly](https://www.usecarly.com/blog/claude-gmail-integration/)); Anthropic's computer-use launch said "experimental—at times cumbersome and error-prone" ([Anthropic](https://www.anthropic.com/news/3-5-models-and-computer-use)).
6. **Label example data and how it was made.** Test: every number comes from `before-after.md` or says "Example". A misleading mock-up is deception ([FTC v. Colgate-Palmolive](https://www.courtlistener.com/opinion/107013/ftc-v-colgate-palmolive-co/)).
7. **One job per scene, at the viewer's pace.** Test: scrolling back replays it. Autoplay past five seconds needs a pause control ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)).

## 3. The six, inside the universe

Common build: each tool's real screen is a DOM plane standing in its world, and the camera docks to it. By hand plays on one plane (cursor, clicks, a stopwatch hanging in space); the ask plays on the other; the result lifts out of the screen as 3D marks. Times come from `before-after.md`. Build QuickBooks first (highest-confidence write, money in hand); HubSpot last.

- **Shopify: 10–22 minutes back per check.** A stockroom where Analytics and Inventory stand far apart. By hand, the camera crosses between them under the clock. Asked, both fuse into one shelf row and the two products that run out in 30 days turn amber. Read-only tools ([connector](https://claude.com/marketplace/connectors/shopify)). Weekly, that is about $280–$620 a year at $32.35 an hour ([StatCan](https://www150.statcan.gc.ca/n1/daily-quotidien/241216/mc-a001-eng.htm)); estimate.
- **Meta Ads: 10–17 minutes back, and the losing ad set stops spending.** Ad sets are suns; spend is light. Asked, two date windows become paired orbits and the weakest dims. Pausing is a write, so show the Approve click. Sources conflict on approval ([usecarly](https://www.usecarly.com/blog/meta-ads-mcp/): none) `<.>`; confirm in Meta's docs first.
- **QuickBooks: 10–17 minutes back, and the invoice goes out today.** Overdue invoices are planets with a 60-day ring. One sentence flags them, drafts and sends the retainer invoice. Actions stay "reviewable and human-verified" ([Intuit](https://quickbooks.intuit.com/r/news/quickbooks-expands-into-claude-and-chatgpt-with-new-features/)); payment links need QuickBooks Payments.
- **Gmail and Calendar: 15–35 minutes back, one invite instead of 7.3 emails** ([Calendly](https://calendly.com/blog/find-a-meeting-time), method unpublished `<.>`). Envelopes drift toward the camera. By hand, one is opened at a time; asked, they sort into three bays. Drafts wait for approval; no triggers on new mail ([usecarly](https://www.usecarly.com/blog/claude-gmail-integration/)).
- **Excel: 10–25 minutes back, in the real file.** The workbook is terrain. Asked, a pivot and chart grow in place with highlighted cells ([Microsoft 365 page](https://claude.com/claude-for-microsoft-365)). Show the limit: Google Sheets cannot be edited in place ([usecarly](https://www.usecarly.com/blog/claude-google-sheets-integration/)).
- **HubSpot: the smallest time gap (2–18 minutes), so lead with deals rescued.** A corridor of deals; those quiet for 14 days stand dark and light up with a draft each. The connector logs notes, creates tasks and updates stages ([HubSpot](https://www.hubspot.com/claude)); sending email from it `<.>`. The time gap rests on a proxy study; say so.

## 4. Costs and landmines

- **DOM planes (CSS3DRenderer):** crisp text, but no depth sorting against WebGL and 100% zoom only ([docs](https://threejs.org/docs/pages/CSS3DRenderer.html)). Keep one live plane in view. Six screen replicas is the real work: large `<.>`.
- **Recorded clips:** cheapest on phones, but not "real time on your screen". Label them "Recorded". Shopify's file names say 1.6 Mbps, about 12 MB a minute. Effort: medium `<.>`.
- **HTML-in-Canvas** is an origin trial through Chrome 160 ([Chrome](https://developer.chrome.com/blog/html-in-canvas-ot-changes)). Not for iPhones `<.>`.
- **Phones:** gate by device as Linear does, and by [detect-gpu](https://github.com/pmndrs/detect-gpu) tier (15, 30, 60 fps); low tiers keep the 2D lanes. Cap pixel ratio at 2 `<.>`.
- **Reduce Motion:** replace, don't remove ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)). Each race needs a still final frame: both clocks stopped, result on screen, moved by scroll.
- **Honesty:** the by-hand clock runs on estimates; say "typical, estimated". Suns and planets are metaphors; they never replace the real screen. No Google Business Profile race: no first-party connector.
