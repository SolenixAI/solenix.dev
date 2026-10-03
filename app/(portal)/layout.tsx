import { cookies } from "next/headers"
import { THEME_COOKIE, type ThemeChoice } from "@/lib/theme"

// The portal follows the device's light or dark setting unless the person
// picked one. The choice lives in a cookie so the first paint is already right.
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const saved = (await cookies()).get(THEME_COOKIE)?.value as ThemeChoice | undefined
  const theme = saved === "light" || saved === "dark" ? saved : undefined
  return (
    <div data-portal="" data-theme={theme} className="min-h-dvh bg-background text-foreground">
      {children}
    </div>
  )
}
