-- Client portal v1: profiles, clients, roles and row-level security.
-- The repo is public, so every table has RLS on, and writes that change
-- who-can-see-what go through the server with the service-role key.

-- ── Clients ────────────────────────────────────────────────────────────────
create table public.clients (
  id                  uuid primary key default gen_random_uuid(),
  business_name       text not null,
  contact_name        text,
  contact_email       text not null,
  billing_email       text,
  site_domain         text,
  vercel_project      text,
  stripe_customer_id  text unique,
  status              text not null default 'invited' check (status in ('invited', 'active')),
  invited_at          timestamptz,
  onboarded_at        timestamptz,
  created_at          timestamptz not null default now()
);
create unique index clients_contact_email_key on public.clients (lower(contact_email));

-- ── Profiles: one per signed-in person ─────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'client' check (role in ('admin', 'client')),
  client_id   uuid references public.clients (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index profiles_client_id_idx on public.profiles (client_id);

-- ── Role helpers (RBAC) ────────────────────────────────────────────────────
-- security definer so policies can read profiles without recursing into RLS.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create or replace function public.my_client_id()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select client_id from public.profiles where id = (select auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.my_client_id() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_client_id() to authenticated;

-- ── New user → profile, linked to their client row by email ────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, client_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when lower(new.email) = 'jager@solenix.dev' then 'admin' else 'client' end,
    (select c.id from public.clients c where lower(c.contact_email) = lower(new.email) limit 1)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row-level security ─────────────────────────────────────────────────────
alter table public.clients  enable row level security;
alter table public.profiles enable row level security;

-- Profiles: read your own row; an admin reads all. No one updates through the
-- API — role and client_id are set by the trigger and by server code only.
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- Clients: an admin sees everything; a client sees only their own row.
create policy "clients: read own or admin" on public.clients
  for select to authenticated
  using ((select public.is_admin()) or id = (select public.my_client_id()));

-- ── Solenix itself, so the admin view shows solenix.dev from day one ───────
insert into public.clients (business_name, contact_name, contact_email, site_domain, vercel_project, status, onboarded_at)
values ('Solenix', 'Jager Cooper', 'jager@solenix.dev', 'solenix.dev', 'solenix-dev', 'active', now());
