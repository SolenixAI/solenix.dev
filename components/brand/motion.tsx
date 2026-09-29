"use client"

import { useEffect, useRef, useState } from "react"

const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Scroll-linked reveal (DESIGN.md §9): children rise and fade in the first time
 * they reach 15% visibility, never again. Every .reveal under this element is
 * observed. Without script or with reduced motion, content is simply there.
 */
export function Reveals() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>(".reveal:not(.in)")]
    if (still() || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add("in")
          io.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}

/**
 * A number counting up to its value on first view. The final value is what
 * renders on the server, so it is correct before, during and after.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el || still() || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / 1200)
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))))
          if (p < 1) requestAnimationFrame(tick)
        }
        setShown(0)
        requestAnimationFrame(tick)
      },
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value])

  return (
    <span ref={ref} className={className}>
      {shown.toLocaleString("en-CA")}
    </span>
  )
}
