import { OverviewScreen } from "@/components/portal/screens/overview"
import { getClient } from "@/lib/portal"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClient(id)
  if (!client) return null
  return <OverviewScreen client={client} base={`/app/admin/clients/${client.id}`} canAnswer={false} />
}
