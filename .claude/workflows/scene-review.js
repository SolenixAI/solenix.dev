export const meta = {
  name: 'scene-review',
  description: 'Judge every homepage scene from screenshots at Jager\'s pane size, adversarially verify each failure, decide ship or brief',
  whenToUse: 'After every homepage design change and before showing it to Jager. Run `ONLY=pane npm run shots -- http://localhost:3000/ <dir>` first and pass {shotsDir: <dir>}.',
  phases: [
    { title: 'Judge', detail: 'one judge per scene reads its screenshots (motion on and off)' },
    { title: 'Verify', detail: 'a skeptic tries to refute each claimed failure' },
    { title: 'Decide', detail: 'ship to Jager or write the next Impeccable brief' },
  ],
}

// Run after `npm run shots -- http://localhost:3000/ <shotsDir>` (ONLY=pane is enough).
// args: { shotsDir: absolute path to that folder, repo?: absolute repo path }
const SHOTS = args.shotsDir
const REPO = args.repo || '.'
phase('Judge')
const SCENES = (await agent(`Read ${SHOTS}/index.json (a list of {file, viewport, motion, scene, id, step, of}). Group the entries with viewport "pane" by id, keeping the page order of first appearance. For each id return {id, label: a short description of the scene from its id and scene type, files: every file name for that id (motion and reduced)}. Return {scenes: [...]}.`, { label: 'list scenes', phase: 'Judge', schema: { type: 'object', properties: { scenes: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, label: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['id', 'label', 'files'] } } }, required: ['scenes'] } })).scenes
log(`${SCENES.length} scenes to judge`)

const BAR = `You are reviewing the solenix.dev homepage the way its founder, Jager, sees it: in an 872x837 browser pane. His standard is "unbelievable, not mediocre". His standing verdicts, which the page must satisfy:
- 3D throughout. Every scene happens inside the 3D universe. No flat panels or slabs over the world.
- Sight over text. An owner understands each scene without reading; text isn't believed.
- Show, never tell. Every example is a real-time side-by-side demonstration.
- The 1–5 plan must not fly past unread.
- Examples must show purpose, value and impact: the owner's real final output, and that AI does it faster, better and easier. Mediocre "AI slop" examples fail.
- Nothing static or dead. The races play under Reduce Motion too.
- The stable orbit is wide and calm, not cramped.
- Nothing overlaps or is cut off. Labels are legible.
Also read ${REPO}/design/research/site-playbook.md ("Decisions for the homepage" and "The six examples") and the "## Decisions" section of ${REPO}/DESIGN.md. Hold the scene to them.`

const JUDGED = {
  type: 'object',
  properties: {
    scene: { type: 'string' },
    scores: { type: 'object', properties: {
      world3d: { type: 'integer' }, clarity: { type: 'integer' }, wow: { type: 'integer' }, pull: { type: 'integer' }, readability: { type: 'integer' }, brevity: { type: 'integer' } },
      required: ['world3d', 'clarity', 'wow', 'pull', 'readability', 'brevity'] },
    failures: { type: 'array', items: { type: 'object', properties: {
      what: { type: 'string' }, evidence_file: { type: 'string' }, severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, fix_intent: { type: 'string' } },
      required: ['what', 'evidence_file', 'severity', 'fix_intent'] } },
    best_thing: { type: 'string' },
    biggest_lift: { type: 'string' },
  },
  required: ['scene', 'scores', 'failures', 'best_thing', 'biggest_lift'],
}

const REFUTED = {
  type: 'object',
  properties: { verdicts: { type: 'array', items: { type: 'object', properties: {
    what: { type: 'string' }, real: { type: 'boolean' }, reason: { type: 'string' } }, required: ['what', 'real', 'reason'] } } },
  required: ['verdicts'],
}

const reviewed = await pipeline(
  SCENES,
  (s) => agent(`${BAR}\n\nScene: "${s.id}" (${s.label}). Open EVERY one of these screenshots with the Read tool. "motion" means Reduce Motion is off and "reduced" means it is on; each is one screen-height step through the scene after about 2 seconds of play, and a file ending in "-done.png" is the scene after its race has played to the end: the payoff a visitor sees if they watch it through. Judge the payoff from the -done frames, not from mid-race frames:\n${s.files.map((f) => `${SHOTS}/${f}`).join('\n')}\n\nScore each dimension 0–100 against the bar (85 means good enough to show the founder; 95 means unbelievable). List every failure you can SEE, citing the exact screenshot file, its severity (blocker: the founder would reject the page for it; major: clearly mediocre; minor: polish), and the fix as intent rather than a feature list. Then name biggest_lift: the ONE change that would raise this scene's lowest score the most, concrete enough to act on (what the owner should see, not CSS). Be harsh but only claim what is visible.`, { label: `judge:${s.id}`, phase: 'Judge', schema: JUDGED }),
  (j, s) => {
    if (!j) return null
    const serious = j.failures.filter((f) => f.severity !== 'minor')
    if (!serious.length) return { ...j, confirmed: [], minor: j.failures }
    return agent(`You are a skeptic. A judge claims these failures in the "${s.id}" scene of a website. For each one, open the cited screenshot (Read tool) and try to REFUTE it. Is it actually visible, is it really a problem against the bar below, and is the severity right? Mark real=false if you can't see it or it's a misreading.\n\n${BAR}\n\nClaims:\n${JSON.stringify(serious, null, 1)}`, { label: `verify:${s.id}`, phase: 'Verify', schema: REFUTED })
      .then((v) => ({ ...j, confirmed: serious.filter((f) => v && v.verdicts.find((x) => x.what === f.what && x.real)), refuted: v ? v.verdicts.filter((x) => !x.real) : [], minor: j.failures.filter((f) => f.severity === 'minor') }))
  },
)

const ok = reviewed.filter(Boolean)
const avg = (k) => Math.round(ok.reduce((a, r) => a + r.scores[k], 0) / ok.length)
const page = { world3d: avg('world3d'), clarity: avg('clarity'), wow: avg('wow'), pull: avg('pull'), readability: avg('readability'), brevity: avg('brevity') }
const blockers = ok.flatMap((r) => r.confirmed.filter((f) => f.severity === 'blocker').map((f) => ({ scene: r.scene, ...f })))
const majors = ok.flatMap((r) => r.confirmed.filter((f) => f.severity === 'major').map((f) => ({ scene: r.scene, ...f })))
log(`page: ${JSON.stringify(page)}; confirmed blockers ${blockers.length}, majors ${majors.length}`)

phase('Decide')
const decision = await agent(`You decide whether the solenix.dev homepage is ready to show its founder, from a verified scene review.\n\nRule: ready only if there are 0 confirmed blockers, at most 2 confirmed majors, and every page dimension averages 85 or more. Otherwise write the next Impeccable brief.\n\nThe brief style is strict. Impeccable works best with a short verdict plus intent: under 180 words, no feature lists, and no CSS or code. Group the confirmed failures by the underlying cause (e.g. "the races are still panels"), not one line per failure. Lead with the founder's standard and end with "Before you finish, check every scene at 872×837 with motion on and off."\n\nPage averages: ${JSON.stringify(page)}\nConfirmed blockers: ${JSON.stringify(blockers)}\nConfirmed majors: ${JSON.stringify(majors)}\nBest things per scene (keep these): ${JSON.stringify(ok.map((r) => ({ scene: r.scene, best: r.best_thing })))}\nBiggest lift per scene (build the brief from these, grouped by cause, when failures are few): ${JSON.stringify(ok.map((r) => ({ scene: r.scene, lowest: Object.entries(r.scores).sort((a, b) => a[1] - b[1])[0], lift: r.biggest_lift })))}\n\nReturn JSON: {ready: boolean, reason: string, brief: string (empty if ready)}.`, { label: 'decide', phase: 'Decide', schema: { type: 'object', properties: { ready: { type: 'boolean' }, reason: { type: 'string' }, brief: { type: 'string' } }, required: ['ready', 'reason', 'brief'] } })

return { page, decision, scenes: ok.map((r) => ({ scene: r.scene, scores: r.scores, confirmed: r.confirmed, refuted: (r.refuted || []).length, minor: r.minor.length, best: r.best_thing, lift: r.biggest_lift })) }
