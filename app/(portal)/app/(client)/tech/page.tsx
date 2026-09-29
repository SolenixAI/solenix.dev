import type { Metadata } from "next"
import { TechScreen } from "@/components/portal/screens/tech"
import { getViewer } from "@/lib/portal"

export const metadata: Metadata = { title: "Your tech" }

export default async function Page() {
  const { client } = await getViewer()
  if (!client) return null
  return <TechScreen client={client} base="/app" />
}
