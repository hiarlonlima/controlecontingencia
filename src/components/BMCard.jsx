import {
  AlertTriangle,
  CalendarDays,
  Clock4,
  CreditCard,
  Globe2,
  Hash,
  Users,
} from 'lucide-react'
import {
  AD_ACCOUNT_STATUSES,
  BM_STATUS_MAP,
  TAG_TONES,
  TONE_STYLES,
} from '../utils/constants.js'
import { daysBetween, formatDate, tagTone } from '../utils/format.js'
import { countAdAccountsByStatus } from './AdAccountsEditor.jsx'
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
  const adCounts = countAdAccountsByStatus(bm.contasAnuncio)
  const adTotal = bm.contasAnuncio?.length || 0
  const activeStatuses = AD_ACCOUNT_STATUSES.filter((s) => adCounts[s.id])

  return (
    <div
      onClick={onClick}
      className={`kanban-card group ${compact ? 'p-2.5' : ''} ${
        isDragging ? 'border-neon-400/60 shadow-glow' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-50">{bm.nome || '—'}</p>
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
        {bm.metodoPagamento ? (
          <StatusBadge tone="emerald" label="Pagto OK" />
        ) : (
          <StatusBadge tone="zinc" label="Sem pagto" />
        )}
        {bm.limiteDiario && <StatusBadge tone="cyan" label={bm.limiteDiario} />}
      </div>

      {!compact && (
        <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 truncate">
            <Users size={11} />
            {dono ? dono.nome : 'Sem dono'}
          </span>
          <span
            className="flex items-center gap-1.5 justify-self-end"
            title={
              activeStatuses.length
                ? activeStatuses
                    .map((s) => `${adCounts[s.id]} ${s.label.toLowerCase()}`)
                    .join(' · ')
                : 'Sem contas vinculadas'
            }
          >
            <CreditCard size={11} />
            <span>{adTotal} ADs</span>
            {activeStatuses.length > 0 && (
              <span className="ml-0.5 inline-flex items-center gap-0.5">
                {activeStatuses.map((s) => {
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
          {activeStatuses.map((s) => {
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
