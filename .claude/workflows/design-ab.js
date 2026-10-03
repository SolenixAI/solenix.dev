export const meta = {
  name: 'design-ab',
  description: 'Blind paired A/B of two homepage versions, scene by scene, from GPU screenshots at the pane size',
  whenToUse: 'When two design versions differ and absolute review scores are ambiguous (e.g. the measurement also changed). Capture both with npm run shots into two folders; pass {oldDir, newDir, scenes: [{id, files}]}.',
  phases: [{ title: 'Compare', detail: '2 judges per scene, opposite orders' }],
}
const OLD = args.oldDir, NEW = args.newDir
const SCENES = args.scenes
const DIMS = ['world3d', 'clarity', 'wow', 'pull', 'readability', 'brevity']
const BAR = `Judge as the founder of solenix.dev would, viewing at 872x837: every scene happens inside the 3D world, sight over text, the owner understands what they get at a glance and wants to book a call. Files ending -done.png show the scene after its race has played to the end. "motion" means Reduce Motion off; "reduced" means on.`
const SCHEMA = { type: 'object', properties: Object.fromEntries(DIMS.map((d) => [d, { type: 'string', enum: ['A', 'B', 'tie'] }]).concat([['overall', { type: 'string', enum: ['A', 'B', 'tie'] }], ['why', { type: 'string' }]])), required: [...DIMS, 'overall', 'why'] }
const jobs = SCENES.flatMap((s) => [0, 1].map((n) => ({ s, n })))
const res = await parallel(jobs.map(({ s, n }) => () => {
  const A = n === 0 ? OLD : NEW, B = n === 0 ? NEW : OLD
  return agent(`${BAR}\n\nTwo versions of the same scene, "${s.id}". Open every screenshot with the Read tool.\nVersion A:\n${s.files.map((f) => `${A}/${f}`).join('\n')}\nVersion B:\n${s.files.map((f) => `${B}/${f}`).join('\n')}\n\nFor each dimension (${DIMS.join(', ')}) and overall, say which version is better: A, B or tie. Use tie only if you truly can't tell. Then explain the deciding difference in one sentence.`, { label: `${s.id}#${n + 1}`, phase: 'Compare', schema: SCHEMA })
    .then((r) => r && Object.fromEntries(Object.entries(r).map(([k, v]) => [k, k === 'why' ? v : v === 'tie' ? 'tie' : ((v === 'A') === (n === 0) ? 'old' : 'new')])).valueOf())
    .then((r) => r && { scene: s.id, ...r })
}))
const ok = res.filter(Boolean)
const tally = Object.fromEntries([...DIMS, 'overall'].map((d) => [d, { new: ok.filter((r) => r[d] === 'new').length, old: ok.filter((r) => r[d] === 'old').length, tie: ok.filter((r) => r[d] === 'tie').length }]))
return { tally, perScene: ok.map((r) => ({ scene: r.scene, overall: r.overall, why: r.why })) }
