// The copy-for-AI button, for React. The rules live in lib/copy-for-ai.ts; this hook wires them to the page: the
// browser's clipboard and timers, and the one element that holds the full sentence, which a failed copy selects.
import { useEffect, useRef, useState } from "react"
import { createCopyForAi, type CopyStatus } from "@/lib/copy-for-ai"

// `reveal` opens whatever shows the sentence (a disclosure) before a failed copy selects it.
export function useCopyForAi<T extends HTMLElement = HTMLElement>(sentence: string, reveal?: () => void) {
  const [status, setStatus] = useState<CopyStatus>("idle")
  const [failures, setFailures] = useState(0)
  const text = useRef<T>(null)
  const revealRef = useRef(reveal)
  useEffect(() => {
    revealRef.current = reveal
  })
  const [controller] = useState(() =>
    createCopyForAi({
      clipboard: () => (typeof navigator === "undefined" ? undefined : navigator.clipboard),
      clock: {
        setTimeout: (run, ms) => window.setTimeout(run, ms),
        clearTimeout: (handle) => window.clearTimeout(handle as number),
      },
      onChange: setStatus,
      onFail: () => {
        revealRef.current?.()
        setFailures((n) => n + 1)
      },
    }),
  )
  // Leaving the page cancels a pending reset.
  useEffect(() => () => controller.blur(), [controller])
  // A failed copy selects the whole sentence, so one copy command takes it.
  useEffect(() => {
    const el = text.current
    if (status !== "failed" || !el) return
    const range = document.createRange()
    range.selectNodeContents(el)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [status, failures])
  return {
    status,
    text,
    copy: () => controller.press(sentence),
    fail: () => controller.fail(),
    blur: () => controller.blur(),
  }
}
