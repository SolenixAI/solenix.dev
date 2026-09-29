import { TechScreen } from "@/components/portal/screens/tech"
import { getClient } from "@/lib/portal"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClient(id)
  if (!client) return null
  return <TechScreen client={client} base={`/app/admin/clients/${client.id}`} />
}
