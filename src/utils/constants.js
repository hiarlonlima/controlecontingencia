// Status canônicos de Perfis
export const PROFILE_STATUSES = [
  { id: 'novo', label: 'Novo', tone: 'slate', description: 'Recém-cadastrado' },
  { id: 'aquecimento', label: 'Em aquecimento', tone: 'amber', description: 'Rodando aquecimento' },
  { id: 'pronto', label: 'Pronto para uso', tone: 'emerald', description: 'Disponível' },
  { id: 'em_uso', label: 'Em uso', tone: 'cyan', description: 'Operando campanha' },
  { id: 'restricao', label: 'Com restrição', tone: 'orange', description: 'Sob restrição' },
  { id: 'bloqueado', label: 'Bloqueado', tone: 'rose', description: 'Bloqueado' },
  { id: 'descartado', label: 'Descartado', tone: 'zinc', description: 'Descartado' },
]

// Status canônicos de BMs
export const BM_STATUSES = [
  { id: 'nova', label: 'Nova', tone: 'slate', description: 'Recém-criada' },
  { id: 'preparacao', label: 'Em preparação', tone: 'amber', description: 'Configuração em andamento' },
  { id: 'pronta', label: 'Pronta para subir', tone: 'emerald', description: 'Pronta para campanha' },
  { id: 'em_uso', label: 'Em uso', tone: 'cyan', description: 'Operando' },
  { id: 'restricao', label: 'Com restrição', tone: 'orange', description: 'Restrita' },
  { id: 'analise', label: 'Em análise', tone: 'sky', description: 'Em análise pelo Meta' },
  { id: 'bloqueada', label: 'Bloqueada', tone: 'rose', description: 'Bloqueada' },
  { id: 'perdida', label: 'Perdida/Descartada', tone: 'zinc', description: 'Perdida ou descartada' },
]

export const CONFIDENCE_LEVELS = [
  { id: 'baixo', label: 'Baixo', tone: 'rose' },
  { id: 'medio', label: 'Médio', tone: 'amber' },
  { id: 'alto', label: 'Alto', tone: 'emerald' },
]

// Nacionalidade do perfil/BM (mostrado com bandeira no card)
export const NACIONALIDADES = [
  { id: 'br', label: 'Brasileiro', emoji: '🇧🇷', tone: 'emerald' },
  { id: 'us', label: 'Americano', emoji: '🇺🇸', tone: 'sky' },
]

// Moeda da conta de anúncio
export const MOEDAS = [
  { id: 'brl', label: 'BRL', emoji: '🇧🇷', tone: 'emerald' },
  { id: 'usd', label: 'USD', emoji: '🇺🇸', tone: 'sky' },
]

// Estado de verificação Meta da BM (selo/em análise/não verificada)
export const BM_VERIFICACOES = [
  { id: 'nao_verificada', label: 'Não verificada', tone: 'slate' },
  { id: 'em_analise', label: 'Em análise', tone: 'amber' },
  { id: 'verificada', label: 'Verificada', tone: 'cyan' },
]

// Status individual de cada conta de anúncio dentro de uma BM
export const AD_ACCOUNT_STATUSES = [
  { id: 'preparacao', label: 'Em preparação', tone: 'amber' },
  { id: 'boa', label: 'Boa', tone: 'emerald' },
  { id: 'mediana', label: 'Mediana', tone: 'sky' },
  { id: 'ruim', label: 'Ruim', tone: 'orange' },
  { id: 'bloqueada', label: 'Bloqueada', tone: 'rose' },
]

// Tiers de conta de anúncio (escala de qualidade / spend)
export const AD_ACCOUNT_TIERS = [
  { id: 't1', label: 'T1', tone: 'emerald' },
  { id: 't2', label: 'T2', tone: 'cyan' },
  { id: 't3', label: 'T3', tone: 'amber' },
  { id: 't4', label: 'T4', tone: 'rose' },
  { id: 'low', label: 'Low Spend', tone: 'slate' },
]

// Mapas auxiliares
export const PROFILE_STATUS_MAP = Object.fromEntries(
  PROFILE_STATUSES.map((s) => [s.id, s]),
)
export const BM_STATUS_MAP = Object.fromEntries(BM_STATUSES.map((s) => [s.id, s]))
export const CONFIDENCE_MAP = Object.fromEntries(
  CONFIDENCE_LEVELS.map((s) => [s.id, s]),
)
export const BM_VERIFICACAO_MAP = Object.fromEntries(
  BM_VERIFICACOES.map((v) => [v.id, v]),
)
export const AD_ACCOUNT_STATUS_MAP = Object.fromEntries(
  AD_ACCOUNT_STATUSES.map((s) => [s.id, s]),
)
export const AD_ACCOUNT_TIER_MAP = Object.fromEntries(
  AD_ACCOUNT_TIERS.map((t) => [t.id, t]),
)
export const NACIONALIDADE_MAP = Object.fromEntries(
  NACIONALIDADES.map((n) => [n.id, n]),
)
export const MOEDA_MAP = Object.fromEntries(MOEDAS.map((m) => [m.id, m]))

// Status considerados "disponível para uso" / "perdido"
export const PROFILE_AVAILABLE = ['pronto']
export const PROFILE_LOST = ['bloqueado', 'descartado']
export const PROFILE_HEATING = ['aquecimento']
export const PROFILE_ACTIVE = ['em_uso']

export const BM_AVAILABLE = ['pronta']
export const BM_LOST = ['bloqueada', 'perdida']
export const BM_REVIEW = ['analise']
export const BM_ACTIVE = ['em_uso']

// Mapeamento tone → classes Tailwind (estaticamente referenciadas para o JIT pegar)
export const TONE_STYLES = {
  slate: {
    text: 'text-slate-300',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
  },
  amber: {
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  emerald: {
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  cyan: {
    text: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  orange: {
    text: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    dot: 'bg-orange-400',
  },
  rose: {
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
  },
  zinc: {
    text: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    dot: 'bg-zinc-400',
  },
  sky: {
    text: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    dot: 'bg-sky-400',
  },
  violet: {
    text: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    dot: 'bg-violet-400',
  },
  fuchsia: {
    text: 'text-fuchsia-300',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
    dot: 'bg-fuchsia-400',
  },
}

// Tags coloridas pré-definidas (paleta circular)
export const TAG_TONES = ['cyan', 'emerald', 'amber', 'rose', 'violet', 'sky', 'fuchsia', 'orange']

export const STORAGE_KEYS = {
  AUTH: 'cfb:auth',
  PROFILES: 'cfb:profiles',
  BMS: 'cfb:bms',
  SETTINGS: 'cfb:settings',
  SEEDED: 'cfb:seeded',
}

export const DEFAULT_SETTINGS = {
  adminPassword: 'admin123',
  alertDaysIdle: 7,
  compactMode: false,
}
