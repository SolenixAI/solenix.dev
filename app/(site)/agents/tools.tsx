"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// The list comes from the marketplace file on GitHub, read live on every visit.
// That file is the source of truth; nothing here is a copy of it.
const CATALOG = "https://raw.githubusercontent.com/SolenixAI/agents-marketplace/main/.agents/plugins/marketplace.json"
const REPO = "https://github.com/SolenixAI/agents-marketplace"

type Plugin = {
  name?: unknown
  description?: unknown
  category?: unknown
  source?: { url?: unknown; source?: unknown; path?: unknown }
}

const safeUrl = (u: unknown) => (typeof u === "string" && /^https:\/\//.test(u) ? u : REPO)
const sourceUrl = (src: Plugin["source"]) => {
  if (!src || typeof src.url !== "string") return REPO
  const repo = src.url.replace(/\.git$/, "")
  return safeUrl(src.source === "git-subdir" && src.path ? `${repo}/tree/HEAD/${src.path}` : repo)
}

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

type State = { kind: "loading" } | { kind: "error" } | { kind: "ok"; tools: Plugin[] }

export function Tools() {
  const [state, setState] = useState<State>({ kind: "loading" })

  useEffect(() => {
    fetch(CATALOG, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((data) => setState({ kind: "ok", tools: Array.isArray(data.plugins) ? data.plugins : [] }))
      .catch(() => setState({ kind: "error" }))
  }, [])

  if (state.kind === "loading") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading tools">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    )
  }
  if (state.kind === "error" || state.tools.length === 0) {
    return (
      <Card className="items-start border-dashed bg-sunken shadow-none">
        <CardTitle>{state.kind === "error" ? "We could not load the list" : "No tools listed yet"}</CardTitle>
        <a className="text-sm text-ember-text" href={state.kind === "error" ? `${REPO}/blob/main/.agents/plugins/marketplace.json` : `${REPO}/releases/latest`}>
          {state.kind === "error" ? "See it on GitHub →" : "Latest release →"}
        </a>
      </Card>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
      {state.tools.map((p, i) => (
        <Card key={String(p.name) + i}>
          <Badge variant="plain">{String(p.category || "Plugin")}</Badge>
          <CardTitle>{String(p.name || "")}</CardTitle>
          <p className="text-sm text-muted-foreground">{String(p.description || "")}</p>
          <p className="label">Claude Code</p>
          <Cmd text={`/plugin install ${p.name}@solenix`} />
          <p className="label">Codex / ChatGPT</p>
          <Cmd text={`codex plugin add ${p.name}@solenix`} />
          <a className="mt-auto text-sm text-ember-text" href={sourceUrl(p.source)}>Source →</a>
        </Card>
      ))}
    </div>
  )
}
