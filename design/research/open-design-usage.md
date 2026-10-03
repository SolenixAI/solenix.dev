# How to use Open Design on this project (verified against v0.24.1 source, 2026-10-01)

# Open Design playbook: solenix.dev (v0.24.1)

Key: S = server-WTGXM3LB.mjs, M = chunk-W53DZYT2.mjs, C = cli-MPHJVOEF.mjs (daemon chunks). P = project id 532c4b72-76c6-421c-8cf5-927c926f2241. URL = the daemon address.

## Set up once
1. Find URL with `lsof -iTCP -sTCP:LISTEN -P -n | grep Open`. Add `--daemon-url <URL>` to every `od` command. The default port 7456 is wrong on this Mac. (chunk-Y7B7YET2.mjs:12)
2. Make the design system current. In the Solenix design system view, press "Edit DESIGN.md", paste the text of design/DESIGN.md, then press "Save DESIGN.md". Runs read the copy in project brand-solenix-design-system-v3-90fc00, not the repo file. (S:256266-256268)
3. Put Jager's standing rules in the "Project instructions" field (5,000 characters maximum). Open Design sends them on every run. (S:104816; S:209322)
4. Clean the memory. In Settings > Memory, delete the stale notes (Motion switch, text on a panel, mailto booking, v2 rebuild, 85 scorecard). Then run `od memory config --extraction false`. Memory is global and has no project filter. (chunk-5Q3RRGK4.mjs:638-647; S:230526)
5. Make a clean conversation with `od conversation new P` and keep its id. The MCP tool start_run always uses the oldest conversation. (S:227004; C:9835)
6. Set the entry file to home.html (see project_fixes; not tested). (S:162976)

## For each change
1. Jager names one change. Nothing else goes in the request. (S:103393-103395)
2. Save the current page with `od files version-create P home.html`. Direct file edits make no version. (C:9320-9326)
3. Pick skills by kind of change:
   - 3D scene: no skill. `threejs` and `shader-dev` are empty stubs. (skills/threejs/SKILL.md:32)
   - Motion: `emilkowalski-motion`. Do not use the GSAP skills; the page has no GSAP.
   - Copy: no skill. `copywriting` is a stub.
   - Polish: `impeccable-design-polish`. For review only: `review-animations`.
4. Start the run with the refine plugin in the clean conversation:
   `od run start --project P --conversation <id> --plugin od-design-refine --inputs '{"refineGoal":"<the one change>"}' --skill <ids> --message "<the one change>"` (C:8886; od-design-refine/SKILL.md:3)
   - Name the plugin and inputs every time. A run with no plugin reuses the last goal. (chunk-B75TKSRJ.mjs:5412)
   - The plugin's own skill replaces the first `--skill` id. Put the id you need second. (S:256184; C:9171)
5. For a change to one text element, Jager can use the app instead: "Comment" button, click the element, type, "Send to chat". This adds a "Hard scope" rule to the prompt. MCP and the CLI cannot send comments. (S:106769; M:17109-17160)
6. Wait. Runs take 5 to 30 minutes. Check with `od run watch <runId>` or get_run every 30 to 60 seconds. Keep the app open. (M:17940-17948)

## Check the result
1. The run status is "succeeded" and artifactPaths lists home.html. Ignore the "produced no files" hint until the entry file is set. (M:18491)
2. A new "AI edit" version exists: `od files versions P home.html`. (S:259986)
3. The diff touches only the named thing: `od files version-read P home.html <oldId> | od files diff P home.html --against -`. (C:9318)
4. `od lint design/home.html` shows 0 P0. The one P1 (all-caps-no-tracking) is a false alarm. (S:182726)
5. Jager opens `URL/api/projects/P/raw/home.html` in a browser and judges. No Open Design gate checks 3D or motion, and critique is off. (S:152954; S:210403)

## If it is worse
With no run live, use Version history > "Switch to this version", or `od files version-restore P home.html <versionId>`. (S:210640)

## Never
- Cancel a slow run and write the file yourself. (M:17942)
- Start a second run while one is in flight. (M:17930)
- Restore or edit home.html during a run. The run claims every change. (S:162607)
- Run with no plugin. Open Design then applies "Web Prototype", which builds a new page. (chunk-EYXZOLZZ.mjs:12094)
- Add `full-page-screenshot`. It turns the run into an image run. (S:104336)
- Press Refresh, Download or upload in the design system kit view. They overwrite DESIGN.md. (S:146457)
- Edit `.od-skills/`. (S:104560)
- Quit Open Design during a run. (S:161688)

## What was done wrong before

- Called start_run with no plugin parameter. Correct: Pass plugin "od-design-refine" with inputs {refineGoal}. Without it the daemon applies the Web Prototype plugin and skill ('build a new page from the seed') to a refine request. (runs/7778e2f4/state.json pluginStagePrompt "The user applied plugin **Web Prototype**" and skillPrompt "Produce a single, self-contained HTML prototype using the bundled seed"; chunk-W53DZYT2.mjs:17128)
- Passed no skills, or (30 Sep) skill=creative-director plus the stubs threejs and shader-dev. Correct: Put real skills in `skills` (emilkowalski-motion, impeccable-design-polish). A primary `skill` is replaced by the plugin's skill, and the stubs carry no guidance. (server-WTGXM3LB.mjs:256184; runs/abb3d628/state.json headings "## Active skill — Web Prototype", no creative-director text; skills/AGENTS.md:38-39 "lightweight stub")
- Did not call list_plugins, list_skills or list_agents, and guessed agent "claude". Correct: Call list_plugins, list_skills and list_agents first. Root cause: Claude Code keeps only the first 2,048 characters of Open Design's MCP instructions, so the run guidance never arrived (upstream issue #7098, open). (chunk-W53DZYT2.mjs:17916 and :17921-17923 "do not guess"; https://github.com/nexu-io/open-design/issues/7098)
- Typed long feature-list briefs into the composer through browser automation. Correct: One named change per request. For one element, use Comment mode, which adds the 'Hard scope' block. For a run, use start_run or `od run start`. (server-WTGXM3LB.mjs:103393-103395 "Leave unnamed sections and values unchanged."; :106769-106770 "Hard scope: change ONLY the elements identified below")
- Never used Comment mode, so no run ever had a hard scope. Correct: File viewer "Comment" button, click the element, type, "Send to chat". MCP and the CLI cannot carry comments. (app.sqlite: select count(*) from preview_comments -> 0; chunk-W53DZYT2.mjs:17109-17160 "additionalProperties: false")
- Stacked a dozen runs before the owner judged each one. Correct: One named change per run; Jager judges each before the next. Do not start a run while one is in flight. (design/DESIGN.md Decisions "one named change per run, and he judges each before the next"; chunk-W53DZYT2.mjs:17930-17931)
- Let every MCP run land in the oldest conversation and resume one Claude session of 640,000 to 940,000 tokens. Correct: `od conversation new <projectId>`, then `od run start --conversation <id>`. (server-WTGXM3LB.mjs:227004; runs/35f7f03b/events.jsonl:36 "cache_creation_input_tokens":642505; cli-MPHJVOEF.mjs:8886)
- Judged results with its own screenshot scripts. The inner agent did the same: its own Playwright scripts, a local server on port 8766, and 9 to 18 screenshots per run. Correct: Use the native gates: version list and diff, `od lint`, and the raw URL in a real browser for Jager. The charter forbids the inner agent its own browser. (server-WTGXM3LB.mjs:103385 "Do not launch your own browser, use Playwright, or use a headless browser"; runs/35f7f03b/events.jsonl id 604)
- Versions were restored in the app while run 35f7f03b was live (four restores, 11:18 to 11:19). Correct: Restore only when no run is live. Restore has no run guard, and the run claims the final file state as its own 'AI edit'. (manifest.json "Version 33 · restored from v10" createdAt 1790862490941; server-WTGXM3LB.mjs:210640-210679; :162607)
- Never used native version restore; the owner restored by hand. Correct: `od files versions`, then `od files version-restore <projectId> home.html <versionId>`, or Version history > "Switch to this version". (cli-MPHJVOEF.mjs:9320-9326; web chunk 0kh1p7knifsp1.js "fileViewer.versions.restore":"Switch to this version")
- Run 7778e2f4 died when the app quit after 19 minutes (cancelOrigin daemon_shutdown) and left no version. Correct: Keep Open Design open for the whole run (5 to 30 minutes). Only a succeeded run saves a version. (runs/7778e2f4/state.json "cancelOrigin": "daemon_shutdown", exitCode 143; server-WTGXM3LB.mjs:259986 'if (status === "succeeded")')
- Edited design/DESIGN.md in the repo and assumed runs would read it. Correct: Runs read the design system's own Open Design project. Change it with "Edit DESIGN.md" then "Save DESIGN.md" in the design system view. (server-WTGXM3LB.mjs:256266-256268; brand-project DESIGN.md:79 "Any motion over 5s gets a Motion switch")
- Left 'Learn from chats' on, so the app turned the agent's own prompt wording into 'feedback from Jager' and injected it into every later run. Correct: `od memory config --extraction false`, and delete the stale notes. (data/memory/feedback_each_section_is_its_own_3d_scene_and_camera.md:5 "source: llm"; chunk-5Q3RRGK4.mjs:305-310 "it minted junk facts")
- Could trust get_run's hint 'Run finished but produced no files' for a run that did edit home.html. Correct: Read artifactPaths and the version list. Set the entry file to home.html so the hint and previewUrl are right. (MCP get_run 35f7f03b: "artifactPaths": ["home.html"], "deliverableValidation": "entry_missing"; chunk-W53DZYT2.mjs:18491)

## Still unproven

- od-design-refine has never run on this Mac. Its stage text mentions plan/steps.json and diff-review, which its pipeline lacks; how the agent reacts on a 1,792-line three.js page is unknown. Cheapest check: with Jager's consent, run one tiny named change, then read runs/<id>/state.json promptTelemetry and the version diff.
- The `--skill a,b` ordering advice (the first id is replaced by the plugin skill, later ids survive) is read from code, not run. Cheapest check: after the first refine run, look for '## Composed skill' headings in state.json skillPrompt.
- Whether a Comment-mode message sent from the app runs under od-design-refine. The UI sends only the project's pinned snapshot id, so it depends on the pin and would carry the old refineGoal. Cheapest check: after one named refine run, send one comment and read that run's appliedPluginSnapshotId and pluginStagePrompt.
- Comments plus a named plugin in one request are possible only by direct POST /api/runs (commentAttachments + pluginId + conversationId). Read from source, never sent. Cheapest check: one curl on a trivial change, with Jager's consent.
- Whether Comment, Draw or Box select can target the 3D scene on this page. The canvas has no data-od-id, and much scene text has pointer-events none or opacity 0. Cheapest check: Jager tries one Comment click and one Box select on the canvas in the app.
- Whether opening Comment mode keeps the scroll position on this scroll-driven page in 0.24.1 (issue #2143 is old and about a different symptom). Cheapest check: Jager scrolls to a middle section and presses Comment.
- Whether the PATCH that sets entryFile drops 'kind' from metadata. Cheapest check: send the full metadata object (kind + entryFile) and read the projects row before and after.
- The design system UI save ("Edit DESIGN.md" then "Save DESIGN.md") and `od files write` to the brand project were read in code, not seen on screen. Cheapest check: after saving, compare the brand-project DESIGN.md with design/DESIGN.md using cmp, and confirm designSystemDigest changes on the next run.
- Whether a real three.js skill can be installed (`od skill install` with a /tree/ folder URL of CloudAI-X/threejs-skills, for example threejs-fundamentals) and whether it suits editing an existing page. Cheapest check: read that upstream SKILL.md before installing anything.
- Whether three.js loads at the raw URL in a real browser (no CSP header blocks it, but it was not observed). Cheapest check: Jager opens the raw URL once.
- Why Open Design shut down at 16:33:06 UTC and killed run 7778e2f4. The logs record no cause. Cheapest check: ask Jager whether he or another process quit the app.
- Who deleted AGENTS.md, CLAUDE.md and the .claude hooks in the working tree at 14:25, and whether that is intended. Cheapest check: ask Jager; `git checkout` restores them if not.
- Whether `od export --format image` is usable for this page now (one 79-minute hang, cause unproven; output is a stitched strip, not a true render). Cheapest check: not needed if Jager judges at the raw URL.
- The Settings > Memory delete control and index editor were seen in code only. Cheapest check: Jager deletes one stale note and confirms its line is gone from MEMORY.md.
