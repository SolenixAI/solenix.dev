import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteOverview } from "@/components/portal/overview";
import { Billing } from "@/components/portal/billing";
import { BackArrow } from "@/components/portal/icons";
import { SubmitButton } from "@/components/portal/client-bits";
import { getClient, requireAdmin } from "@/lib/portal";
import { ago } from "@/lib/format";
import { resendInvite } from "../../actions";

export const metadata: Metadata = { title: "Client" };
export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { tab } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const client = await getClient(id);
  if (!client) notFound();
  const billing = tab === "billing";

  return (
    <section className="screen" aria-labelledby={billing ? "h-billing" : "h-overview"}>
      <div className="asbar">
        <span className="asbar-text od-stat" style={{ ["--od-gap" as string]: "2px" }}>
          <span className="asbar-eyebrow">Viewing as client</span>
          <span style={{ fontWeight: "var(--fw-semibold)" }}>
            {client.business_name} · {client.contact_name ?? client.contact_email}
          </span>
          {client.status === "invited" && (
            <span className="xs faint">Invited {client.invited_at ? ago(new Date(client.invited_at).getTime()) : ""}, not signed in yet.</span>
          )}
        </span>
        {client.status === "invited" && (
          <form action={resendInvite}>
            <input type="hidden" name="id" value={client.id} />
            <SubmitButton className="btn btn-ghost btn-sm od-fixed" busy="Sending…">Resend invite</SubmitButton>
          </form>
        )}
        <a className="btn btn-ghost btn-sm od-fixed" href={billing ? `/app/admin/clients/${client.id}` : `/app/admin/clients/${client.id}?tab=billing`}>
          {billing ? "Their overview" : "Their billing"}
        </a>
        <a className="btn btn-ghost btn-sm od-fixed" href="/app/admin/clients">
          <BackArrow />
          Back to clients
        </a>
      </div>

      {billing ? <Billing client={client} asAdmin /> : <SiteOverview client={client} />}
    </section>
  );
}
