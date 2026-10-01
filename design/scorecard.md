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
