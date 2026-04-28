# Controle de Contingência · Facebook Ads

Sistema interno (MVP) para gestão visual de ativos de contingência usados em
operações de Facebook Ads — Perfis, BMs, vínculos, status, aquecimento,
bloqueios e histórico de movimentações. Tudo organizado em Kanban,
com dashboards operacionais, relatórios e tela de login.

> Funciona em **dois modos**:
> - **Local** (sem configuração) — usa `localStorage` do navegador, isolado por dispositivo.
> - **Supabase** (recomendado pra uso real) — Postgres em nuvem, sync entre dispositivos, login real e backup automático.

---

## Stack

- **React 18 + Vite 5** — base rápida e moderna
- **TailwindCSS 3** — estilização utilitária com tema dark customizado
- **@hello-pangea/dnd** — drag-and-drop entre colunas dos Kanbans
- **react-router-dom 6** — roteamento e proteção de rotas
- **lucide-react** — ícones
- **@supabase/supabase-js** — backend (opcional)

---

## Como rodar localmente

Pré-requisitos: **Node 18+** e **npm** (ou pnpm / yarn / bun).

```bash
# 1. Instalar dependências
npm install

# 2. (opcional) Configurar Supabase — veja seção abaixo
cp .env.example .env
# edite .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Subir o servidor de desenvolvimento
npm run dev

# 4. Build de produção (gera /dist)
npm run build
npm run preview   # opcional: serve o build localmente
```

Por padrão a app sobe em `http://localhost:5173`.

### Acesso

- **Modo local** (sem `.env`): senha de teste `admin123`, alterada em Configurações.
- **Modo Supabase** (com `.env` configurado): tela de login pede e-mail e senha
  cadastrados no painel do Supabase. Botão "Criar conta nova" também disponível.

---

## Configurando o Supabase (recomendado)

Free tier do Supabase é mais que suficiente pra esta app (500MB DB, ilimitadas leituras).

### 1) Criar projeto

1. Vá em [supabase.com](https://supabase.com) → **New project**
2. Escolha região mais próxima (ex.: `South America (São Paulo)`)
3. Defina uma senha do banco (anote em local seguro)
4. Aguarde ~1 minuto para provisionar

### 2) Executar o schema

1. No menu lateral: **SQL Editor** → **New query**
2. Cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql)
3. Clique **Run**. Vai criar duas tabelas (`fb_profiles`, `fb_bms`), índices,
   triggers de `updated_at` e políticas de RLS.

### 3) Pegar credenciais

1. **Project Settings** → **API**
2. Copie:
   - **Project URL** → variável `VITE_SUPABASE_URL`
   - **anon public** → variável `VITE_SUPABASE_ANON_KEY`

> Nunca use a chave `service_role` no cliente — ela bypassa o RLS.

### 4) Setar variáveis de ambiente

**Local:**
```bash
cp .env.example .env
# edite .env com os valores do passo anterior
```

**Vercel/Netlify:**
- Vercel: Project → Settings → Environment Variables → adicione as duas
- Netlify: Site → Site settings → Environment variables → adicione as duas
- Re-deploy depois de adicionar.

### 5) Criar primeiro usuário

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. Defina e-mail e senha (autoconfirme se quiser pular validação por e-mail)
3. Pronto — agora faça login na app com essas credenciais.

Para adicionar operadores, repita o passo 5 ou habilite signup público (não
recomendado — desabilite em **Authentication → Sign In / Up → Allow new users to sign up**
se for uso só interno).

### Migrar dados do localStorage para o Supabase

Se você já está usando em modo local e quer levar os dados:

1. Em **Configurações** → exporte CSV de Perfis e BMs.
2. Configure Supabase, faça login.
3. Importe os mesmos CSVs nos Kanbans.

> Observação: o CSV de BMs preserva contas de anúncio (formato JSON na coluna).

---

## Estrutura de pastas

```
src/
├── components/        → componentes reutilizáveis (Modal, KanbanBoard, Cards…)
├── context/           → AuthContext, DataContext, ToastContext
├── lib/               → cliente Supabase, mappers DB↔JS, repositories
├── pages/             → uma página por rota (Dashboard, Kanbans, Cadastros, Relatórios, Configurações, Login)
├── utils/             → constantes, storage helpers, formatadores, CSV, mock data
├── App.jsx            → rotas
├── main.jsx           → bootstrap React
└── index.css          → estilos base + camada de componentes Tailwind

supabase/
└── schema.sql         → DDL para criar tabelas, RLS e triggers no Supabase
```

---

## Funcionalidades incluídas

- **Dashboard operacional** com 12 indicadores, alertas, últimos perfis/BMs
- **Kanban de Perfis** com 7 colunas, drag-and-drop, busca, filtros e modo compacto
- **Kanban de BMs** com 8 colunas, drag-and-drop, busca, filtros e modo compacto
- **Cadastro rápido** de Perfil e BM com validação dos campos obrigatórios
- **Editor estruturado de contas de anúncio** — nome, ID, status (boa/mediana/ruim/preparação/bloqueada), tier (T1–T4/Low) e observação por conta
- **Modal de detalhes** com abas (Detalhes, Acesso & Segurança / Vínculos, Histórico & Notas)
- **Histórico automático** de criação, mudanças de status, edições e notas
- **Anotações rápidas** por ativo
- **Senhas e 2FA ocultos** por padrão, com toggle de visualização e cópia
- **Tags coloridas** com paleta circular determinística por hash
- **Importação e exportação CSV** dos dois Kanbans
- **Relatórios filtráveis** por data, status, tipo e fornecedor
- **Configurações** (senha, dias para alertar, modo compacto, restaurar mock, limpar storage)
- **Tela de login** protegendo todas as rotas privadas
- **Alertas de inatividade** — cards e dashboard destacam ativos parados há X dias
- **Idade do ativo** visível em cada card
- **Modo dual** Supabase ↔ localStorage com fallback automático

---

## Modelos de dados

### Perfil
```ts
{
  id, nome, codigoInterno, login, senha, twoFA,
  fornecedor, dataCompra, dataCriacaoFacebook,
  status, nivelConfianca, prioridade,
  pais, proxy, telefone,
  bmVinculada, contaAnuncioVinculada,
  observacoes, tags,
  historico, notas,
  createdAt, updatedAt
}
```

### BM
```ts
{
  id, nome, bmId,
  perfilDono, perfisVinculados,
  contasAnuncio: [
    { nome, id, status, tier, observacao }
  ],
  metodoPagamento, limiteDiario,
  status, prioridade, pais,
  dominios, paginas,
  observacoes, tags,
  historico, notas,
  createdAt, updatedAt
}
```

---

## Modos de persistência

| Aspecto                    | Modo local (`localStorage`) | Modo Supabase           |
| -------------------------- | --------------------------- | ----------------------- |
| Configuração necessária    | Nenhuma                     | `.env` + executar SQL   |
| Sync entre dispositivos    | ❌ Não                       | ✅ Sim                   |
| Multi-usuário              | ❌ Não                       | ✅ Sim (RLS + Auth)      |
| Backup automático          | ❌ Não                       | ✅ Sim (Supabase backup) |
| Custo                      | Grátis                      | Grátis (free tier)      |
| Funciona offline           | ✅ Sim                       | ⚠️ Apenas leitura cache |

A app detecta automaticamente: se as duas variáveis `VITE_SUPABASE_*` estiverem
definidas no build, usa Supabase; senão, cai pra `localStorage`.

---

## Deploy (estático)

Como é uma SPA Vite, basta hospedar a pasta `dist/`. Já incluí configs prontos:

- **Vercel** — `vercel.json` na raiz. Em [vercel.com](https://vercel.com) clique em
  "Import Project", escolha o repositório, **adicione as duas vars `VITE_SUPABASE_*`**
  em Environment Variables e dê deploy. Detecta Vite automaticamente.
- **Netlify** — `netlify.toml` na raiz. Mesma ideia em
  [netlify.com](https://netlify.com), também adicionando as env vars.
- **Cloudflare Pages**, **GitHub Pages**, **Render Static** — funcionam igual,
  só configure: build = `npm run build`, output = `dist`, com rewrite
  de `/*` → `/index.html` para SPA routing.

> Sem env vars: deploy funciona, mas em modo local (cada visitante tem seus próprios dados).

---

## Atalhos & UX

- Drag-and-drop entre colunas dispara mudança de status com entrada no histórico.
- Clique em qualquer card para abrir o modal de detalhes.
- Tecla `Esc` fecha o modal.
- Vírgula ou Enter cria uma tag em qualquer campo de tags.
- Senhas têm botão de cópia + visualização.
- "Restaurar mock" em Configurações repõe os 10 perfis + 8 BMs de exemplo
  (funciona em ambos os modos — escreve direto no banco no modo Supabase).

---

## Próximos passos sugeridos

- Realtime Supabase para ver mudanças de outros operadores ao vivo.
- Auditoria por usuário (`autor` no histórico já existe — basta usar `auth.user.email`).
- Webhook/Email para alertas críticos (perfis bloqueados).
- Histórico filtrável dentro de cada modal (por tipo, autor).
- Versão mobile do Kanban (atualmente o foco é desktop).

---

Feito com foco em operação real de tráfego pago.
