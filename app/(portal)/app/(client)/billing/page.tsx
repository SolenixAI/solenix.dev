import type { Metadata } from "next"
import { BillingScreen } from "@/components/portal/screens/billing"
import { getViewer } from "@/lib/portal"

export const metadata: Metadata = { title: "Billing" }

export default async function Page() {
  const { client } = await getViewer()
  if (!client) return null
  return <BillingScreen client={client} base="/app" asAdmin={false} />
}
