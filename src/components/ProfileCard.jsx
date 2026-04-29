import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Clock4,
  Hash,
  ShieldCheck,
  Users,
} from 'lucide-react'
import {
  CONFIDENCE_MAP,
  NACIONALIDADE_MAP,
  PROFILE_STATUS_MAP,
  TAG_TONES,
  TONE_STYLES,
} from '../utils/constants.js'
import { daysBetween, formatDate, tagTone } from '../utils/format.js'
import StatusBadge from './StatusBadge.jsx'

export default function ProfileCard({
  profile,
  bms,
  compact = false,
  alertDaysIdle = 7,
  isDragging = false,
  onClick,
}) {
  const status = PROFILE_STATUS_MAP[profile.status] ?? PROFILE_STATUS_MAP.novo
  const confidence = CONFIDENCE_MAP[profile.nivelConfianca] ?? CONFIDENCE_MAP.medio
  const nacionalidade = NACIONALIDADE_MAP[profile.nacionalidade] ?? NACIONALIDADE_MAP.br
  const linkedBM = bms?.find((b) => b.id === profile.bmVinculada)
  const idleDays = daysBetween(profile.updatedAt)
  const showAlert =
    idleDays >= alertDaysIdle &&
    !['bloqueado', 'descartado'].includes(profile.status)

  return (
    <div
      onClick={onClick}
      className={`kanban-card group ${compact ? 'p-2.5' : ''} ${
        isDragging ? 'border-neon-400/60 shadow-glow' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-50">{profile.nome || '—'}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
            <Hash size={10} />
            {profile.codigoInterno || '—'}
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

      {!compact && profile.observacoes && (
        <p className="mt-2 line-clamp-2 text-[12px] text-slate-400">{profile.observacoes}</p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <StatusBadge tone={status.tone} label={status.label} />
        <StatusBadge tone={confidence.tone} label={`Conf. ${confidence.label}`} />
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
      </div>

      {!compact && (
        <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck size={11} />
            {profile.fornecedor || '—'}
          </span>
          <span className="flex items-center gap-1 justify-self-end">
            <CalendarDays size={11} />
            {formatDate(profile.dataCompra)}
          </span>
          <span className="flex items-center gap-1">
            <Building2 size={11} />
            {linkedBM ? linkedBM.nome : 'Sem BM'}
          </span>
          <span className="flex items-center gap-1 justify-self-end">
            <Users size={11} />
            {profile.contaAnuncioVinculada || 'Sem AD'}
          </span>
        </div>
      )}

      {!!profile.tags?.length && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {profile.tags.slice(0, 4).map((t) => {
            const tone = TONE_STYLES[tagTone(t, TAG_TONES)]
            return (
              <span key={t} className={`chip ${tone.bg} ${tone.border} ${tone.text}`}>
                {t}
              </span>
            )
          })}
          {profile.tags.length > 4 && (
            <span className="chip border-ink-700 bg-ink-800 text-slate-400">
              +{profile.tags.length - 4}
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
