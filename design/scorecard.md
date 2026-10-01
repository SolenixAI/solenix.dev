# Homepage scorecard

Each section of `design/home.html` is scored 0–100 after every design change, against the same rubric, so changes are measured, not guessed. Once the site is live, PostHog numbers (scroll depth per section, calculator starts vs finishes, Book a call clicks per section) replace judgement where they exist.

## Rubric

| Dimension | Weight | 100 means |
| --- | --- | --- |
| In the 3D world | 25% | The content happens inside the scene, not on a panel laid over it |
| Clarity | 20% | A non-technical owner gets it within 5 seconds |
| Wow | 20% | Breathtaking; something people would screenshot and share |
| Pull to Book a call | 20% | Directly moves the visitor toward booking |
| Readability and phone | 10% | Reads cleanly at 375px and on a large desktop |
| Brevity | 5% | Its length earns what it says |

Target: 85+ on every section.

## Scores

| Date | Section | 3D world | Clarity | Wow | Pull | Read | Brevity | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-30 | Hero | 92 | 82 | 85 | 90 | 80 | 85 | 87 |
| 2026-09-30 | Twelve logins become one | 48 | 72 | 50 | 70 | 78 | 70 | 62 |
| 2026-09-30 | You ask. It gets done. | 28 | 70 | 38 | 80 | 74 | 45 | 54 |
| 2026-09-30 | From one call to a stable orbit | 58 | 70 | 60 | 62 | 72 | 35 | 62 |
| 2026-09-30 | Four promises, on paper | 40 | 88 | 30 | 60 | 85 | 80 | 58 |
| 2026-09-30 | Your numbers, not ours | 18 | 58 | 30 | 78 | 70 | 20 | 46 |
| 2026-09-30 | Two numbers. Both in writing. | 50 | 90 | 40 | 70 | 88 | 85 | 66 |
| 2026-09-30 | Straight answers | 38 | 90 | 20 | 50 | 88 | 75 | 54 |
| 2026-09-30 | Let's find your stable orbit | 70 | 82 | 58 | 88 | 82 | 80 | 75 |
| 2026-09-30 | **Page** | 47 | 78 | 46 | 72 | 80 | 64 | **63** |

### After: the movie (2026-09-30, later the same day)

Five scenes, one camera voyage. The portal preview, the demo chat, the calculator, pricing and FAQ sections are gone, so their rows end above. Scored from renders at 375, 1440, 1920 and 2560 wide, not from live visitors.

| Date | Section | 3D world | Clarity | Wow | Pull | Read | Brevity | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-30 | 1 · Chaos (hero) | 92 | 84 | 85 | 90 | 82 | 85 | 87 |
| 2026-09-30 | 2 · The guide | 88 | 88 | 72 | 70 | 84 | 88 | 81 |
| 2026-09-30 | 3 · The flybys (six races) | 70 | 86 | 82 | 78 | 80 | 70 | 78 |
| 2026-09-30 | 4 · The plan (five stops) | 90 | 78 | 84 | 70 | 84 | 70 | 81 |
| 2026-09-30 | 4 · Four promises, on paper | 88 | 88 | 72 | 68 | 84 | 82 | 80 |
| 2026-09-30 | 5 · Stable orbit (close) | 88 | 84 | 78 | 90 | 80 | 82 | 84 |
| 2026-09-30 | **Page** | 86 | 85 | 79 | 78 | 82 | 80 | **82** |

Still under the 85 target: the flybys lose points on "in the 3D world" because the two race screens are glass panels beside each tool's world, and the middle scenes carry no Book a call.

### After: no panels, and the races play under reduced motion (2026-09-30)

Measured at 1440 wide, reduced motion off and on: the world shows through 91% of the screen in the guide and in every race (the rest is the nav bar), and both clocks run in both modes.

| Date | Section | 3D world | Clarity | Wow | Pull | Read | Brevity | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-30 | 2 · The guide | 92 | 88 | 78 | 70 | 84 | 88 | 83 |
| 2026-09-30 | 3 · The flybys (six races) | 86 | 86 | 86 | 78 | 76 | 70 | 83 |
| 2026-09-30 | **Page** | 89 | 85 | 81 | 78 | 81 | 80 | **83** |

Readability drops a little in the flybys: bare type over the grid is harder to read than type on a panel.

### After: sight over text (2026-10-01)

Follows `research/site-playbook.md`. Checked at 872 by 837 with reduced motion off and on. Scores are judgement from renders, not visitor data.

| Date | Section | 3D world | Clarity | Wow | Pull | Read | Brevity | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-01 | 1 · Chaos (hero, one screen) | 92 | 86 | 85 | 90 | 84 | 90 | 88 |
| 2026-10-01 | 2 and 3 · The guide and six races | 90 | 86 | 88 | 86 | 80 | 80 | 87 |
| 2026-10-01 | 4 · The plan (five full-screen stops) | 90 | 88 | 84 | 72 | 86 | 92 | 85 |
| 2026-10-01 | 4 · Four promises, on paper | 88 | 88 | 72 | 68 | 84 | 82 | 80 |
| 2026-10-01 | 5 · Stable orbit (close) | 90 | 88 | 84 | 90 | 84 | 90 | 88 |
| 2026-10-01 | **Page** | 90 | 87 | 83 | 81 | 84 | 87 | **86** |

Not yet done from the playbook: measured ask times (decision 6), a full text budget in `check.sh` (7), a real founder photo (9), a poster frame and vitals budget (10), PostHog events (11).

### Independent review: the "sight over text" pass (2026-10-01, 872×837, motion on and off)

Ten judges, one per scene, scored screenshots. A skeptic then tried to refute every failure they claimed (0 blockers and 0 majors survived), and the averages fall far short of the bar. The self-score above (86) didn't hold up.

| Section | 3D world | Clarity | Wow | Pull | Read | Brevity |
| --- | --- | --- | --- | --- | --- | --- |
| Hero | 74 | 42 | 66 | 52 | 58 | 78 |
| Races (6, average) | 43 | 34 | 42 | 28 | 42 | 37 |
| Plan (5 stops) | 62 | 28 | 55 | 30 | 60 | 82 |
| Promises | 62 | 35 | 55 | 40 | 62 | 78 |
| Close | 72 | 66 | 63 | 68 | 71 | 72 |
| **Page** | **53** | **37** | **49** | **36** | **50** | **53** |

Cause: the races are still flat interface over the world; scenes don't read in one look; nothing leads to Book a call.

### Independent review: races as bodies (2026-10-01)

| | 3D world | Clarity | Wow | Pull | Read | Brevity |
| --- | --- | --- | --- | --- | --- | --- |
| Previous review | 53 | 37 | 49 | 36 | 50 | 53 |
| **This review** | **66** | **38** | **49** | **36** | **57** | **78** |

Form improves with each pass. Clarity and pull don't move: a stranger still can't tell in one glance what Solenix does, and nothing makes them want it. That's the message, not the drawing.

### Calibrating the review (2026-10-01)

The same plain rubric (clarity, wow, pull, readability, brevity) was applied to world-class pages and to ours, with 3 independent judges per page at 872×837. Scores are means, ± spread.

| Page | Clarity | Wow | Pull | Read | Brevity |
| --- | --- | --- | --- | --- | --- |
| Apple AirPods Pro | 90 ±0 | 96 ±0 | 83 ±1 | 94 ±0 | 96 ±1 |
| Stripe | 62 ±6 | 82 ±4 | 69 ±7 | 63 ±6 | 64 ±4 |
| Linear | 47 ±4 | 87 ±2 | 55 ±2 | 79 ±4 | 82 ±7 |
| Solenix hero | 65 ±4 | 78 ±1 | 67 ±3 | 55 ±4 | 85 ±2 |
| Solenix Stripe race | 53 ±1 | 71 ±1 | 46 ±1 | 61 ±2 | 82 ±0 |

- The judges are repeatable (spread of 7 points or less), so moves of 1–3 points between reviews are noise.
- 85 is reachable: Apple's page clears it, so the bar is Apple-level, not impossible.
- The scene review, with Jager's bar, scores 15–20 points harder than this plain rubric.
- Next: the hero's readability (55), and the races' pull (46) and clarity (53).

### Independent review trend (Jager's bar, 872×837)

| Review | What changed | 3D world | Clarity | Wow | Pull | Read | Brevity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #1 | sight over text | 53 | 37 | 49 | 36 | 50 | 53 |
| #2 | races as bodies | 66 | 38 | 49 | 36 | 57 | 78 |
| #3 | hero says what we do | 63 | 39 | 48 | 38 | 58 | 76 |
| #4 | payoff in the world | 65 | 42 | 55 | 40 | 64 | 78 |
| #5 | same page, judges see finished races | 68 | 45 | 57 | 46 | 64 | 77 |
| #6 | races end on the owner's real output | 67 | 50 | 57 | 50 | 67 | 74 |

Next lever (verified): prove each race with the owner's own thing changing in the world (the invoice becomes paid, the shelf refills), with one such moment on screen 1 within 2 s.

| #7 | owner's thing changes in the world (GPU screenshots from here on) | 62 | 44 | 52 | 47 | 59 | 68 |

Review #7 changed two things at once: the design, and the screenshots, which are now GPU-rendered at real speed. Its absolute scores are not comparable with #1–#6. A blind paired A/B of #6 against #7, both on GPU screenshots with 2 judges per scene in opposite orders, settled it: **#7 wins 16–4 overall** (clarity 15–5, pull 15–3, wow 15–4). It regressed in two places: Excel lost its before→after ("was $11,930"), and the close lost the real tool logos wired into the orbit. From now on, re-baseline with `design-ab` whenever the measurement changes.

| #8 | restore pass (A/B winner, 7–1), GPU baseline | 63 | 46 | 53 | 48 | 64 | 77 |

Pace: about 2–5 points a pass, roughly 40 min each. The judges are a proxy; the real measure (owners booking calls) needs the site published with a booking link.

### Blind A/B log (design-ab, GPU screenshots, 2 judges per scene in opposite orders)

| Pass | Overall | Clarity | Pull | Notes |
| --- | --- | --- | --- | --- |
| #7 vs #6 | 16–4 | 15–5 | 15–3 | the absolute-score drop in #7 was the camera, not the design |
| restore vs #7 | 7–1 | 6–0 | 5–0 | Excel before→after and tool logos back |
| owner's things on stage | 16–4 | 16–3 | 15–4 | costs: brevity 1–12; Stripe "$0" read as nothing earned |
| polish | 6–6 | 5–7 | 5–6 | better: Stripe $920 Paid, Meta order, readability 11–0; worse: cuts removed outcome words |
| outcome words back | 4–0 | 4–0 | 4–0 | costs: readability and brevity (tiny mono labels) |

Rule learned: cut words, but never the outcome words.
