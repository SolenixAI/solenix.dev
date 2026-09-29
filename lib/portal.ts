import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Client = {
  id: string;
  business_name: string;
  contact_name: string | null;
  contact_email: string;
  billing_email: string | null;
  site_domain: string | null;
  vercel_project: string | null;
  stripe_customer_id: string | null;
  status: "invited" | "active";
  invited_at: string | null;
  onboarded_at: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "client";
  client_id: string | null;
};

export type Viewer = { profile: Profile; client: Client | null; isAdmin: boolean };

/** Who is signed in, read under RLS. Cached for the length of one request. */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) redirect("/app/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).single<Profile>();
  if (!profile) redirect("/app/login?error=profile");

  let client: Client | null = null;
  if (profile.client_id) {
    const { data } = await supabase.from("clients").select("*").eq("id", profile.client_id).single<Client>();
    client = data;
  }
  return { profile, client, isAdmin: profile.role === "admin" };
});

/** Admin-only pages call this. Anyone else gets a 404, not a hint the page exists. */
export async function requireAdmin() {
  const viewer = await getViewer();
  if (!viewer.isAdmin) notFound();
  return viewer;
}

/** Any client row the viewer may read — RLS decides. */
export const getClient = cache(async (id: string) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle<Client>();
  return data;
});

export async function listClients() {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: true });
  return (data ?? []) as Client[];
}

// ── Your tech, projects, approvals ────────────────────────────────────────────

export type Service = {
  id: string
  client_id: string
  name: string
  kind: string
  vendor: string
  state: "live" | "building" | "down"
  monthly_cents: number
  renews: string | null
  seats: string[]
  note: string | null
  ai: "hub" | "connected" | "can" | null
  ai_note: string | null
  admin_url: string | null
  site_domain: string | null
  vercel_project: string | null
  position: number
}

export type Ask = {
  id: string
  project_id: string
  title: string
  note: string
  status: "waiting" | "approved" | "changes"
  answered_at: string | null
}

export type Project = {
  id: string
  client_id: string
  title: string
  stage: number
  next_label: string | null
  next_when: string | null
  preview_url: string | null
  created_at: string
  asks: Ask[]
}

export async function listServices(clientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("client_id", clientId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
  return (data ?? []) as Service[]
}

export async function listProjects(clientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("projects")
    .select("*, asks:project_asks(*)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "project_asks", ascending: true })
  return (data ?? []) as Project[]
}
