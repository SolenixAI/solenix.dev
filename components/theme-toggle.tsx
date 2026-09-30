"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

// Light or dark for the portal. tokens.css reads [data-theme] on <html>; the
// root layout applies the saved choice before first paint, so there is no flash.

const KEY = "solenix-theme"

function current(): "light" | "dark" {
  const set = document.documentElement.getAttribute("data-theme")
  if (set === "light" || set === "dark") return set
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null)
  useEffect(() => setTheme(current()), [])

  const next = theme === "dark" ? "light" : "dark"
  const label = `Switch to the ${next} theme`
  return (
    <Button
      variant="quiet"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => {
        document.documentElement.setAttribute("data-theme", next)
        try { localStorage.setItem(KEY, next) } catch { /* private mode */ }
        setTheme(next)
      }}
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
