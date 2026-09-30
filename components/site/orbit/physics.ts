// A real three-body integrator. G = 1, three equal unit masses, in the plane.
//
// Two systems run side by side:
//  - chaos: a bound but unstable configuration. It never settles, the way a
//    business with twelve disconnected tools never settles. If a body is
//    flung out, it is quietly re-seeded, so the scene never goes empty.
//  - choreography: the Chenciner–Montgomery figure-eight (2000), one of the
//    rare periodic solutions — three bodies chasing each other round one
//    loop forever. That is the stable orbit.
// The page shows a blend of the two, driven by scroll: chaos → order.

export type Vec = [number, number]
export type Body = { p: Vec; v: Vec }
export type System = Body[]

const EPS2 = 0.0025 // softening, so close passes never blow up numerically

function accel(sys: System): Vec[] {
  const a: Vec[] = sys.map(() => [0, 0])
  for (let i = 0; i < sys.length; i++) {
    for (let j = i + 1; j < sys.length; j++) {
      const dx = sys[j].p[0] - sys[i].p[0]
      const dy = sys[j].p[1] - sys[i].p[1]
      const r2 = dx * dx + dy * dy + EPS2
      const inv = 1 / (r2 * Math.sqrt(r2))
      a[i][0] += dx * inv; a[i][1] += dy * inv
      a[j][0] -= dx * inv; a[j][1] -= dy * inv
    }
  }
  return a
}

/** Velocity Verlet: symplectic, so energy stays honest over long runs. */
export function step(sys: System, dt: number) {
  const a0 = accel(sys)
  for (let i = 0; i < sys.length; i++) {
    const b = sys[i]
    b.v[0] += 0.5 * dt * a0[i][0]; b.v[1] += 0.5 * dt * a0[i][1]
    b.p[0] += dt * b.v[0]; b.p[1] += dt * b.v[1]
  }
  const a1 = accel(sys)
  for (let i = 0; i < sys.length; i++) {
    sys[i].v[0] += 0.5 * dt * a1[i][0]; sys[i].v[1] += 0.5 * dt * a1[i][1]
  }
}

/** The figure-eight, to the published precision. */
export function figureEight(): System {
  const x1: Vec = [-0.97000436, 0.24308753]
  const v3: Vec = [-0.93240737, -0.86473146]
  return [
    { p: [x1[0], x1[1]], v: [-v3[0] / 2, -v3[1] / 2] },
    { p: [-x1[0], -x1[1]], v: [-v3[0] / 2, -v3[1] / 2] },
    { p: [0, 0], v: [v3[0], v3[1]] },
  ]
}

function energy(sys: System) {
  let k = 0, u = 0
  for (const b of sys) k += 0.5 * (b.v[0] ** 2 + b.v[1] ** 2)
  for (let i = 0; i < 3; i++)
    for (let j = i + 1; j < 3; j++)
      u -= 1 / Math.hypot(sys[i].p[0] - sys[j].p[0], sys[i].p[1] - sys[j].p[1])
  return k + u
}

/** A bound, chaotic start: random positions, zero total momentum, negative energy. */
export function chaos(rand: () => number = Math.random): System {
  for (;;) {
    const sys: System = [0, 1, 2].map((k) => {
      const ang = (k / 3) * Math.PI * 2 + (rand() - 0.5) * 1.4
      const r = 0.55 + rand() * 0.6
      return {
        p: [Math.cos(ang) * r, Math.sin(ang) * r] as Vec,
        v: [(rand() - 0.5) * 0.9, (rand() - 0.5) * 0.9] as Vec,
      }
    })
    // centre of mass at rest at the origin
    const cp: Vec = [0, 0], cv: Vec = [0, 0]
    for (const b of sys) { cp[0] += b.p[0] / 3; cp[1] += b.p[1] / 3; cv[0] += b.v[0] / 3; cv[1] += b.v[1] / 3 }
    for (const b of sys) { b.p[0] -= cp[0]; b.p[1] -= cp[1]; b.v[0] -= cv[0]; b.v[1] -= cv[1] }
    if (energy(sys) < -0.9) return sys
  }
}

/** True when a body has wandered too far to come back into frame. */
export function escaped(sys: System, radius = 3.2) {
  return sys.some((b) => Math.hypot(b.p[0], b.p[1]) > radius)
}

/** How settled the chaotic system looks right now, 0..1 — shown in the readout. */
export function spread(sys: System) {
  let m = 0
  for (const b of sys) m = Math.max(m, Math.hypot(b.p[0], b.p[1]))
  return m
}
