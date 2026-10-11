---
version: 2
slug: "design-home-html"
primary_target: "design/home.html"
related_targets: ["app/(site)/page.tsx", "lib/home/journey.ts", "lib/space/engine.ts"]
---

# Homepage

Mode: Experience (in the service of Persuade: the visitor is inside the world, and the world makes the case)

## Job and audience
A small-business owner in Newfoundland and Labrador, on a phone. Busy and wary of tech. Most leave in 10 to 20 seconds and do not read. They must *see* what changes in their week.

Most have never seen AI do real work: if they tried it at all, it was an early chatbot, and they cannot picture what asking it for something in their own tools looks like. Words cannot carry that. The page has to let them watch it happen, in their tools, at once, so the gap closes in front of them ("wait, it can do that?") and not booking feels like leaving hours on the table. This is Solenix's purpose made visible: the gap between the technology that exists and the people who need it (PRODUCT.md).

## Outcome and proof
- Action: Book a call, the one ember action, in reach at every stop.
- The scene is the argument. Each claim is shown by objects, camera and motion, never by a paragraph.
- Proof is the work itself, as objects in the world: each tool's finished result built in 3D (example data, labelled), the three-body chaos as the problem, the orbit forming as the plan, a fixed price in writing.
- No proof that does not exist: no testimonials, client numbers or logos of clients.

## Direction
One journey through the 3D space, top to bottom: fourteen stops, then the close (lib/home/journey.ts). Each stop holds still through its own stretch of scroll; the world moves between stops, and the scroll stays the visitor's own.
Each stop: one scene state, one focal object, one caption of 10 words or fewer a line, the call in reach. On a tool stop the focal object is the tool's things beside its world; the caption is the heading, the asks and the answer.

| # | Stop | The scene shows | Caption | Lever |
|---|---|---|---|---|
| 1 | Chaos | Revenue, Costs, Time fling apart | Your business is a three-body problem. | Contrast: the before, vivid |
| 2 | Tools pull | Six tool planets tug the suns; an hours meter climbs (Example) | Every tool pulls its own way. | Loss aversion: hours you lose |
| 3 | Talk to one | The AI lights at the centre; six arcs snap into it; the meter falls | Stop learning ten tools. Talk to one. | Hick's law: ten become one |
| 4–8 | QuickBooks, Gmail, Shopify, Meta Ads, Excel (lib/home/journey.ts TOOL_STOPS): the books, the inbox, stock, ads, the numbers | The camera flies to the tool's world; its things stand beside it; the visitor taps a plain-words ask and the answer shows at once: the overdue invoice glows, the drafted one appears; the inbox sorts; the reorder is drafted; the wasted ad budget moves; the chart is added | You don't need to be an expert in [tool]. + two asks and the answer | Vivid proof, you stay in control |
| 9–13 | The plan | The figure-eight forms; one stop lights per step | From one call to a stable orbit. + one line per step | Goal gradient |
| 14 | Promises | Four rings lock round the orbit | Fixed price · You own it · Plain English · No lock-in | Regret aversion |
| Close | Stable orbit | The calm, centred orbit; the footer shares this screen | Let's find your stable orbit. | Peak-end, the prompt at the peak |


## Scope and boundaries
- The whole homepage. The world stays: dark sky, three suns, the figure-eight, ember.
- Anti-goals: a text panel over the scene, a paragraph on screen, a section that is only words, a fade across the screen, the scene "in the background".

## States and ranges
- Captions at most 10 words a line; the full sentence of each stop is in the page, visually hidden, for screen readers and search.
- Example tags on every sample number; unknown numbers get a dashed "to confirm" chip.
- Reduced motion: each stop is a fixed camera station with every value on screen; the scene still follows the stops.

## Interaction and layout
- The scroll is native, up and down; each stop holds through its stretch. A stop indicator on the right shows where you are and how many are left.
- Captions sit beside their object in the scene (projected tags), never over a body.
- Phone first: 375 px is the floor; the first stop fills exactly the first screen.

## Constraints
- Approved phrases word for word (design/approved.md): stops 1, 3, 7, 9 and the tool stops ("You don't need to be an expert in …") carry them.
- No simulated typing, race clocks or forced waits: a result shows the moment its stop is reached.
- No ROI calculator, Motion switch, prices or eyebrows. Dark only. Ember is the only solid fill.
- Page-weight budgets hold (lib/page-weight.ts); 60 fps on a laptop, adaptive on phones.

## Open
- The booked-calls target (PRODUCT.md Goals).
