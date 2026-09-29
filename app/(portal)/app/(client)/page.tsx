import type { Metadata } from "next"
import { OverviewScreen } from "@/components/portal/screens/overview"
import { getViewer } from "@/lib/portal"

export const metadata: Metadata = { title: "Overview" }

export default async function Page() {
  const { client } = await getViewer()
  if (!client) return null
  return <OverviewScreen client={client} base="/app" canAnswer />
}
