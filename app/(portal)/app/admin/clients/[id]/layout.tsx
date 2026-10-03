import { notFound } from "next/navigation"
import { ArrowLeft, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/portal/submit-button"
import { getClient } from "@/lib/portal"
import { ago } from "@/lib/format"
import { resendInvite } from "../../actions"

/** Viewing a client exactly as they see it, with a bar that says so. */
export default async function ViewingClient({ params, children }: { params: Promise<{ id: string }>; children: React.ReactNode }) {
  const { id } = await params
  const client = await getClient(id)
  if (!client) notFound()

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-line-strong bg-sunken px-4 py-3">
        <span className="grid min-w-0 flex-[1_1_15rem] gap-0.5 text-sm">
          <span className="font-mono text-2xs tracking-label text-faint uppercase">Viewing as client</span>
          <span className="font-semibold">{client.business_name} · {client.contact_name ?? client.contact_email}</span>
          {client.status === "invited" && (
            <span className="text-xs text-muted-foreground">
              Invited {client.invited_at ? ago(new Date(client.invited_at).getTime()) : ""}, not signed in yet.
            </span>
          )}
        </span>
        {client.status === "invited" && (
          <form action={resendInvite}>
            <input type="hidden" name="id" value={client.id} />
            <SubmitButton variant="ghost" size="sm" busy="Sending…">Resend invite</SubmitButton>
          </form>
        )}
        <Button asChild variant="ghost" size="sm">
          <a href={`/app/admin/clients/${client.id}/manage`}><Settings2 />Manage</a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href="/app/admin/clients"><ArrowLeft />Back to clients</a>
        </Button>
      </div>
      {children}
    </>
  )
}
