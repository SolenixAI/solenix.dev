import type { Metadata } from "next"
import { Plus, Trash2 } from "lucide-react"
import { getClient, listProjects, listServices, type Project, type Service } from "@/lib/portal"
import { money } from "@/lib/stripe"
import { STAGES } from "@/components/data/timeline"
import { PageHead, Section } from "@/components/portal/ui"
import { SubmitButton } from "@/components/portal/submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { addAsk, deleteAsk, deleteProject, deleteService, saveClientDetails, saveProject, saveService } from "../../../actions"

export const metadata: Metadata = { title: "Manage client" }

// Where the client's records are kept up to date. Everything a client sees on
// Your tech and Projects comes from these rows; billing comes from Stripe and
// site status from Vercel and PostHog, so neither is edited here.

export default async function Manage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClient(id)
  if (!client) return null
  const [services, projects] = await Promise.all([listServices(client.id), listProjects(client.id)])

  return (
    <section aria-labelledby="h-manage">
      <PageHead
        eyebrow="Manage"
        title={client.business_name}
        id="h-manage"
        lede="Keep this client's records current. What you save here is what they see on Your tech and Projects. Invoices live in Stripe; site status and visitors come from Vercel and PostHog."
      />

      <Section title="Details">
        <Card>
          <form action={saveClientDetails}>
            <input type="hidden" name="id" value={client.id} />
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Text name="business_name" label="Business name" value={client.business_name} required />
              <Text name="contact_name" label="Who runs it" value={client.contact_name} />
              <Text name="contact_email" label="Sign-in email" value={client.contact_email} type="email" required />
              <Text name="billing_email" label="Billing email" value={client.billing_email} type="email" />
            </FieldGroup>
            <div className="mt-6"><SubmitButton busy="Saving…" variant="ghost">Save details</SubmitButton></div>
          </form>
        </Card>
      </Section>

      <Section title="Your tech" action={<ServiceDialog clientId={client.id} />}>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts yet. Add each one you set up or look after.</p>
        ) : (
          <ul className="grid gap-3">
            {services.map((s) => (
              <li key={s.id}>
                <Card size="sm" className="flex-row flex-wrap items-center gap-3">
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate font-semibold">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.kind} · {s.vendor}
                      {s.monthly_cents > 0 && ` · ${money(s.monthly_cents)}/mo`}
                      {s.site_domain && ` · live status from ${s.site_domain}`}
                    </span>
                  </span>
                  <ServiceDialog clientId={client.id} service={s} />
                  <form action={deleteService}>
                    <input type="hidden" name="client_id" value={client.id} />
                    <input type="hidden" name="id" value={s.id} />
                    <Button type="submit" variant="quiet" size="icon" aria-label={`Remove ${s.name}`}><Trash2 className="size-4" /></Button>
                  </form>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Projects" action={<ProjectDialog clientId={client.id} />}>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet. Add one when the first call is booked.</p>
        ) : (
          <div className="grid gap-4">
            {projects.map((p) => (
              <Card key={p.id}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="font-semibold">{p.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {STAGES[p.stage - 1]} · step {p.stage} of 4{p.next_label && ` · next: ${p.next_label}`}
                    </span>
                  </span>
                  <ProjectDialog clientId={client.id} project={p} />
                  <form action={deleteProject}>
                    <input type="hidden" name="client_id" value={client.id} />
                    <input type="hidden" name="id" value={p.id} />
                    <Button type="submit" variant="quiet" size="icon" aria-label={`Remove ${p.title}`}><Trash2 className="size-4" /></Button>
                  </form>
                </div>

                {p.asks.length > 0 && (
                  <ul className="grid gap-2 border-t border-line pt-3">
                    {p.asks.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center gap-3">
                        <span className="min-w-0 flex-1 text-sm">{a.title}</span>
                        <Badge variant={a.status === "approved" ? "ok" : a.status === "changes" ? "down" : "warn"}>
                          {a.status === "approved" ? "Approved" : a.status === "changes" ? "Changes asked" : "Waiting"}
                        </Badge>
                        <form action={deleteAsk}>
                          <input type="hidden" name="client_id" value={client.id} />
                          <input type="hidden" name="id" value={a.id} />
                          <Button type="submit" variant="quiet" size="icon" aria-label={`Remove ${a.title}`}><Trash2 className="size-4" /></Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                <form action={addAsk} className="grid gap-3 border-t border-line pt-4">
                  <input type="hidden" name="client_id" value={client.id} />
                  <input type="hidden" name="project_id" value={p.id} />
                  <p className="label">Ask the client to approve something</p>
                  <Input name="title" placeholder="Approve the pickup wording" aria-label="What to approve" required />
                  <Textarea name="note" placeholder="Say exactly what you need them to check, in their words." aria-label="The detail" required />
                  <div><SubmitButton busy="Adding…" variant="ghost" size="sm"><Plus />Add to Waiting on you</SubmitButton></div>
                </form>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </section>
  )
}

function Text({ name, label, value, type = "text", required, help, placeholder }: {
  name: string; label: string; value?: string | number | null; type?: string; required?: boolean; help?: string; placeholder?: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={`m-${name}`}>{label}{required && <span className="font-normal text-ember-text"> (required)</span>}</FieldLabel>
      <Input id={`m-${name}`} name={name} type={type} defaultValue={value ?? ""} required={required} placeholder={placeholder} />
      {help && <FieldDescription>{help}</FieldDescription>}
    </Field>
  )
}

function Select({ name, label, value, options }: { name: string; label: string; value: string; options: [string, string][] }) {
  return (
    <Field>
      <FieldLabel htmlFor={`m-${name}`}>{label}</FieldLabel>
      <NativeSelect id={`m-${name}`} name={name} defaultValue={value}>
        {options.map(([v, l]) => <NativeSelectOption key={v} value={v}>{l}</NativeSelectOption>)}
      </NativeSelect>
    </Field>
  )
}

function ServiceDialog({ clientId, service: s }: { clientId: string; service?: Service }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {s ? <Button variant="ghost" size="sm">Edit</Button> : <Button variant="ghost" size="sm"><Plus />Add an account</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-line bg-surface-solid p-8 sm:max-w-xl">
        <DialogHeader><DialogTitle className="font-display text-h3 font-semibold">{s ? `Edit ${s.name}` : "Add an account"}</DialogTitle></DialogHeader>
        <form action={saveService}>
          <input type="hidden" name="client_id" value={clientId} />
          {s && <input type="hidden" name="id" value={s.id} />}
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Text name="name" label="Name" value={s?.name} required placeholder="Google Workspace · 4 mailboxes" />
            <Text name="kind" label="What it is" value={s?.kind} placeholder="Email and files" />
            <Text name="vendor" label="Vendor" value={s?.vendor} placeholder="Google" />
            <Select name="state" label="State" value={s?.state ?? "live"} options={[["live", "Live"], ["building", "Building"], ["down", "Down"]]} />
            <Text name="monthly" label="Costs them a month ($)" value={s ? s.monthly_cents / 100 : ""} type="number" placeholder="96" />
            <Text name="renews" label="Renews" value={s?.renews} placeholder="Renews 1 Nov" />
            <Text name="seats" label="Who has access" value={s?.seats.join(", ")} placeholder="Anna, Dev, Orders" help="Comma between names." />
            <Text name="admin_url" label="Where the real controls are" value={s?.admin_url} placeholder="https://admin.google.com" />
            <Select name="ai" label="Their AI" value={s?.ai ?? ""} options={[["", "Not relevant"], ["hub", "This is their AI"], ["connected", "Connected to their AI"], ["can", "Can connect to their AI"]]} />
            <Text name="ai_note" label="AI note" value={s?.ai_note} placeholder="it reads the order inbox" />
          </FieldGroup>
          <FieldGroup className="mt-4 gap-4">
            <Text name="note" label="Latest" value={s?.note} placeholder="Email on mapleandrye.ca, shared drive, calendars" />
            <Text name="site_domain" label="Website address" value={s?.site_domain} placeholder="mapleandrye.ca" help="For a website: its status, last deploy and visitors are then read live." />
            <Text name="vercel_project" label="Vercel project" value={s?.vercel_project} placeholder="maple-and-rye" />
          </FieldGroup>
          <div className="mt-6"><SubmitButton busy="Saving…">{s ? "Save changes" : "Add the account"}</SubmitButton></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProjectDialog({ clientId, project: p }: { clientId: string; project?: Project }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {p ? <Button variant="ghost" size="sm">Edit</Button> : <Button variant="ghost" size="sm"><Plus />Add a project</Button>}
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-line bg-surface-solid p-8 sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-h3 font-semibold">{p ? `Edit ${p.title}` : "Add a project"}</DialogTitle></DialogHeader>
        <form action={saveProject}>
          <input type="hidden" name="client_id" value={clientId} />
          {p && <input type="hidden" name="id" value={p.id} />}
          <FieldGroup className="gap-4">
            <Text name="title" label="Title" value={p?.title} required placeholder="Online ordering for pickup" />
            <Select name="stage" label="Stage" value={String(p?.stage ?? 1)} options={STAGES.map((s, i) => [String(i + 1), `${i + 1} · ${s}`])} />
            <Text name="next_label" label="What happens next" value={p?.next_label} placeholder="You see the order form working" />
            <Text name="next_when" label="When" value={p?.next_when} placeholder="Thursday 2 October" />
            <Text name="preview_url" label="Preview link" value={p?.preview_url} placeholder="https://…vercel.app" />
          </FieldGroup>
          <div className="mt-6"><SubmitButton busy="Saving…">{p ? "Save changes" : "Add the project"}</SubmitButton></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
