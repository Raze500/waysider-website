-- Waysider map · esquema de puntos de interés para Supabase
-- Ejecutar en: Supabase → SQL Editor → New query → Run
--
-- Regla de oro: lectura pública, escritura solo para usuarios autenticados.
-- La "anon key" del frontend puede ser pública: sin sesión válida no escribe.

create table if not exists public.pois (
  id          text primary key,
  name        text not null check (char_length(name) between 1 and 80),
  cat         text not null default 'poi'
              check (cat in ('boss', 'miniboss', 'portal', 'chests', 'poi')),
  x           numeric not null,
  y           numeric not null,
  "desc"      text default '',
  updated_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.pois enable row level security;

-- cualquiera puede leer el mapa
drop policy if exists "pois public read" on public.pois;
create policy "pois public read"
  on public.pois for select
  using (true);

-- solo usuarios con sesión pueden escribir
drop policy if exists "pois team insert" on public.pois;
create policy "pois team insert"
  on public.pois for insert to authenticated
  with check (true);

drop policy if exists "pois team update" on public.pois;
create policy "pois team update"
  on public.pois for update to authenticated
  using (true) with check (true);

drop policy if exists "pois team delete" on public.pois;
create policy "pois team delete"
  on public.pois for delete to authenticated
  using (true);

-- mantener updated_at al día
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists pois_touch on public.pois;
create trigger pois_touch
  before update on public.pois
  for each row execute function public.touch_updated_at();
