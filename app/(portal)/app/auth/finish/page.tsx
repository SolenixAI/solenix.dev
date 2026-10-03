import type { Metadata } from "next"
import { AuthCard } from "@/components/portal/auth-card"
import { Finish } from "./finish"

export const metadata: Metadata = { title: "Signing you in" }

export default function FinishPage() {
  return (
    <AuthCard>
      <Finish />
    </AuthCard>
  )
}
