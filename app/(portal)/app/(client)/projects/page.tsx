import type { Metadata } from "next"
import { ProjectsScreen } from "@/components/portal/screens/projects"
import { getViewer } from "@/lib/portal"

export const metadata: Metadata = { title: "Projects" }

export default async function Page() {
  const { client } = await getViewer()
  if (!client) return null
  return <ProjectsScreen client={client} base="/app" canAnswer />
}
