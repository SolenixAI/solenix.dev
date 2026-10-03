import * as React from "react"
import { cn } from "cn"

// 44px, solid surface, --line-strong border; focus goes ember (DESIGN.md §11).
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-tap w-full min-w-0 rounded-md border border-line-strong bg-surface-solid px-4 text-base text-foreground transition-[border-color,box-shadow] duration-(--dur-fast) outline-none placeholder:text-faint hover:border-[color-mix(in_oklch,var(--text)_30%,var(--line-strong))] focus-visible:border-ember focus-visible:ring-3 focus-visible:ring-ember/25 disabled:cursor-not-allowed disabled:bg-sunken disabled:text-faint aria-invalid:border-down",
        className
      )}
      {...props}
    />
  )
}

export { Input }
