"use client"

import { useEffect } from "react"

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

