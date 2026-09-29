"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

/** Flips between light and dark. next-themes remembers the choice and writes [data-theme]. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const next = mounted && resolvedTheme === "dark" ? "light" : "dark"
  const label = `Switch to the ${next} theme`
  return (
    <Button variant="quiet" size="icon" aria-label={label} title={label} onClick={() => setTheme(next)}>
      {mounted && resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
