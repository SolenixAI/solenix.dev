"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

/** A command with a Copy button. */
export function Cmd({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-sunken py-1 pr-1 pl-3">
      <code className="min-w-0 flex-1 overflow-x-auto py-2 font-mono text-xs whitespace-nowrap">{text}</code>
      <Button
        variant="secondary"
        size="sm"
        className="shrink-0"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            toast.success("Command copied")
            setTimeout(() => setCopied(false), 1600)
          } catch {
            toast("Select the command and copy it")
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}
