// The copy-for-AI button, for React. The rules live in lib/copy-for-ai.ts; this hook wires them to the page: the
// browser's clipboard and timers, and the one element that holds the full sentence, which a failed copy selects.
import { useEffect, useRef, useState } from "react"
import { createCopyForAi, type CopyStatus } from "@/lib/copy-for-ai"

// A failed copy shows the sentence (`shown` stays true until a later copy succeeds, so it survives the button losing
// focus), selects it and scrolls it into view. `onFail` runs on each failure, for a surface that must do more (a card
// opens its world).
export function useCopyForAi<T extends HTMLElement = HTMLElement>(sentence: string, onFail?: () => void) {
  const [status, setStatus] = useState<CopyStatus>("idle")
  const [shown, setShown] = useState(false)
  const [failures, setFailures] = useState(0)
  const text = useRef<T>(null)
  const onFailRef = useRef(onFail)
  useEffect(() => {
    onFailRef.current = onFail
  })
  const [controller] = useState(() =>
    createCopyForAi({
      clipboard: () => (typeof navigator === "undefined" ? undefined : navigator.clipboard),
      clock: {
        setTimeout: (run, ms) => window.setTimeout(run, ms),
        clearTimeout: (handle) => window.clearTimeout(handle as number),
      },
      onChange: (next) => {
        setStatus(next)
        if (next === "copied") setShown(false)
      },
      onFail: () => {
        setShown(true)
        onFailRef.current?.()
        setFailures((n) => n + 1)
      },
    }),
  )
  // Leaving the page cancels a pending reset.
  useEffect(() => () => controller.blur(), [controller])
  // A failed copy selects the whole sentence and scrolls it into view only when it is out of view, so one copy command takes it.
  useEffect(() => {
    const el = text.current
    if (status !== "failed" || !el) return
    const range = document.createRange()
    range.selectNodeContents(el)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    el.scrollIntoView({ block: "nearest" })
  }, [status, failures])
  return {
    status,
    shown,
    text,
    copy: () => controller.press(sentence),
    fail: () => controller.fail(),
    blur: () => controller.blur(),
  }
}
