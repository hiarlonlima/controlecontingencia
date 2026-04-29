-- =============================================================
-- Schema do Controle de Contingência FB Ads
-- Execute este script uma vez no SQL Editor do seu projeto Supabase.
-- =============================================================

-- Habilita pgcrypto pra gen_random_uuid (caso queira mudar PK no futuro)
create extension if not exists "pgcrypto";

-- ============== TABELA fb_profiles ==============
create table if not exists public.fb_profiles (
  id text primary key,
  nome text not null default '',
  codigo_interno text not null default '',
  login text not null default '',
  senha text not null default '',
  two_fa text not null default '',
  fornecedor text not null default '',
  data_compra timestamptz,
  data_criacao_facebook timestamptz,
  status text not null default 'novo',
  nivel_confianca text not null default 'medio',
  pais text not null default 'Brasil',
  proxy text not null default '',
  telefone text not null default '',
  bm_vinculada text not null default '',
  conta_anuncio_vinculada text not null default '',
  observacoes text not null default '',
  tags jsonb not null default '[]'::jsonb,
  historico jsonb not null default '[]'::jsonb,
  notas jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists fb_profiles_status_idx on public.fb_profiles (status);
create index if not exists fb_profiles_updated_idx on public.fb_profiles (updated_at desc);
create index if not exists fb_profiles_fornecedor_idx on public.fb_profiles (fornecedor);

-- ============== TABELA fb_bms ==============
create table if not exists public.fb_bms (
  id text primary key,
  nome text not null default '',
  bm_id text not null default '',
  perfil_dono text not null default '',
  perfis_vinculados jsonb not null default '[]'::jsonb,
  contas_anuncio jsonb not null default '[]'::jsonb,
  metodo_pagamento boolean not null default false,
  limite_diario text not null default '',
  status text not null default 'nova',
  verificacao text not null default 'nao_verificada',
  pais text not null default 'Brasil',
  dominios jsonb not null default '[]'::jsonb,
  paginas jsonb not null default '[]'::jsonb,
  observacoes text not null default '',
  tags jsonb not null default '[]'::jsonb,
  historico jsonb not null default '[]'::jsonb,
  notas jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists fb_bms_status_idx on public.fb_bms (status);
create index if not exists fb_bms_updated_idx on public.fb_bms (updated_at desc);
create index if not exists fb_bms_dono_idx on public.fb_bms (perfil_dono);

-- ============== ROW LEVEL SECURITY ==============
-- Qualquer usuário autenticado pode CRUD em tudo (uso interno da equipe).
-- Se você quiser separar dados por usuário, adicione coluna owner uuid e
-- ajuste as policies para `using (owner = auth.uid())`.

alter table public.fb_profiles enable row level security;
alter table public.fb_bms enable row level security;

drop policy if exists "auth full access on profiles" on public.fb_profiles;
create policy "auth full access on profiles"
  on public.fb_profiles
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "auth full access on bms" on public.fb_bms;
create policy "auth full access on bms"
  on public.fb_bms
  for all
  to authenticated
  using (true)
  with check (true);

-- ============== TRIGGERS DE updated_at ==============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fb_profiles_updated on public.fb_profiles;
create trigger trg_fb_profiles_updated
  before update on public.fb_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_fb_bms_updated on public.fb_bms;
create trigger trg_fb_bms_updated
  before update on public.fb_bms
  for each row execute function public.set_updated_at();

-- ============== PRONTO ==============
-- Próximo passo: crie um usuário em
--   Authentication → Users → Add user
-- e use o e-mail/senha pra logar na app.
