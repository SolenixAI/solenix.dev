import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthCard } from "@/components/portal/auth-card"
import { getViewer } from "@/lib/portal"
import { WelcomeForm } from "./form"

export const metadata: Metadata = { title: "Welcome" }

export default async function Welcome() {
  const { client, isAdmin } = await getViewer()
  if (!client || isAdmin) redirect("/app")

  return (
    <AuthCard wide>
      <h1 className="mt-4 font-display text-h2 font-bold">Welcome, {client.contact_name?.split(" ")[0] ?? "and thanks for joining"}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        One short form and you are in. We use these details on your invoices, and Stripe uses the address to work out the right tax.
      </p>
      <WelcomeForm
        initial={{
          business: client.business_name,
          contact: client.contact_name ?? "",
          email: client.billing_email ?? client.contact_email,
          domain: client.site_domain ?? "",
          country: "CA",
          province: "NL",
        }}
      />
    </AuthCard>
  )
}
