---
version: 3
slug: "design-home-html"
primary_target: "design/home.html"
related_targets: ["app/(site)/page.tsx", "lib/home/journey.ts", "lib/home/proof.ts", "lib/space/engine.ts", "lib/space/cards.ts"]
---

# Homepage

Mode: Experience (in the service of Persuade: the visitor is inside the world, and the world makes the case)

## Job and audience
A small-business owner in Newfoundland and Labrador, on a phone. Busy and wary of tech. Most leave in 10 to 20 seconds and do not read. They must *see* what changes in their week.

The visitor has never seen AI do real work in their own tools. Words cannot carry that. The page lets them watch it happen, live, in their tools, so the gap closes in front of them ("wait, it can do that?") and not booking feels like leaving hours on the table. This is Solenix's purpose made visible: the gap between the technology that exists and the people who need it (PRODUCT.md).

## Outcome and proof
- Action: Book a call, the one ember action, in reach at every stop.
- The 3D world is the site (DESIGN.md, Decisions). Each claim is shown by objects, camera and motion in the world, never by a paragraph or a flat panel.
- Proof is the work itself: at each tool, the AI agent does a job live in front of the visitor, on example data labelled Example.
- No proof that does not exist: no testimonials, client numbers, client logos or invented speeds.

## Direction
One journey through the 3D space, top to bottom: fourteen stops, then the close (lib/home/journey.ts). The camera glides on one continuous path; the scroll stays native, up and down.
Each stop: one scene state, one focal object, one line of words of 10 words or fewer, the call in reach. At a tool stop the focal object is the AI agent at work beside that tool's world.

| # | Stop | The scene shows | Words | Lever |
|---|---|---|---|---|
| 1 | Chaos | Revenue, Costs, Time fling apart | Your business is a three-body problem. | Contrast: the before, vivid |
| 2 | Tools pull | The tool worlds tug the suns; 6.5 hours a week lost (Example) | Every tool pulls its own way. | Loss aversion: hours you lose |
| 3 | Talk to one | The AI lights at the centre; every world is joined to it | Stop learning ten tools. Talk to one. + Any AI agent, set up in the tools you use. | Hick's law: ten become one |
| 4–8 | QuickBooks, Gmail, Shopify, Meta Ads, Excel (TOOL_STOPS) | The camera arrives at the tool's world. The ask types out, the agent flies to each thing and changes it there (the overdue invoice turns red, the inbox sorts, the reorder is drafted, the wasted budget moves, the chart is added), then the answer appears. The other ask waits as a card to tap. | You don't need to be an expert in [tool]. | Vivid proof; you stay in control |
| 9–13 | The plan | The figure-eight forms; one stop lights per step | From one call to a stable orbit. + one line per step | Goal gradient |
| 14 | Promises | Down inside the orbit; the four promises | Four promises, on paper. Fixed price · You own it · Plain English · No lock-in | Regret aversion |
| Close | Stable orbit | The calm, centred orbit | Let's find your stable orbit. | Peak-end, the prompt at the peak |

## Scope and boundaries
- The whole homepage. The world stays: dark sky, three suns, the figure-eight, ember.
- Anti-goals: anything flat laid over the scene (a card, panel, caption or tag); a result that appears with no visible work; a camera move that snaps; a paragraph on screen; the journey ending on the footer.

## States and ranges
- Each line of words is at most 10 words. The full sentence of each stop is one list in the page (the story): visually hidden for sighted visitors, always there for screen readers and search, and shown as the page itself when script is off.
- Every sample number says Example, in the world.
- Reduced motion: each stop is a fixed camera station with every value on screen; each ask shows its answer at once.

## Interaction and layout
- At a tool stop the work plays on every arrival, once the camera is there; scrolling on skips it. Tapping another ask in the world plays it. The asks are also buttons for keyboards and screen readers.
- The tool's work stands as cards in the world beside it: to its left on a wide screen, under it on a phone.
- Phone first: 375 px is the floor; the first stop fills exactly the first screen.

## Constraints
- Approved phrases word for word (design/approved.md): stops 1, 3, 9 and the tool stops 4–8 carry them.
- No ROI calculator, Motion switch, prices, eyebrows or vendor names. Dark only. Ember is the only solid fill.
- Page-weight budgets hold (lib/page-weight.ts); 60 fps on a laptop, adaptive on phones.

## Open
- The booked-calls target (PRODUCT.md Goals).
