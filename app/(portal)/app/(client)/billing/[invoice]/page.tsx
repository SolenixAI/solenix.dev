import type { Metadata } from "next"
import { InvoiceScreen } from "@/components/portal/screens/billing"
import { getViewer } from "@/lib/portal"

export const metadata: Metadata = { title: "Invoice" }

export default async function Page({ params }: { params: Promise<{ invoice: string }> }) {
  const [{ client }, { invoice }] = await Promise.all([getViewer(), params])
  if (!client) return null
  return <InvoiceScreen client={client} base="/app" invoiceId={invoice} />
}
