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

-- ── Your tech: every account and service we run for a client ───────────────
-- A website row carries its domain and Vercel project; its status, last
-- deploy and visitors are then read live from Vercel and PostHog, never stored.
create table public.services (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  name            text not null,
  kind            text not null,                 -- "Website and domain", "Email and files", …
  vendor          text not null,                 -- "Vercel", "Google", "Anthropic", …
  state           text not null default 'live' check (state in ('live', 'building', 'down')),
  monthly_cents   integer not null default 0,    -- what the vendor bills the client, in cents
  renews          text,                          -- "Renews 14 Oct", "No charge"
  seats           text[] not null default '{}',  -- who on their team can get in
  note            text,                          -- the latest plain-words line
  ai              text check (ai in ('hub', 'connected', 'can')),
  ai_note         text,
  admin_url       text,                          -- where the real controls live
  site_domain     text,
  vercel_project  text,
  position        integer not null default 0,
  created_at      timestamptz not null default now()
);
create index services_client_id_idx on public.services (client_id, position);

-- ── Projects: the stage, what happens next, what waits on the client ───────
create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  title         text not null,
  stage         integer not null default 1 check (stage between 1 and 4),  -- Call, Plan, Build, Care
  next_label    text,
  next_when     text,
  preview_url   text,
  created_at    timestamptz not null default now()
);
create index projects_client_id_idx on public.projects (client_id);

create table public.project_asks (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  title         text not null,
  note          text not null,
  status        text not null default 'waiting' check (status in ('waiting', 'approved', 'changes')),
  answered_at   timestamptz,
  answered_by   uuid references auth.users (id),
  created_at    timestamptz not null default now()
);
create index project_asks_project_id_idx on public.project_asks (project_id);

alter table public.services     enable row level security;
alter table public.projects     enable row level security;
alter table public.project_asks enable row level security;

create policy "services: read own or admin" on public.services
  for select to authenticated
  using ((select public.is_admin()) or client_id = (select public.my_client_id()));

create policy "projects: read own or admin" on public.projects
  for select to authenticated
  using ((select public.is_admin()) or client_id = (select public.my_client_id()));

create policy "project_asks: read own or admin" on public.project_asks
  for select to authenticated
  using (
    (select public.is_admin())
    or project_id in (select p.id from public.projects p where p.client_id = (select public.my_client_id()))
  );

-- Solenix's own website, so the admin sees solenix.dev under Your tech too.
insert into public.services (client_id, name, kind, vendor, renews, seats, note, admin_url, site_domain, vercel_project)
select id, 'solenix.dev', 'Website and domain', 'Vercel', 'Hosted on team Solenix', '{Jager}',
       'The public site and this portal', 'https://vercel.com/solenix/solenix-dev', 'solenix.dev', 'solenix-dev'
from public.clients where contact_email = 'jager@solenix.dev';
