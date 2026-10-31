-- Añadir la categoría "Mini boss" a la tabla existente.
-- Ejecutar en Supabase → SQL Editor → Run (una sola vez).

alter table public.pois drop constraint if exists pois_cat_check;

alter table public.pois
  add constraint pois_cat_check
  check (cat in ('boss', 'miniboss', 'portal', 'chests', 'poi'));
