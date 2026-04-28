import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Building2,
  CircleSlash,
  CreditCard,
  Flame,
  Layers,
  RotateCw,
  ShieldCheck,
  TrendingDown,
  Users,
  Wallet,
} from 'lucide-react'
import {
  BM_ACTIVE,
  BM_AVAILABLE,
  BM_LOST,
  BM_REVIEW,
  PROFILE_ACTIVE,
  PROFILE_AVAILABLE,
  PROFILE_HEATING,
  PROFILE_LOST,
  PROFILE_STATUS_MAP,
  BM_STATUS_MAP,
} from '../utils/constants.js'
import { daysBetween, formatDate, pct, relativeTime } from '../utils/format.js'
import { useData } from '../context/DataContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ProfileModal from '../components/ProfileModal.jsx'
import BMModal from '../components/BMModal.jsx'
import { getSettings } from '../utils/storage.js'

function pickAlerts(profiles, bms, alertDaysIdle) {
  const alerts = []
  profiles.forEach((p) => {
    if (PROFILE_LOST.includes(p.status)) {
      alerts.push({
        id: `p-${p.id}`,
        type: 'profile',
        tone: 'rose',
        title: `Perfil bloqueado/descartado: ${p.nome}`,
        meta: `${PROFILE_STATUS_MAP[p.status]?.label} · ${relativeTime(p.updatedAt)}`,
        item: p,
      })
    } else if (daysBetween(p.updatedAt) >= alertDaysIdle) {
      alerts.push({
        id: `pi-${p.id}`,
        type: 'profile',
        tone: 'amber',
        title: `Perfil parado: ${p.nome}`,
        meta: `Sem mover há ${daysBetween(p.updatedAt)}d em "${PROFILE_STATUS_MAP[p.status]?.label}"`,
        item: p,
      })
    }
  })
  bms.forEach((b) => {
    if (BM_LOST.includes(b.status)) {
      alerts.push({
        id: `b-${b.id}`,
        type: 'bm',
        tone: 'rose',
        title: `BM ${BM_STATUS_MAP[b.status]?.label}: ${b.nome}`,
        meta: relativeTime(b.updatedAt),
        item: b,
      })
    } else if (b.status === 'restricao') {
      alerts.push({
        id: `br-${b.id}`,
        type: 'bm',
        tone: 'orange',
        title: `BM com restrição: ${b.nome}`,
        meta: relativeTime(b.updatedAt),
        item: b,
      })
    } else if (daysBetween(b.updatedAt) >= alertDaysIdle) {
      alerts.push({
        id: `bi-${b.id}`,
        type: 'bm',
        tone: 'amber',
        title: `BM parada: ${b.nome}`,
        meta: `Sem mover há ${daysBetween(b.updatedAt)}d`,
        item: b,
      })
    }
  })
  return alerts
    .sort((a, b) => (a.tone === 'rose' ? -1 : 0) - (b.tone === 'rose' ? -1 : 0))
    .slice(0, 8)
}

export default function Dashboard() {
  const { profiles, bms, resetData } = useData()
  const [profileModal, setProfileModal] = useState(null)
  const [bmModal, setBMModal] = useState(null)
  const settings = getSettings()

  const stats = useMemo(() => {
    const totalProfiles = profiles.length
    const profilesAtivos = profiles.filter((p) => PROFILE_ACTIVE.includes(p.status)).length
    const profilesAquecimento = profiles.filter((p) => PROFILE_HEATING.includes(p.status)).length
    const profilesProntos = profiles.filter((p) => PROFILE_AVAILABLE.includes(p.status)).length
    const profilesBloqueados = profiles.filter((p) => PROFILE_LOST.includes(p.status)).length

    const totalBMs = bms.length
    const bmsAtivas = bms.filter((b) => BM_ACTIVE.includes(b.status)).length
    const bmsAnalise = bms.filter((b) => BM_REVIEW.includes(b.status)).length
    const bmsBloqueadas = bms.filter((b) => BM_LOST.includes(b.status)).length
    const bmsProntas = bms.filter((b) => BM_AVAILABLE.includes(b.status)).length

    const disponiveis = profilesProntos + bmsProntas
    const perdidos = profilesBloqueados + bmsBloqueadas

    const taxaPerdaPerfis = pct(profilesBloqueados, totalProfiles || 1)
    const taxaPerdaBMs = pct(bmsBloqueadas, totalBMs || 1)

    return {
      totalProfiles,
      profilesAtivos,
      profilesAquecimento,
      profilesProntos,
      profilesBloqueados,
      totalBMs,
      bmsAtivas,
      bmsAnalise,
      bmsBloqueadas,
      bmsProntas,
      disponiveis,
      perdidos,
      taxaPerdaPerfis,
      taxaPerdaBMs,
    }
  }, [profiles, bms])

  const alerts = useMemo(
    () => pickAlerts(profiles, bms, settings.alertDaysIdle),
    [profiles, bms, settings.alertDaysIdle],
  )

  const recentProfiles = useMemo(
    () =>
      [...profiles]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 6),
    [profiles],
  )

  const recentBMs = useMemo(
    () =>
      [...bms]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 6),
    [bms],
  )

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard operacional"
        subtitle="Saúde do inventário de contingência em tempo real."
        actions={
          <>
            <button
              className="btn-ghost"
              onClick={() => {
                if (
                  window.confirm(
                    'Restaurar dados mockados? Isso substitui todos os perfis e BMs atuais.',
                  )
                ) {
                  resetData()
                }
              }}
            >
              <RotateCw size={14} />
              Restaurar mock
            </button>
            <Link to="/cadastro/perfil" className="btn-primary">
              <Users size={14} />
              Novo perfil
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <StatCard
          icon={Users}
          label="Total de perfis"
          value={stats.totalProfiles}
          tone="cyan"
          highlight
        />
        <StatCard icon={Activity} label="Perfis ativos" value={stats.profilesAtivos} tone="cyan" />
        <StatCard icon={Flame} label="Em aquecimento" value={stats.profilesAquecimento} tone="amber" />
        <StatCard
          icon={ShieldCheck}
          label="Perfis prontos"
          value={stats.profilesProntos}
          tone="emerald"
        />
        <StatCard
          icon={CircleSlash}
          label="Perfis bloqueados"
          value={stats.profilesBloqueados}
          tone="rose"
          hint={`${stats.taxaPerdaPerfis}% taxa de perda`}
        />
        <StatCard
          icon={Layers}
          label="Disponíveis p/ uso"
          value={stats.disponiveis}
          tone="emerald"
          hint="prontos para subir"
        />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <StatCard
          icon={Building2}
          label="Total de BMs"
          value={stats.totalBMs}
          tone="cyan"
          highlight
        />
        <StatCard icon={Wallet} label="BMs ativas" value={stats.bmsAtivas} tone="cyan" />
        <StatCard icon={CreditCard} label="BMs em análise" value={stats.bmsAnalise} tone="sky" />
        <StatCard
          icon={CircleSlash}
          label="BMs bloqueadas"
          value={stats.bmsBloqueadas}
          tone="rose"
          hint={`${stats.taxaPerdaBMs}% taxa de perda`}
        />
        <StatCard
          icon={ShieldCheck}
          label="BMs prontas"
          value={stats.bmsProntas}
          tone="emerald"
        />
        <StatCard
          icon={TrendingDown}
          label="Ativos perdidos"
          value={stats.perdidos}
          tone="rose"
          hint="bloqueados + descartados"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Alertas */}
        <div className="surface lg:col-span-1 rounded-xl">
          <header className="flex items-center justify-between border-b border-ink-700/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-300" />
              <h3 className="text-sm font-semibold">Alertas recentes</h3>
            </div>
            <span className="rounded-md bg-ink-800/80 px-1.5 py-0.5 text-[11px] tabular-nums text-slate-400">
              {alerts.length}
            </span>
          </header>
          <div className="max-h-[420px] overflow-y-auto p-3">
            {alerts.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Tudo sob controle"
                description="Nenhum alerta ativo no momento. Bom trabalho."
              />
            ) : (
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li
                    key={a.id}
                    onClick={() => {
                      if (a.type === 'profile') setProfileModal(a.item)
                      else setBMModal(a.item)
                    }}
                    className="cursor-pointer rounded-lg border border-ink-700/50 bg-ink-850/50 px-3 py-2 transition hover:border-neon-400/50 hover:bg-ink-800"
                  >
                    <div className="flex items-start gap-2">
                      <StatusBadge tone={a.tone} label={a.type === 'profile' ? 'Perfil' : 'BM'} />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-100">{a.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{a.meta}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Últimos perfis */}
        <div className="surface lg:col-span-1 rounded-xl">
          <header className="flex items-center justify-between border-b border-ink-700/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-cyan-300" />
              <h3 className="text-sm font-semibold">Últimos perfis atualizados</h3>
            </div>
            <Link
              to="/kanban/perfis"
              className="text-[11px] text-neon-300 underline-offset-2 hover:underline"
            >
              ver todos →
            </Link>
          </header>
          <div className="divide-y divide-ink-700/40">
            {recentProfiles.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="Sem perfis ainda"
                  description="Cadastre seu primeiro perfil para começar."
                />
              </div>
            ) : (
              recentProfiles.map((p) => {
                const status = PROFILE_STATUS_MAP[p.status]
                return (
                  <button
                    key={p.id}
                    onClick={() => setProfileModal(p)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-ink-800/60"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                      <Users size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{p.nome}</p>
                      <p className="text-[11px] text-slate-500">
                        {p.fornecedor} · {relativeTime(p.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge tone={status?.tone} label={status?.label} />
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Últimas BMs */}
        <div className="surface lg:col-span-1 rounded-xl">
          <header className="flex items-center justify-between border-b border-ink-700/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-violet-300" />
              <h3 className="text-sm font-semibold">Últimas BMs atualizadas</h3>
            </div>
            <Link
              to="/kanban/bms"
              className="text-[11px] text-neon-300 underline-offset-2 hover:underline"
            >
              ver todas →
            </Link>
          </header>
          <div className="divide-y divide-ink-700/40">
            {recentBMs.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="Sem BMs ainda"
                  description="Cadastre sua primeira BM para começar."
                />
              </div>
            ) : (
              recentBMs.map((b) => {
                const status = BM_STATUS_MAP[b.status]
                return (
                  <button
                    key={b.id}
                    onClick={() => setBMModal(b)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-ink-800/60"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                      <Building2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{b.nome}</p>
                      <p className="font-mono text-[11px] text-slate-500">
                        {b.bmId} · {formatDate(b.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge tone={status?.tone} label={status?.label} />
                  </button>
                )
              })
            )}
          </div>
        </div>
      </section>

      <ProfileModal
        open={!!profileModal}
        profile={profileModal}
        onClose={() => setProfileModal(null)}
      />
      <BMModal open={!!bmModal} bm={bmModal} onClose={() => setBMModal(null)} />
    </>
  )
}
