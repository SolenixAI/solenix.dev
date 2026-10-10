// What the copy-for-AI button shows, with no DOM and no React. The clipboard and the clock come in as arguments, so a
// test can make a copy succeed or fail, and move time by hand. The hook in app/(site)/agents wraps this.

export const COPIED = "Copied. Paste it into your AI"
export const RESET_AFTER_MS = 3000
export const FAILED = "Couldn't copy here. The sentence is selected. Copy it now: press Ctrl+C or Cmd+C, or choose Copy from the menu."

export type CopyStatus = "idle" | "copied" | "failed"

export type Clipboard = { writeText(text: string): Promise<void> }
export type Clock = {
  setTimeout(run: () => void, ms: number): unknown
  clearTimeout(handle: unknown): void
}

export function createCopyForAi(options: {
  clipboard: () => Clipboard | undefined
  clock: Clock
  onChange: (status: CopyStatus) => void
  onFail: () => void
}) {
  let status: CopyStatus = "idle"
  let timer: unknown = null
  let generation = 0
  const set = (next: CopyStatus) => {
    status = next
    options.onChange(next)
  }
  const stop = () => {
    if (timer !== null) options.clock.clearTimeout(timer)
    timer = null
  }
  return {
    get status(): CopyStatus {
      return status
    },
    async press(sentence: string): Promise<void> {
      const mine = ++generation
      const board = options.clipboard()
      let written = board !== undefined
      if (board) {
        try {
          await board.writeText(sentence)
        } catch {
          written = false
        }
      }
      // A newer copy started while this write was pending: its answer is the one the page shows.
      if (mine !== generation) return
      if (!written) {
        stop()
        set("failed")
        options.onFail()
        return
      }
      stop()
      set("copied")
      timer = options.clock.setTimeout(() => {
        timer = null
        set("idle")
      }, RESET_AFTER_MS)
    },
    // The page already knows copying does not work here (a card found no clipboard, and its world opens failed).
    fail(): void {
      generation++
      stop()
      set("failed")
      options.onFail()
    },
    blur(): void {
      stop()
      if (status !== "idle") set("idle")
    },
  }
}
