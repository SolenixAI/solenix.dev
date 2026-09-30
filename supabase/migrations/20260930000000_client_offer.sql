-- The offer a client starts from the portal: a one-off setup fee plus a
-- monthly hosting-and-care amount, both in cents. Stripe Checkout charges
-- exactly these; the subscription itself then lives in Stripe (read live).
alter table public.clients
  add column setup_cents   integer check (setup_cents >= 0),
  add column monthly_cents integer check (monthly_cents >= 0),
  add column plan_name     text;
