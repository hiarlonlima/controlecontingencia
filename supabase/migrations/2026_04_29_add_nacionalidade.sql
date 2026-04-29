-- =============================================================
-- Migration: adiciona campo nacionalidade em fb_profiles e fb_bms
-- (a moeda das contas de anúncio fica dentro do JSONB contas_anuncio,
--  então não precisa de DDL — o frontend popula com default 'brl')
--
-- Como aplicar:
--   1) Supabase Dashboard → SQL Editor → New query
--   2) Cole o conteúdo abaixo e clique Run
-- Idempotente: pode rodar mais de uma vez sem efeitos colaterais.
-- =============================================================

alter table public.fb_profiles
  add column if not exists nacionalidade text not null default 'br';

alter table public.fb_bms
  add column if not exists nacionalidade text not null default 'br';

-- Restringe a valores conhecidos
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'fb_profiles_nacionalidade_check'
  ) then
    alter table public.fb_profiles
      add constraint fb_profiles_nacionalidade_check
      check (nacionalidade in ('br', 'us'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'fb_bms_nacionalidade_check'
  ) then
    alter table public.fb_bms
      add constraint fb_bms_nacionalidade_check
      check (nacionalidade in ('br', 'us'));
  end if;
end $$;
