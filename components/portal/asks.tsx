import { answerAsk } from "@/app/(portal)/app/(client)/actions"
import type { Ask } from "@/lib/portal"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "./submit-button"

/** Something waiting on the client. "Looks right" records the approval; a change request goes by email. */
export function AskCard({ ask, canAnswer }: { ask: Ask; canAnswer: boolean }) {
  return (
    <div className="grid gap-4 rounded-xl border border-[color-mix(in_oklch,var(--accent)_40%,var(--line))] bg-ember-quiet p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <h3 className="font-display text-h4 font-semibold">{ask.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{ask.note}</p>
      </div>
      {canAnswer ? (
        <div className="flex flex-wrap gap-3">
          <form action={answerAsk}>
            <input type="hidden" name="id" value={ask.id} />
            <SubmitButton variant="ghost" size="sm" busy="Sending…">Looks right</SubmitButton>
          </form>
          <Button asChild variant="quiet" size="sm">
            <a href={`mailto:hello@solenix.dev?subject=${encodeURIComponent(`Change: ${ask.title}`)}`}>Ask for a change</a>
          </Button>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Waiting on the client</span>
      )}
    </div>
  )
}
