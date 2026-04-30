import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Clock4,
  CreditCard,
  Globe2,
  Hash,
  Users,
  Wallet,
} from 'lucide-react'
import {
  AD_ACCOUNT_QUALITIES,
  BM_STATUS_MAP,
  NACIONALIDADE_MAP,
  TAG_TONES,
  TONE_STYLES,
} from '../utils/constants.js'
import {
  daysBetween,
  formatDate,
  formatTotalsByCurrency,
  sumGastoByCurrency,
  tagTone,
} from '../utils/format.js'
import { countAdAccountsBy } from './AdAccountsEditor.jsx'
import StatusBadge from './StatusBadge.jsx'

export default function BMCard({
  bm,
  profiles,
  compact = false,
  alertDaysIdle = 7,
  isDragging = false,
  onClick,
}) {
  const status = BM_STATUS_MAP[bm.status] ?? BM_STATUS_MAP.nova
  const dono = profiles?.find((p) => p.id === bm.perfilDono)
  const idleDays = daysBetween(bm.updatedAt)
  const showAlert =
    idleDays >= alertDaysIdle && !['bloqueada', 'perdida'].includes(bm.status)
  const adCounts = countAdAccountsBy(bm.contasAnuncio, 'qualidade')
  const adTotal = bm.contasAnuncio?.length || 0
  const activeQualities = AD_ACCOUNT_QUALITIES.filter((q) => adCounts[q.id])
  const totalsGasto = sumGastoByCurrency(bm.contasAnuncio)
  const totalGastoLabel = formatTotalsByCurrency(totalsGasto)
  const hasGasto = !!totalGastoLabel
  const verificacao = bm.verificacao || 'nao_verificada'
  const isVerified = verificacao === 'verificada'
  const isAnalyzing = verificacao === 'em_analise'
  const nacionalidade = NACIONALIDADE_MAP[bm.nacionalidade] ?? NACIONALIDADE_MAP.br

  return (
    <div
      onClick={onClick}
      className={`kanban-card group ${compact ? 'p-2.5' : ''} ${
        isDragging ? 'border-neon-400/60 shadow-glow' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-50">
            <span className="min-w-0 flex-shrink truncate">{bm.nome || '—'}</span>
            {isVerified && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-md bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 ring-1 ring-cyan-500/30"
                title="BM verificada pelo Meta"
                aria-label="Verificada"
              >
                <BadgeCheck size={11} strokeWidth={2.5} />
                Verificada
              </span>
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate font-mono text-[11px] text-slate-500">
            <Hash size={10} />
            {bm.bmId || '—'}
          </p>
        </div>
        {showAlert && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30"
            title={`Sem movimentação há ${idleDays}d`}
          >
            <AlertTriangle size={11} />
          </span>
        )}
      </div>

      {!compact && bm.observacoes && (
        <p className="mt-2 line-clamp-2 text-[12px] text-slate-400">{bm.observacoes}</p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <StatusBadge tone={status.tone} label={status.label} />
        <StatusBadge
          tone={nacionalidade.tone}
          dot={false}
          label={
            <span className="inline-flex items-center gap-1">
              <span className="text-[12px] leading-none">{nacionalidade.emoji}</span>
              {nacionalidade.label}
            </span>
          }
        />
        {isAnalyzing && <StatusBadge tone="amber" label="Verif. em análise" />}
        {bm.metodoPagamento ? (
          <StatusBadge tone="emerald" label="Pagto OK" />
        ) : (
          <StatusBadge tone="zinc" label="Sem pagto" />
        )}
        {bm.limiteDiario && <StatusBadge tone="cyan" label={bm.limiteDiario} />}
      </div>

      {hasGasto && (
        <div className="mt-2.5 flex items-center justify-between rounded-lg border border-neon-500/25 bg-neon-500/10 px-3 py-1.5">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neon-300">
            <Wallet size={11} />
            Total gasto
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-neon-200">
            {totalGastoLabel}
          </span>
        </div>
      )}

      {!compact && (
        <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 truncate">
            <Users size={11} />
            {dono ? dono.nome : 'Sem dono'}
          </span>
          <span
            className="flex items-center gap-1.5 justify-self-end"
            title={
              activeQualities.length
                ? activeQualities
                    .map((s) => `${adCounts[s.id]} ${s.label.toLowerCase()}`)
                    .join(' · ')
                : 'Sem contas vinculadas'
            }
          >
            <CreditCard size={11} />
            <span>{adTotal} ADs</span>
            {activeQualities.length > 0 && (
              <span className="ml-0.5 inline-flex items-center gap-0.5">
                {activeQualities.map((s) => {
                  const tone = TONE_STYLES[s.tone]
                  return (
                    <span
                      key={s.id}
                      className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                    />
                  )
                })}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 truncate">
            <Globe2 size={11} />
            {bm.dominios?.[0] || 'sem domínio'}
          </span>
          <span className="flex items-center gap-1 justify-self-end">
            <CalendarDays size={11} />
            {formatDate(bm.createdAt)}
          </span>
        </div>
      )}

      {!compact && adTotal > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {activeQualities.map((s) => {
            const tone = TONE_STYLES[s.tone]
            return (
              <span
                key={s.id}
                className={`chip ${tone.bg} ${tone.border} ${tone.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {adCounts[s.id]} {s.label.toLowerCase()}
              </span>
            )
          })}
        </div>
      )}

      {!!bm.tags?.length && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {bm.tags.slice(0, 4).map((t) => {
            const tone = TONE_STYLES[tagTone(t, TAG_TONES)]
            return (
              <span key={t} className={`chip ${tone.bg} ${tone.border} ${tone.text}`}>
                {t}
              </span>
            )
          })}
          {bm.tags.length > 4 && (
            <span className="chip border-ink-700 bg-ink-800 text-slate-400">
              +{bm.tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock4 size={10} />
          {idleDays === 0 ? 'hoje' : `${idleDays}d sem mover`}
        </span>
        <span className="opacity-0 transition group-hover:opacity-100">abrir →</span>
      </div>
    </div>
  )
}
