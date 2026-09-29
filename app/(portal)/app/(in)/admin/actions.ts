"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/server";
import { requestOrigin } from "@/lib/origin";
import { cleanDomain } from "@/lib/format";

export type InviteState = {
  status: "idle" | "sent" | "invalid" | "exists" | "error";
  errors?: Partial<Record<"business" | "owner" | "email" | "domain", string>>;
  message?: string;
  values?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/;

async function sendInvite(email: string, fullName: string | null) {
  const origin = await requestOrigin();
  // Invites run on the server with the service-role key, never in the browser.
  return createAdminClient().auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/app/auth/callback?next=/app/welcome`,
    data: fullName ? { full_name: fullName } : undefined,
  });
}

export async function inviteClient(_prev: InviteState, form: FormData): Promise<InviteState> {
  await requireAdmin();
  const values = {
    business: String(form.get("business") ?? "").trim(),
    owner: String(form.get("owner") ?? "").trim(),
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    domain: cleanDomain(String(form.get("domain") ?? "")),
    project: String(form.get("project") ?? "").trim(),
  };

  const errors: InviteState["errors"] = {};
  if (!values.business) errors.business = "Enter the business name as they would write it themselves.";
  if (!values.owner) errors.owner = "Enter the name of the person who will sign in.";
  if (!EMAIL.test(values.email)) errors.email = "That does not look like an email address. Check for a missing @ or a typo in the domain.";
  if (values.domain && !DOMAIN.test(values.domain)) errors.domain = "Enter just the address, like mapleandrye.ca.";
  if (Object.keys(errors).length) return { status: "invalid", errors, values };

  const db = createAdminClient();
  const { data: existing } = await db.from("clients").select("id").ilike("contact_email", values.email).maybeSingle();
  if (existing) {
    return { status: "exists", values, message: `${values.email} already has a client record. Open it from the list to resend their invite.` };
  }

  const { data: client, error } = await db
    .from("clients")
    .insert({
      business_name: values.business,
      contact_name: values.owner,
      contact_email: values.email,
      billing_email: values.email,
      site_domain: values.domain || null,
      vercel_project: values.project || null,
      status: "invited",
      invited_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !client) {
    console.error("invite: insert client", error?.message);
    return { status: "error", values, message: "We could not save the client. Nothing was sent. Try again." };
  }

  const { data: invited, error: inviteError } = await sendInvite(values.email, values.owner);
  if (inviteError) {
    // Already has an account (say, from Google): link it instead of inviting.
    if (/already (been )?registered|already exists/i.test(inviteError.message)) {
      await linkExistingUser(values.email, client.id);
      revalidatePath("/app/admin/clients");
      return { status: "sent", message: `${values.email} already had an account, so we linked it. They can sign in now.` };
    }
    console.error("invite: send", inviteError.message);
    await db.from("clients").delete().eq("id", client.id);
    return { status: "error", values, message: "The invite email did not send, so we did not add the client. Check the email settings in Supabase and try again." };
  }

  // The new-user trigger links the profile by email; make sure, in case of a race.
  if (invited.user) await db.from("profiles").update({ client_id: client.id }).eq("id", invited.user.id);

  revalidatePath("/app/admin/clients");
  return { status: "sent", message: `Invite sent to ${values.email}.` };
}

async function linkExistingUser(email: string, clientId: string) {
  const db = createAdminClient();
  await db.from("profiles").update({ client_id: clientId }).ilike("email", email).is("client_id", null);
}

export async function resendInvite(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const db = createAdminClient();
  const { data: client } = await db.from("clients").select("contact_email, contact_name").eq("id", id).single();
  if (!client) return;
  const { error } = await sendInvite(client.contact_email, client.contact_name);
  if (error && !/already (been )?registered|already exists/i.test(error.message)) {
    console.error("resend invite", error.message);
  }
  await db.from("clients").update({ invited_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/app/admin/clients/${id}`);
}
