import type { Client } from "@/lib/portal"
import { listProjects } from "@/lib/portal"
import { STAGES, Timeline, stepsFor } from "@/components/data/timeline"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AskCard } from "../asks"
import { Empty, ExtLink, PageHead } from "../ui"

/** Projects: where each piece of work is up to and what happens next. */
export async function ProjectsScreen({ client, base, canAnswer }: { client: Client; base: string; canAnswer: boolean }) {
  const projects = await listProjects(client.id)

  return (
    <section aria-labelledby="h-projects">
      <PageHead
        eyebrow="Projects"
        title="Work in progress"
        id="h-projects"
        lede="Where each piece of work is up to and what happens next — setting accounts up, training your team, or building the thing nothing off the shelf covered. Nothing to chase: if we need you, it appears here and we email you."
      />

      {projects.length === 0 ? (
        <Empty
          title="No work in progress"
          action={<a className="text-sm font-semibold text-ember-text" href={`${base}/tech`}>See what we run</a>}
        >
          Everything we have built for you is live and looked after. When a new build starts, its stages appear here.
        </Empty>
      ) : (
        <div className="grid gap-8">
          {projects.map((p) => {
            const cared = p.stage === 4
            const waiting = p.asks.filter((a) => a.status === "waiting")
            return (
              <Card key={p.id} size="lg" className="gap-0">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="eyebrow eyebrow-quiet">{cared ? "Looked after" : "In progress"}</span>
                    <h2 className="font-display text-h4 font-semibold">{p.title}</h2>
                  </span>
                  <Badge variant={cared ? "ok" : "warn"}>{cared ? "Looked after" : STAGES[p.stage - 1]}</Badge>
                </div>
                <Timeline steps={stepsFor(p.stage)} />
                {p.next_label && (
                  <p className="mt-6 text-sm text-muted-foreground">
                    <strong className="text-foreground">Next:</strong> {p.next_label}
                    {p.next_when && <> — <span className="font-mono">{p.next_when}</span></>}
                  </p>
                )}
                {p.preview_url && (
                  <p className="mt-3"><ExtLink href={p.preview_url}>Open the preview</ExtLink></p>
                )}
                {waiting.length > 0 && (
                  <div className="mt-4 grid gap-3">
                    {waiting.map((a) => <AskCard key={a.id} ask={a} canAnswer={canAnswer} />)}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
