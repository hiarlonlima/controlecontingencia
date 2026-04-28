import { useMemo, useState } from 'react'
import {
  CalendarRange,
  CircleSlash,
  Download,
  Filter,
  Layers,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react'
import {
  BM_AVAILABLE,
  BM_LOST,
  BM_STATUSES,
  BM_STATUS_MAP,
  PROFILE_AVAILABLE,
  PROFILE_LOST,
  PROFILE_STATUSES,
  PROFILE_STATUS_MAP,
} from '../utils/constants.js'
import { downloadCSV, toCSV } from '../utils/csv.js'
import { useData } from '../context/DataContext.jsx'
import { formatDateTime, pct, relativeTime } from '../utils/format.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

function isInRange(iso, from, to) {
  if (!iso) return false
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return false
  if (from && t < new Date(from).getTime()) return false
  if (to && t > new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1) return false
  return true
}

const TYPES = [
  { id: 'todos', label: 'Perfis e BMs' },
  { id: 'perfil', label: 'Apenas perfis' },
  { id: 'bm', label: 'Apenas BMs' },
]

export default function Relatorios() {
  const { profiles, bms } = useData()
  const today = new Date().toISOString().slice(0, 10)
  const ago30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)

  const [from, setFrom] = useState(ago30)
  const [to, setTo] = useState(today)
  const [type, setType] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')

  const fornecedores = useMemo(
    () => Array.from(new Set(profiles.map((p) => p.fornecedor).filter(Boolean))),
    [profiles],
  )

  // Eventos agregados (criação + mudanças de status)
  const events = useMemo(() => {
    const collect = (items, kind, statusMap) =>
      items.flatMap((it) =>
        (it.historico || [])
          .filter((h) => h.tipo === 'status' || h.tipo === 'criado')
          .map((h) => ({
            id: `${it.id}-${h.id}`,
            kind,
            entity: it,
            type: h.tipo,
            from: statusMap[h.from]?.label,
            to: statusMap[h.to]?.label,
            desc: h.descricao,
            data: h.data,
            autor: h.autor,
            currentStatus: it.status,
          })),
      )

    let list = []
    if (type !== 'bm') list = list.concat(collect(profiles, 'perfil', PROFILE_STATUS_MAP))
    if (type !== 'perfil') list = list.concat(collect(bms, 'bm', BM_STATUS_MAP))

    list = list
      .filter((e) => isInRange(e.data, from, to))
      .filter((e) => {
        if (supplierFilter === 'all') return true
        return e.kind === 'perfil' ? e.entity.fornecedor === supplierFilter : true
      })
      .filter((e) => {
        if (statusFilter === 'all') return true
        return e.currentStatus === statusFilter
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data))
    return list
  }, [profiles, bms, from, to, type, statusFilter, supplierFilter])

  // Métricas (períodos baseados em updatedAt para "ainda hoje")
  const profilesInRange = useMemo(
    () =>
      profiles.filter(
        (p) =>
          (supplierFilter === 'all' || p.fornecedor === supplierFilter) &&
          isInRange(p.updatedAt, from, to),
      ),
    [profiles, from, to, supplierFilter],
  )

  const bmsInRange = useMemo(
    () => bms.filter((b) => isInRange(b.updatedAt, from, to)),
    [bms, from, to],
  )

  const stats = useMemo(() => {
    const profilesBlocked = profilesInRange.filter((p) =>
      PROFILE_LOST.includes(p.status),
    ).length
    const bmsBlocked = bmsInRange.filter((b) => BM_LOST.includes(b.status)).length
    const disponiveis =
      profiles.filter((p) => PROFILE_AVAILABLE.includes(p.status)).length +
      bms.filter((b) => BM_AVAILABLE.includes(b.status)).length
    const emUso =
      profiles.filter((p) => p.status === 'em_uso').length +
      bms.filter((b) => b.status === 'em_uso').length

    return {
      profilesBlocked,
      bmsBlocked,
      disponiveis,
      emUso,
      taxaPerdaP: pct(profilesBlocked, profilesInRange.length || 1),
      taxaPerdaB: pct(bmsBlocked, bmsInRange.length || 1),
    }
  }, [profilesInRange, bmsInRange, profiles, bms])

  // Distribuição por status
  const dist = useMemo(() => {
    const profileDist = PROFILE_STATUSES.map((s) => ({
      ...s,
      count: profiles.filter((p) => p.status === s.id).length,
    }))
    const bmDist = BM_STATUSES.map((s) => ({
      ...s,
      count: bms.filter((b) => b.status === s.id).length,
    }))
    const totalP = profiles.length || 1
    const totalB = bms.length || 1
    return { profileDist, bmDist, totalP, totalB }
  }, [profiles, bms])

  function handleExportEvents() {
    const csv = toCSV(events, [
      { key: 'kind', label: 'Tipo' },
      { key: 'entity', label: 'Ativo', value: (r) => r.entity.nome },
      { key: 'desc', label: 'Descricao' },
      { key: 'from', label: 'De' },
      { key: 'to', label: 'Para' },
      { key: 'data', label: 'Data' },
      { key: 'autor', label: 'Autor' },
    ])
    downloadCSV(`movimentacoes-${from}-a-${to}.csv`, csv)
  }

  const statusOptions = type === 'bm' ? BM_STATUSES : PROFILE_STATUSES

  return (
    <>
      <PageHeader
        eyebrow="Relatórios"
        title="Visão analítica"
        subtitle="Analise bloqueios, disponibilidade e movimentações por período."
        actions={
          <button className="btn-ghost" onClick={handleExportEvents} disabled={!events.length}>
            <Download size={14} />
            Exportar movimentações
          </button>
        }
      />

      <section className="surface mb-4 flex flex-wrap items-end gap-3 rounded-xl px-4 py-3">
        <div>
          <label className="label mb-1 block">De</label>
          <div className="relative">
            <CalendarRange
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input pl-8"
            />
          </div>
        </div>
        <div>
          <label className="label mb-1 block">Até</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label mb-1 block">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input">
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label mb-1 block">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">Todos</option>
            {statusOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label mb-1 block">Fornecedor</label>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="input"
          >
            <option value="all">Todos</option>
            {fornecedores.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
          <Filter size={12} />
          {events.length} eventos no período
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <StatCard
          icon={CircleSlash}
          label="Perfis bloqueados (período)"
          value={stats.profilesBlocked}
          tone="rose"
        />
        <StatCard
          icon={CircleSlash}
          label="BMs bloqueadas (período)"
          value={stats.bmsBlocked}
          tone="rose"
        />
        <StatCard
          icon={ShieldCheck}
          label="Disponíveis para uso"
          value={stats.disponiveis}
          tone="emerald"
        />
        <StatCard
          icon={Layers}
          label="Em uso agora"
          value={stats.emUso}
          tone="cyan"
        />
        <StatCard
          icon={TrendingDown}
          label="Taxa de perda perfis"
          value={`${stats.taxaPerdaP}%`}
          tone="rose"
          hint="dos atualizados no período"
        />
        <StatCard
          icon={TrendingDown}
          label="Taxa de perda BMs"
          value={`${stats.taxaPerdaB}%`}
          tone="rose"
          hint="dos atualizados no período"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface rounded-xl p-4">
          <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span>Distribuição de Perfis</span>
            <span className="text-[11px] text-slate-500">{profiles.length} no total</span>
          </h3>
          <ul className="space-y-2">
            {dist.profileDist.map((s) => {
              const percentage = pct(s.count, dist.totalP)
              return (
                <li key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <StatusBadge tone={s.tone} label={s.label} />
                    <span className="tabular-nums text-slate-300">
                      {s.count} <span className="text-slate-500">· {percentage}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-500 to-cyan-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="surface rounded-xl p-4">
          <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span>Distribuição de BMs</span>
            <span className="text-[11px] text-slate-500">{bms.length} no total</span>
          </h3>
          <ul className="space-y-2">
            {dist.bmDist.map((s) => {
              const percentage = pct(s.count, dist.totalB)
              return (
                <li key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <StatusBadge tone={s.tone} label={s.label} />
                    <span className="tabular-nums text-slate-300">
                      {s.count} <span className="text-slate-500">· {percentage}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="surface mt-6 rounded-xl p-4">
        <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
          <span>Histórico recente</span>
          <span className="text-[11px] text-slate-500">{events.length} eventos</span>
        </h3>
        {events.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink-700/60 px-4 py-6 text-center text-xs text-slate-500">
            Nenhum evento no período selecionado.
          </p>
        ) : (
          <ol className="divide-y divide-ink-700/40">
            {events.slice(0, 30).map((e) => (
              <li key={e.id} className="flex items-start gap-3 py-2.5">
                <StatusBadge
                  tone={e.kind === 'perfil' ? 'cyan' : 'violet'}
                  label={e.kind === 'perfil' ? 'Perfil' : 'BM'}
                />
                <div className="flex-1">
                  <p className="text-xs text-slate-100">
                    <span className="font-medium">{e.entity.nome}</span>{' '}
                    <span className="text-slate-400">— {e.desc}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {formatDateTime(e.data)} · {relativeTime(e.data)} · {e.autor}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}
