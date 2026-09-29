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
export async function getClient(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle<Client>();
  return data;
}

export async function listClients() {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: true });
  return (data ?? []) as Client[];
}
