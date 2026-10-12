"use client"

import { useEffect } from "react"
import { captureGoal } from "@/lib/analytics"

// A visitor who lands on an address the site does not have is counted once, so broken links show up as a number.
export function NotFoundCapture() {
  useEffect(() => {
    captureGoal("page_not_found")
  }, [])
  return null
}
