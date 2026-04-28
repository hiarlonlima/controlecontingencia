# Controle de Contingência · Facebook Ads

Sistema interno (MVP) para gestão visual de ativos de contingência usados em
operações de Facebook Ads — Perfis, BMs, vínculos, status, aquecimento,
bloqueios e histórico de movimentações. Tudo organizado em Kanban,
com dashboards operacionais, relatórios e tela de login.

> Persistência local via `localStorage`. A camada de dados foi desenhada como um
> contexto isolado (`DataContext`) para facilitar a troca por Supabase, SQLite,
> Postgres ou qualquer backend real sem alterar componentes/UI.

---

## Stack

- **React 18 + Vite 5** — base rápida e moderna
- **TailwindCSS 3** — estilização utilitária com tema dark customizado
- **@hello-pangea/dnd** — drag-and-drop entre colunas dos Kanbans
- **react-router-dom 6** — roteamento e proteção de rotas
- **lucide-react** — ícones

---

## Como rodar localmente

Pré-requisitos: **Node 18+** e **npm** (ou pnpm / yarn / bun).

```bash
# 1. Instalar dependências
npm install

# 2. Subir o servidor de desenvolvimento
npm run dev

# 3. Build de produção (gera /dist)
npm run build
npm run preview   # opcional: serve o build localmente
```

Por padrão a app sobe em `http://localhost:5173`.

### Acesso

A primeira tela é o **Login**. Use a senha de teste:

```
admin123
```

Ela pode ser alterada na tela **Configurações** (também guardada em `localStorage`).

Se for a primeira execução, dados mockados (10 perfis e 8 BMs com diferentes
status) são plantados automaticamente para você ver o sistema em operação.

---

## Estrutura de pastas

```
src/
├── components/        → componentes reutilizáveis (Modal, KanbanBoard, Cards…)
├── context/           → AuthContext, DataContext, ToastContext
├── pages/             → uma página por rota (Dashboard, Kanbans, Cadastros, Relatórios, Configurações, Login)
├── utils/             → constantes, storage helpers, formatadores, CSV, mock data
├── App.jsx            → rotas
├── main.jsx           → bootstrap React
└── index.css          → estilos base + camada de componentes Tailwind
```

---

## Funcionalidades incluídas

- **Dashboard operacional** com 12 indicadores, alertas, últimos perfis/BMs
- **Kanban de Perfis** com 7 colunas, drag-and-drop, busca, filtros e modo compacto
- **Kanban de BMs** com 8 colunas, drag-and-drop, busca, filtros e modo compacto
- **Cadastro rápido** de Perfil e BM com validação dos campos obrigatórios
- **Modal de detalhes** com 3 abas (Detalhes, Acesso & Segurança / Vínculos, Histórico & Notas)
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
  perfilDono, perfisVinculados, contasAnuncio,
  metodoPagamento, limiteDiario,
  status, prioridade, pais,
  dominios, paginas,
  observacoes, tags,
  historico, notas,
  createdAt, updatedAt
}
```

---

## Persistência: como funciona hoje

A app usa **`localStorage` do navegador**. Isso significa:

- ✅ Suas alterações **ficam salvas** automaticamente no mesmo navegador.
- ✅ Não precisa de banco de dados nem servidor pra rodar — basta hospedar como
  site estático.
- ⚠️ Os dados ficam **isolados por navegador/dispositivo**. Se você abrir em outro
  computador ou apagar o cache, começa do zero.
- ⚠️ Não há backup automático — recomendo usar o **Exportar CSV** dos Kanbans
  periodicamente.

Para uso multi-dispositivo ou em equipe, conecte um backend real (próxima seção).

## Deploy (estático)

Como é uma SPA Vite, basta hospedar a pasta `dist/`. Já incluí configs prontos:

- **Vercel** — `vercel.json` na raiz. Em [vercel.com](https://vercel.com) clique em
  "Import Project", escolha este repositório e dê deploy. Detecta Vite
  automaticamente.
- **Netlify** — `netlify.toml` na raiz. Mesma ideia em
  [netlify.com](https://netlify.com).
- **Cloudflare Pages**, **GitHub Pages**, **Render Static** — funcionam igual,
  só configure: build = `npm run build`, output = `dist`, e adicione um rewrite
  de `/*` → `/index.html` (já incluído nos arquivos acima para SPA routing).

Nenhuma variável de ambiente é necessária no MVP.

## Trocando o storage por um backend real

Toda a leitura/escrita de dados está concentrada em
[`src/context/DataContext.jsx`](src/context/DataContext.jsx) e nos helpers de
[`src/utils/storage.js`](src/utils/storage.js).

Para conectar Supabase/Postgres/SQLite:

1. Substitua `loadJSON` / `saveJSON` por chamadas ao seu cliente.
2. Em `DataProvider`, troque os `useEffect` que carregam/persistem por `useEffect`
   que chamam o backend.
3. Os componentes (Cards, Modais, Páginas) **não** precisam mudar — todos
   consomem o estado e as actions via `useData()`.

---

## Atalhos & UX

- Drag-and-drop entre colunas dispara mudança de status com entrada no histórico.
- Clique em qualquer card para abrir o modal de detalhes.
- Tecla `Esc` fecha o modal.
- Vírgula ou Enter cria uma tag em qualquer campo de tags.
- Senhas têm botão de cópia + visualização.

---

## Próximos passos sugeridos

- Conectar com Supabase para sincronização real entre máquinas/usuários.
- Adicionar autenticação por usuário (multi-operador) com auditoria.
- Webhook/Email para alertas críticos.
- Histórico filtrável dentro de cada modal (por tipo, autor).
- Versão mobile do Kanban (atualmente o foco é desktop).

---

Feito com foco em operação real de tráfego pago.
