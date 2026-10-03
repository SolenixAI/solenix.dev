import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Buttons are pills with a 44px target (DESIGN.md §6–7, §11).
// "default" is action ember: one per screen. Everything else is secondary.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-pill border border-transparent font-semibold whitespace-nowrap no-underline outline-none select-none transition-[background,border-color,color,translate,box-shadow] duration-(--dur-base) ease-house focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ember disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-(image:--grad-ember) text-ember-ink shadow-ember hover:-translate-y-px hover:bg-ember-hover hover:[background-image:none] active:translate-y-0",
        outline: "border-line-strong text-foreground hover:bg-accent",
        ghost: "border-line-strong text-foreground hover:bg-accent",
        secondary: "border-line bg-surface text-foreground hover:bg-accent",
        quiet: "text-muted-foreground hover:bg-line hover:text-foreground",
        destructive: "bg-down-tint text-down hover:bg-down/15",
        link: "min-h-0! px-0! text-ember-text hover:underline hover:underline-offset-3",
      },
      size: {
        default: "min-h-tap px-6 text-sm",
        sm: "min-h-tap px-4 text-xs",
        lg: "min-h-12 px-7 text-base",
        icon: "size-tap",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
