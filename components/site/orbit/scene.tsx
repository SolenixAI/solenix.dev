"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { chaos, escaped, figureEight, step, type System } from "./physics"

// The live three-body scene. Everything visual derives from design tokens
// (--sun1, --sun2, --ring, --bg) read from the page, so it follows tokens.css.

export type OrbitReadout = { t: number; order: number; reseeds: number }

type Props = {
  /** 0 = pure chaos, 1 = the figure-eight. Read every frame; a ref, not state. */
  order: React.RefObject<number>
  onReadout?: (r: OrbitReadout) => void
  still?: boolean
}

const TRAIL = 260
const DT = 0.004
const STEPS_PER_FRAME = 4

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback
  const el = document.querySelector("[data-orbit-tokens]") ?? document.documentElement
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback
}

function useTokens() {
  const [t, setT] = useState(() => ({
    sun1: token("--sun1", "#fbbf24"),
    sun2: token("--sun2", "#f97316"),
    ring: token("--ring", "#f59e0b"),
    chart2: token("--chart-2", "#2dd4bf"),
    chart3: token("--chart-3", "#818cf8"),
    bg: token("--bg", "#0b0d12"),
  }))
  useEffect(() => {
    const read = () =>
      setT({
        sun1: token("--sun1", "#fbbf24"),
        sun2: token("--sun2", "#f97316"),
        ring: token("--ring", "#f59e0b"),
        chart2: token("--chart-2", "#2dd4bf"),
        chart3: token("--chart-3", "#818cf8"),
        bg: token("--bg", "#0b0d12"),
      })
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => mo.disconnect()
  }, [])
  return t
}

/** A soft sun: hot white core, sun gradient, falling to nothing. Billboarded. */
const sunMaterial = (inner: THREE.Color, outer: THREE.Color) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uInner: { value: inner }, uOuter: { value: outer }, uPulse: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform vec3 uInner; uniform vec3 uOuter; uniform float uPulse;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float core = smoothstep(0.22, 0.0, d);
        float body = smoothstep(0.42, 0.12, d);
        float halo = pow(max(0.0, 1.0 - d), 3.0) * (0.55 + 0.1 * uPulse);
        vec3 col = mix(uOuter, uInner, body) * (body + halo) + vec3(1.0, 0.96, 0.88) * core * 1.4;
        float a = clamp(body + halo + core, 0.0, 1.0);
        gl_FragColor = vec4(col, a);
      }`,
  })

function Stars() {
  const geo = useMemo(() => {
    const n = 1400
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 8 + Math.random() * 18
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      p[i * 3] = r * Math.sin(ph) * Math.cos(th)
      p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
      p[i * 3 + 2] = -Math.abs(r * Math.cos(ph)) - 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  const ref = useRef<THREE.Points>(null)
  useFrame((_, d) => { if (ref.current) ref.current.rotation.z += d * 0.004 })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.035} sizeAttenuation color="#ffffff" transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

/** The brand's orbit rings, faint, slowly turning behind the bodies. */
function Rings({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, d) => { if (group.current) group.current.rotation.z -= d * 0.02 })
  return (
    <group ref={group}>
      {[1.9, 2.6, 3.4].map((r, i) => (
        <mesh key={r}>
          <ringGeometry args={[r - 0.004, r + 0.004, 256]} />
          <meshBasicMaterial color={color} transparent opacity={0.16 - i * 0.04} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function Bodies({ order, onReadout, still, tokens }: Props & { tokens: ReturnType<typeof useTokens> }) {
  const { viewport } = useThree()
  const sysC = useRef<System>(chaos())
  const sysF = useRef<System>(figureEight())
  const shown = useRef<[number, number][]>([[0, 0], [0, 0], [0, 0]])
  const smooth = useRef(0)
  const clock = useRef({ t: 0, reseeds: 0, lastReport: 0 })

  const colors = useMemo(
    () => [new THREE.Color(tokens.sun1), new THREE.Color(tokens.sun2), new THREE.Color(tokens.ring)],
    [tokens]
  )
  const trailPos = useMemo(() => [0, 1, 2].map(() => new Float32Array(TRAIL * 3)), [])
  const sunMats = useMemo(
    () => [
      sunMaterial(new THREE.Color(tokens.sun1), new THREE.Color(tokens.sun2)),
      sunMaterial(new THREE.Color(tokens.sun1), new THREE.Color(tokens.sun2)),
      sunMaterial(new THREE.Color(tokens.sun1), new THREE.Color(tokens.ring)),
    ],
    [tokens]
  )
  const sunRefs = useRef<(THREE.Mesh | null)[]>([])
  const agent = useRef<THREE.Mesh>(null)

  // Fit the orbit to the viewport: portrait phones zoom in less.
  const scale = Math.min(viewport.width / 5.2, viewport.height / 3.6)

  // Pre-roll so trails exist on the first frame (and the still frame).
  useEffect(() => {
    for (let k = 0; k < TRAIL; k++) {
      for (let s = 0; s < STEPS_PER_FRAME; s++) { step(sysC.current, DT); step(sysF.current, DT) }
      record()
    }
    place()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function record() {
    const o = smooth.current
    const e = o * o * (3 - 2 * o) // smoothstep
    for (let i = 0; i < 3; i++) {
      const c = sysC.current[i].p, f = sysF.current[i].p
      const x = (c[0] + (f[0] - c[0]) * e) * scale
      const y = (c[1] + (f[1] - c[1]) * e) * scale
      shown.current[i] = [x, y]
      const tp = trailPos[i]
      tp.copyWithin(0, 3)
      tp[(TRAIL - 1) * 3] = x; tp[(TRAIL - 1) * 3 + 1] = y; tp[(TRAIL - 1) * 3 + 2] = 0
    }
  }

  function place() {
    for (let i = 0; i < 3; i++) sunRefs.current[i]?.position.set(shown.current[i][0], shown.current[i][1], 0.01)
  }

  useFrame((state, delta) => {
    if (still) return
    const target = order.current ?? 0
    smooth.current += (target - smooth.current) * Math.min(1, delta * 2.2)
    for (let s = 0; s < STEPS_PER_FRAME; s++) {
      step(sysC.current, DT)
      step(sysF.current, DT)
    }
    if (escaped(sysC.current)) { sysC.current = chaos(); clock.current.reseeds++ }
    clock.current.t += DT * STEPS_PER_FRAME
    record()
    place()
    trailPos.forEach((_, i) => {
      const line = state.scene.getObjectByName(`trail-${i}`)
      if (line) ((line as THREE.Line).geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
    })
    const pulse = Math.sin(state.clock.elapsedTime * 1.6)
    sunMats.forEach((m) => (m.uniforms.uPulse.value = pulse))

    // The agent dot from the mark: one small point circling the third body.
    if (agent.current) {
      const [x, y] = shown.current[2]
      const a = state.clock.elapsedTime * 2.4
      agent.current.position.set(x + Math.cos(a) * 0.32 * scale, y + Math.sin(a) * 0.32 * scale, 0.02)
    }

    if (onReadout && state.clock.elapsedTime - clock.current.lastReport > 0.1) {
      clock.current.lastReport = state.clock.elapsedTime
      onReadout({ t: clock.current.t, order: smooth.current, reseeds: clock.current.reseeds })
    }
  })

  const sunSize = 0.62 * scale
  return (
    <>
      <group>
        {trailPos.map((pos, i) => (
          <TrailLine key={i} name={`trail-${i}`} positions={pos} color={colors[i]} />
        ))}
      </group>
      {sunMats.map((m, i) => (
        <mesh key={i} ref={(el) => { sunRefs.current[i] = el }} material={m}>
          <planeGeometry args={[sunSize, sunSize]} />
        </mesh>
      ))}
      <mesh ref={agent}>
        <circleGeometry args={[0.03 * scale, 24]} />
        <meshBasicMaterial color={tokens.ring} toneMapped={false} />
      </mesh>
    </>
  )
}

function TrailLine({ name, positions, color }: { name: string; positions: Float32Array; color: THREE.Color }) {
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const col = new Float32Array(TRAIL * 3)
    for (let k = 0; k < TRAIL; k++) {
      const f = Math.pow(k / (TRAIL - 1), 1.8)
      col[k * 3] = color.r * f; col[k * 3 + 1] = color.g * f; col[k * 3 + 2] = color.b * f
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3))
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    const l = new THREE.Line(geo, mat)
    l.name = name
    l.frustumCulled = false
    return l
  }, [positions, color, name])
  return <primitive object={line} />
}

export function OrbitScene({ order, onReadout, still }: Props) {
  const tokens = useTokens()
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, -0.9, 6], fov: 42 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      frameloop={still ? "demand" : "always"}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <color attach="background" args={[tokens.bg]} />
      <Stars />
      <Rings color={tokens.ring} />
      <Bodies order={order} onReadout={onReadout} still={still} tokens={tokens} />
      <EffectComposer>
        <Bloom intensity={1.15} luminanceThreshold={0.08} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  )
}

