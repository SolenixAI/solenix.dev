import { InvoiceScreen } from "@/components/portal/screens/billing"
import { getClient } from "@/lib/portal"

export default async function Page({ params }: { params: Promise<{ id: string; invoice: string }> }) {
  const { id, invoice } = await params
  const client = await getClient(id)
  if (!client) return null
  return <InvoiceScreen client={client} base={`/app/admin/clients/${client.id}`} invoiceId={invoice} />
}
