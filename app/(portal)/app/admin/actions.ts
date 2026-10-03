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

  // Their website is a service like any other; its live facts are read from Vercel and PostHog.
  if (values.domain) {
    await db.from("services").insert({
      client_id: client.id,
      name: values.domain,
      kind: "Website and domain",
      vendor: "Vercel",
      site_domain: values.domain,
      vercel_project: values.project || null,
      seats: [values.owner.split(" ")[0]],
    });
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

// ── Manage a client: details, tech, projects, approvals ─────────────────────
// Admin only, service-role writes. Every form posts here; each action checks
// the admin first, then writes, then revalidates the client's screens.

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim()
const opt = (f: FormData, k: string) => str(f, k) || null
const uuid = (v: string) => (/^[0-9a-f-]{36}$/i.test(v) ? v : null)
/** "1,500.00" or "1500" → 150000; empty or invalid → null. */
const cents = (v: string) => {
  const n = Number(v.replace(/[$,\s]/g, ""))
  return v.trim() && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null
}
const done = (clientId: string) => revalidatePath(`/app/admin/clients/${clientId}`, "layout")

export async function saveClientDetails(form: FormData) {
  await requireAdmin()
  const id = uuid(str(form, "id"))
  if (!id || !str(form, "business_name") || !EMAIL.test(str(form, "contact_email").toLowerCase())) return
  await createAdminClient()
    .from("clients")
    .update({
      business_name: str(form, "business_name"),
      contact_name: opt(form, "contact_name"),
      contact_email: str(form, "contact_email").toLowerCase(),
      billing_email: opt(form, "billing_email"),
      plan_name: opt(form, "plan_name"),
      setup_cents: cents(str(form, "setup")),
      monthly_cents: cents(str(form, "monthly")),
    })
    .eq("id", id)
  done(id)
}

export async function saveService(form: FormData) {
  await requireAdmin()
  const clientId = uuid(str(form, "client_id"))
  const id = uuid(str(form, "id"))
  if (!clientId || !str(form, "name")) return
  const domain = cleanDomain(str(form, "site_domain"))
  const dollars = Number(str(form, "monthly") || "0")
  const ai = str(form, "ai")
  const row = {
    client_id: clientId,
    name: str(form, "name"),
    kind: str(form, "kind") || "Service",
    vendor: str(form, "vendor") || "Other",
    state: ["live", "building", "down"].includes(str(form, "state")) ? str(form, "state") : "live",
    monthly_cents: Number.isFinite(dollars) ? Math.round(dollars * 100) : 0,
    renews: opt(form, "renews"),
    seats: str(form, "seats").split(",").map((s) => s.trim()).filter(Boolean),
    note: opt(form, "note"),
    ai: ["hub", "connected", "can"].includes(ai) ? ai : null,
    ai_note: opt(form, "ai_note"),
    admin_url: /^https:\/\//.test(str(form, "admin_url")) ? str(form, "admin_url") : null,
    site_domain: domain || null,
    vercel_project: opt(form, "vercel_project"),
  }
  const db = createAdminClient()
  if (id) await db.from("services").update(row).eq("id", id).eq("client_id", clientId)
  else await db.from("services").insert(row)
  done(clientId)
}

export async function deleteService(form: FormData) {
  await requireAdmin()
  const clientId = uuid(str(form, "client_id"))
  const id = uuid(str(form, "id"))
  if (!clientId || !id) return
  await createAdminClient().from("services").delete().eq("id", id).eq("client_id", clientId)
  done(clientId)
}

export async function saveProject(form: FormData) {
  await requireAdmin()
  const clientId = uuid(str(form, "client_id"))
  const id = uuid(str(form, "id"))
  const stage = Math.min(4, Math.max(1, Number(str(form, "stage")) || 1))
  if (!clientId || !str(form, "title")) return
  const row = {
    client_id: clientId,
    title: str(form, "title"),
    stage,
    next_label: opt(form, "next_label"),
    next_when: opt(form, "next_when"),
    preview_url: /^https:\/\//.test(str(form, "preview_url")) ? str(form, "preview_url") : null,
  }
  const db = createAdminClient()
  if (id) await db.from("projects").update(row).eq("id", id).eq("client_id", clientId)
  else await db.from("projects").insert(row)
  done(clientId)
}

export async function deleteProject(form: FormData) {
  await requireAdmin()
  const clientId = uuid(str(form, "client_id"))
  const id = uuid(str(form, "id"))
  if (!clientId || !id) return
  await createAdminClient().from("projects").delete().eq("id", id).eq("client_id", clientId)
  done(clientId)
}

export async function addAsk(form: FormData) {
  await requireAdmin()
  const clientId = uuid(str(form, "client_id"))
  const projectId = uuid(str(form, "project_id"))
  if (!clientId || !projectId || !str(form, "title") || !str(form, "note")) return
  const db = createAdminClient()
  const { data: p } = await db.from("projects").select("id").eq("id", projectId).eq("client_id", clientId).maybeSingle()
  if (!p) return
  await db.from("project_asks").insert({ project_id: projectId, title: str(form, "title"), note: str(form, "note") })
  done(clientId)
}

export async function deleteAsk(form: FormData) {
  await requireAdmin()
  const clientId = uuid(str(form, "client_id"))
  const id = uuid(str(form, "id"))
  if (!clientId || !id) return
  await createAdminClient().from("project_asks").delete().eq("id", id)
  done(clientId)
}
