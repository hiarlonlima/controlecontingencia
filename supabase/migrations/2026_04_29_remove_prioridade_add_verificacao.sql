-- =============================================================
-- Migration: remove prioridade (perfis e BMs) e adiciona verificacao (BMs)
--
-- Como aplicar:
--   1) Supabase Dashboard → SQL Editor → New query
--   2) Cole o conteúdo abaixo e clique Run
-- Idempotente: pode rodar mais de uma vez sem efeitos colaterais.
-- =============================================================

-- 1) Remove o campo prioridade
alter table public.fb_profiles drop column if exists prioridade;
alter table public.fb_bms drop column if exists prioridade;

-- 2) Adiciona estado de verificação Meta na BM
alter table public.fb_bms
  add column if not exists verificacao text not null default 'nao_verificada';

-- (opcional) Restringir a 3 valores conhecidos
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'fb_bms_verificacao_check'
  ) then
    alter table public.fb_bms
      add constraint fb_bms_verificacao_check
      check (verificacao in ('nao_verificada', 'em_analise', 'verificada'));
  end if;
end $$;

-- Pronto. A app já lê este campo e exibe o selo no card quando verificada.
