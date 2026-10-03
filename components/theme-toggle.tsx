"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { THEME_COOKIE, type ThemeChoice } from "@/lib/theme"

// Light, dark or follow the device, for the portal. The choice is a cookie the
// portal layout reads, so the server renders the right theme on first paint.


const NEXT: Record<ThemeChoice, ThemeChoice> = { system: "light", light: "dark", dark: "system" }
const LABEL: Record<ThemeChoice, string> = { system: "Following your device", light: "Light", dark: "Dark" }

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice | null>(null)
  useEffect(() => {
    const set = document.querySelector("[data-portal]")?.getAttribute("data-theme")
    setTheme(set === "light" || set === "dark" ? set : "system")
  }, [])

  const current = theme ?? "system"
  const next = NEXT[current]
  const label = `Theme: ${LABEL[current]}. Switch to ${LABEL[next].toLowerCase()}`
  const Icon = current === "light" ? Sun : current === "dark" ? Moon : Monitor
  return (
    <Button
      variant="quiet"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => {
        const root = document.querySelector("[data-portal]")
        if (next === "system") root?.removeAttribute("data-theme")
        else root?.setAttribute("data-theme", next)
        document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
        setTheme(next)
      }}
    >
      <Icon className="size-5" />
    </Button>
  )
}
