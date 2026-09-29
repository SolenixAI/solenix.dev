import { ArrowLeft } from "lucide-react"
import { Lockup } from "@/components/brand/mark"
import { cn } from "@/lib/utils"

/** The centred card for sign-in, onboarding and link landing. Glass over its own light. */
export function AuthCard({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="lit grid min-h-dvh place-items-center bg-(image:--grad-sky) px-(--gutter) py-8" style={{ "--light-x": "88%", "--light-y": "-4%", "--light-size": "26rem", "--light-strength": 0.35 } as React.CSSProperties}>
      <div className="sky" aria-hidden="true"><div className="sky-light" /></div>
      <main id="main" className={cn("content relative w-full", wide ? "max-w-xl" : "max-w-[27rem]")}>
        <a href="/" className="mb-4 inline-flex min-h-tap items-center gap-2 text-sm font-semibold text-muted-foreground no-underline hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to solenix.dev
        </a>
        <div className="rounded-2xl border border-line bg-surface px-6 py-12 shadow-lg backdrop-blur-(--glass-blur) sm:px-8">
          <Lockup />
          {children}
        </div>
      </main>
    </div>
  )
}
