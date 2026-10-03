"use client"

import { useState } from "react"
import { RowSpark } from "@/components/data/spark"
import { Empty, RowLink, Rows, StateBadge, type SiteState } from "@/components/portal/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type ClientRow = {
  id: string
  business: string
  owner: string
  invited: boolean
  site: SiteState
  stage: string | null
  invoice: { v: "ok" | "warn" | "down" | "quiet"; word: string }
  visitors: { total: number; series: number[] } | null
  hasSite: boolean
}

/** The client list with the design's type-to-filter box. */
export function ClientList({ rows, invite }: { rows: ClientRow[]; invite: React.ReactNode }) {
  const [typed, setTyped] = useState("")
  const q = typed.trim().toLowerCase()
  const shown = q ? rows.filter((r) => r.business.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q)) : rows

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="grid min-w-0 flex-[1_1_14rem] gap-2">
          <Label htmlFor="client-filter">Find a client</Label>
          <Input
            id="client-filter"
            autoComplete="off"
            placeholder="Start typing a business name"
            aria-describedby="filter-help"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <p id="filter-help" className="text-xs text-faint">Filters the list as you type.</p>
        </div>
        <div className="pb-6">{invite}</div>
      </div>

      {rows.length === 0 ? (
        <Empty title="No clients yet">Invite your first client. They get an email with a sign-in link, and appear here straight away.</Empty>
      ) : shown.length === 0 ? (
        <Empty
          title={`No client matches “${typed.trim()}”`}
          action={<Button variant="quiet" size="sm" onClick={() => setTyped("")}>Clear the filter</Button>}
        >
          Check the spelling, or clear the filter to see all {rows.length} clients again.
        </Empty>
      ) : (
        <Rows>
          {shown.map((r) => (
            <li key={r.id}>
              <RowLink href={`/app/admin/clients/${r.id}`}>
                <span className="grid min-w-0 flex-1 gap-2">
                  <span className="truncate font-semibold">{r.business}</span>
                  <span className="flex flex-wrap gap-2">
                    <StateBadge state={r.site} />
                    {r.invited && <Badge variant="warn">Invited</Badge>}
                    {r.stage && <Badge variant="quiet">{r.stage}</Badge>}
                    <Badge variant={r.invoice.v}>{r.invoice.word}</Badge>
                  </span>
                </span>
                {r.visitors ? (
                  <RowSpark series={r.visitors.series} label={`${r.visitors.total.toLocaleString("en-CA")} visitors in the last 30 days.`} />
                ) : (
                  <span className="w-[52px] shrink-0 text-right font-mono text-2xs text-muted-foreground sm:w-[76px]">
                    {r.hasSite ? "no visits yet" : "no site"}
                  </span>
                )}
              </RowLink>
            </li>
          ))}
        </Rows>
      )}
    </>
  )
}
