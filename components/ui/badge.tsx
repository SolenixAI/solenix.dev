import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// A state is a dot, a colour and a word — never colour alone (DESIGN.md §3).
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 font-mono text-2xs font-semibold tracking-label uppercase whitespace-nowrap before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
  {
    variants: {
      variant: {
        ok: "bg-ok-tint text-ok",
        warn: "bg-warn-tint text-warn",
        down: "bg-down-tint text-down",
        quiet: "bg-sunken text-muted-foreground",
        example: "border border-line bg-sunken text-muted-foreground before:bg-faint",
        plain: "border border-line text-muted-foreground before:hidden",
      },
      live: {
        true: "before:[box-shadow:var(--glow-point)] before:animate-[pulse_var(--pulse-period)_var(--ease-in-out)_infinite] motion-reduce:before:animate-none",
      },
    },
    defaultVariants: {
      variant: "quiet",
    },
  }
)

function Badge({
  className,
  variant,
  live,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, live }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
