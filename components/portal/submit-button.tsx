"use client"

import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"

/** A submit button with the design's busy state: a spinner and a busy label, never a dead click. */
export function SubmitButton({
  children,
  busy,
  ...props
}: React.ComponentProps<typeof Button> & { busy: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" aria-disabled={pending || undefined} {...props}>
      {pending ? (
        <>
          <Loader2 className="animate-spin motion-reduce:animate-[spin_2s_linear_infinite]" aria-hidden="true" />
          {busy}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
