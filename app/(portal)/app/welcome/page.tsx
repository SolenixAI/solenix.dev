import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mark } from "@/components/portal/icons";
import { getViewer } from "@/lib/portal";
import { WelcomeForm } from "./form";

export const metadata: Metadata = { title: "Welcome" };
export const dynamic = "force-dynamic";

export default async function Welcome() {
  const { client, isAdmin } = await getViewer();
  if (!client || isAdmin) redirect("/app");

  return (
    <div className="app is-signedout">
      <main className="signin welcome" id="main">
        <div className="signin-card">
          <a className="brand" href="/" aria-label="Solenix home">
            <Mark id="sg-welcome" />
            <span>Solenix</span>
          </a>
          <h1>Welcome, {client.contact_name?.split(" ")[0] ?? "and thanks for joining"}</h1>
          <p className="lede">
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
        </div>
      </main>
    </div>
  );
}
