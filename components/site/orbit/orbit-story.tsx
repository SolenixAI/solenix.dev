"use client"

import { ArrowRight } from "lucide-react"
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { OrbitReadout } from "./scene"

const OrbitScene = dynamic(() => import("./scene").then((m) => m.OrbitScene), { ssr: false })

const BEATS = [
  { n: "01", t: "Look", b: "Every tool, login and bill, written down. What it costs, what it touches, what it already connects to." },
  { n: "02", t: "Connect", b: "Your tools wired to each other, and to an AI that works from your real orders, files and inbox." },
  { n: "03", t: "Orbit", b: "One system. Stable. Looked after every month, and visible in one place." },
]

/**
 * The hero and the chaos → order story share one pinned canvas. Scroll drives
 * the blend from a chaotic three-body system to the figure-eight choreography.
 * The dark ground is the design system's own dark theme, scoped to this block.
 */
export function OrbitStory() {
  const wrap = useRef<HTMLDivElement>(null)
  const order = useRef(0)
  // Decided after mount, so the server and the first client render agree.
  const [still, setStill] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setStill(mq.matches)
    const on = () => setStill(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  const [hud, setHud] = useState<OrbitReadout>({ t: 0, order: 0, reseeds: 0 })

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] })
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    order.current = Math.min(1, Math.max(0, (v - 0.2) / 0.55))
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.14], [0, -40])
  const beat = (i: number) => {
    const a = 0.2 + i * 0.2
    return {
      opacity: useTransform(scrollYProgress, [a, a + 0.06, a + 0.16, a + 0.2], [0, 1, 1, i === 2 ? 1 : 0]),
      y: useTransform(scrollYProgress, [a, a + 0.06], [24, 0]),
    }
  }
  const beats = [beat(0), beat(1), beat(2)]

  const stable = hud.order > 0.96
  return (
    <section ref={wrap} data-theme="dark" data-orbit-tokens className="relative h-[380svh] bg-background text-foreground" aria-label="What we do, as a three-body problem">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <OrbitScene order={order} onReadout={setHud} still={still} />
        </div>
        {/* Keeps text legible where it overlaps the light. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_100%,var(--bg)_0%,transparent_55%)]" aria-hidden="true" />

        <div className="relative mx-auto flex h-full w-full max-w-wide flex-col justify-end px-(--gutter) pb-16 sm:pb-20">
          {/* Hero */}
          <motion.div style={still ? undefined : { opacity: heroOpacity, y: heroY }} className="max-w-[46rem]">
            <p className="eyebrow">Solenix · AI and tech for small business</p>
            <h1 className="mt-5 font-display text-statement leading-display font-bold tracking-statement">
              Your business is a <em className="lit-text">three-body problem.</em>
            </h1>
            <p className="mt-6 max-w-[34rem] text-lede text-muted-foreground">
              Too many tools, each pulling on the others. Nothing settles. We find the stable orbit — and keep you in it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="mailto:hello@solenix.dev?subject=Book%20a%20call">Book a call<ArrowRight /></a>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <a href="#portal">See the portal</a>
              </Button>
            </div>
          </motion.div>

          {/* Beats, stacked in the same place */}
          {!still &&
            BEATS.map((b, i) => (
              <motion.div
                key={b.n}
                style={beats[i]}
                className="pointer-events-none absolute bottom-16 left-(--gutter) max-w-[30rem] sm:bottom-20"
              >
                <p className="font-mono text-xs tracking-eyebrow text-ember uppercase">{b.n} · {b.t}</p>
                <p className="mt-3 font-display text-h1 leading-heading font-bold">{b.b}</p>
              </motion.div>
            ))}

          {/* A live readout from the simulation: honest numbers, not decoration. */}
          <dl className="absolute right-(--gutter) bottom-6 hidden grid-cols-[auto_auto] gap-x-4 gap-y-1 rounded-md border border-line bg-[color-mix(in_oklch,var(--bg)_60%,transparent)] px-3 py-2 font-mono text-2xs tracking-label text-muted-foreground uppercase backdrop-blur-sm md:grid">
            <dt>Bodies</dt><dd className="text-right text-foreground">3</dd>
            <dt>t</dt><dd className="text-right text-foreground tabular-nums">{hud.t.toFixed(1)}</dd>
            <dt>State</dt>
            <dd className={stable ? "text-right text-ok" : "text-right text-ember"}>{stable ? "Stable · figure-8" : hud.order > 0.04 ? "Resolving" : "Chaotic"}</dd>
          </dl>
        </div>
      </div>
    </section>
  )
}
