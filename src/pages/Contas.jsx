import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CreditCard,
  ExternalLink,
  Layers,
  ScrollText,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  AD_ACCOUNT_QUALITIES,
  AD_ACCOUNT_QUALITY_MAP,
  AD_ACCOUNT_STATUSES,
  AD_ACCOUNT_STATUS_MAP,
  AD_ACCOUNT_TIER_MAP,
  MOEDA_MAP,
  TONE_STYLES,
} from '../utils/constants.js'
import { useData } from '../context/DataContext.jsx'
import {
  formatMoney,
  formatTotalsByCurrency,
  sumGastoByCurrency,
} from '../utils/format.js'
import BMModal from '../components/BMModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SearchFilter from '../components/SearchFilter.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

function StatusDistribution({ counts, total, dimension, items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const count = counts[item.id] || 0
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
        const tone = TONE_STYLES[item.tone]
        return (
          <li key={item.id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className={`chip ${tone.bg} ${tone.border} ${tone.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {item.label}
              </span>
              <span className="tabular-nums text-slate-300">
                {count} <span className="text-slate-500">· {percentage}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
              <div
                className={`h-full rounded-full ${tone.dot}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function Contas() {
  const { bms } = useData()
  const [search, setSearch] = useState('')
  const [filterBm, setFilterBm] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterQualidade, setFilterQualidade] = useState('all')
  const [filterMoeda, setFilterMoeda] = useState('all')
  const [bmModalOpen, setBmModalOpen] = useState(null)

  const allAccounts = useMemo(
    () =>
      bms.flatMap((bm) =>
        (bm.contasAnuncio || []).map((ad, idx) => ({
          ...ad,
          bmId: bm.id,
          bmNome: bm.nome,
          bmStatus: bm.status,
          adIndex: idx,
          rowKey: `${bm.id}-${idx}`,
        })),
      ),
    [bms],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allAccounts.filter((ad) => {
      if (filterBm !== 'all' && ad.bmId !== filterBm) return false
      if (filterStatus !== 'all' && ad.status !== filterStatus) return false
      if (filterQualidade !== 'all' && ad.qualidade !== filterQualidade) return false
      if (filterMoeda !== 'all' && ad.moeda !== filterMoeda) return false
      if (!q) return true
      const haystack = [ad.nome, ad.id, ad.bmNome, ad.observacao]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [allAccounts, search, filterBm, filterStatus, filterQualidade, filterMoeda])

  const statusCounts = useMemo(() => {
    return allAccounts.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, {})
  }, [allAccounts])

  const qualityCounts = useMemo(() => {
    return allAccounts.reduce((acc, a) => {
      acc[a.qualidade] = (acc[a.qualidade] || 0) + 1
      return acc
    }, {})
  }, [allAccounts])

  const currencyCounts = useMemo(() => {
    return allAccounts.reduce((acc, a) => {
      acc[a.moeda] = (acc[a.moeda] || 0) + 1
      return acc
    }, {})
  }, [allAccounts])

  const totalLogs = useMemo(
    () => allAccounts.reduce((sum, a) => sum + (a.logs?.length || 0), 0),
    [allAccounts],
  )

  const totalsGasto = useMemo(
    () => sumGastoByCurrency(allAccounts),
    [allAccounts],
  )
  const totalsLabel = formatTotalsByCurrency(totalsGasto) || formatMoney(0, 'brl')

  function openBM(bmId) {
    const bm = bms.find((b) => b.id === bmId)
    if (bm) setBmModalOpen(bm)
  }

  return (
    <>
      <PageHeader
        eyebrow="Inventário"
        title="Contas de Anúncio"
        subtitle="Overview centralizado de todas as contas — distribuição por status, qualidade, moeda e tier."
        actions={
          <Link to="/logs" className="btn-ghost">
            <ScrollText size={14} />
            Ver Logs
          </Link>
        }
      />

      {allAccounts.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhuma conta de anúncio cadastrada"
          description='Cadastre contas dentro das BMs (aba "Vínculos & Domínios") e elas aparecem aqui automaticamente.'
        />
      ) : (
        <>
          {/* Stat cards top row */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={CreditCard}
              label="Total de contas"
              value={allAccounts.length}
              tone="cyan"
              highlight
            />
            <StatCard
              icon={Wallet}
              label="Total gasto"
              value={totalsLabel}
              tone="cyan"
              hint="soma por moeda"
              highlight
            />
            <StatCard
              icon={Activity}
              label="Em uso"
              value={statusCounts.usando || 0}
              tone="emerald"
              hint="status: usando"
            />
            <StatCard
              icon={Sparkles}
              label="Em escala"
              value={qualityCounts.escala || 0}
              tone="emerald"
              hint="qualidade: escala"
            />
            <StatCard
              icon={TrendingUp}
              label="Boa qualidade"
              value={qualityCounts.boa || 0}
              tone="cyan"
            />
            <StatCard
              icon={ScrollText}
              label="Logs registrados"
              value={totalLogs}
              tone="violet"
              hint={`em ${allAccounts.filter((a) => a.logs?.length).length} contas`}
            />
          </section>

          {/* Distribution panels */}
          <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="surface rounded-xl p-4">
              <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
                <span>Distribuição por Status (lifecycle)</span>
                <span className="text-[11px] text-slate-500">{allAccounts.length} no total</span>
              </h3>
              <StatusDistribution
                counts={statusCounts}
                total={allAccounts.length}
                dimension="status"
                items={AD_ACCOUNT_STATUSES}
              />
            </div>

            <div className="surface rounded-xl p-4">
              <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
                <span>Distribuição por Qualidade (performance)</span>
                <span className="text-[11px] text-slate-500">{allAccounts.length} no total</span>
              </h3>
              <StatusDistribution
                counts={qualityCounts}
                total={allAccounts.length}
                dimension="qualidade"
                items={AD_ACCOUNT_QUALITIES}
              />
            </div>
          </section>

          {/* Filtros */}
          <h2 className="mt-7 mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Lista de contas
          </h2>
          <SearchFilter
            search={search}
            onSearch={setSearch}
            resultCount={filtered.length}
            totalCount={allAccounts.length}
            filters={[
              {
                key: 'bm',
                label: 'BM',
                value: filterBm,
                onChange: setFilterBm,
                allLabel: 'Todas as BMs',
                options: bms.map((b) => ({ value: b.id, label: b.nome })),
              },
              {
                key: 'status',
                label: 'Status',
                value: filterStatus,
                onChange: setFilterStatus,
                allLabel: 'Todos os status',
                options: AD_ACCOUNT_STATUSES.map((s) => ({ value: s.id, label: s.label })),
              },
              {
                key: 'qualidade',
                label: 'Qualidade',
                value: filterQualidade,
                onChange: setFilterQualidade,
                allLabel: 'Toda qualidade',
                options: AD_ACCOUNT_QUALITIES.map((q) => ({ value: q.id, label: q.label })),
              },
              {
                key: 'moeda',
                label: 'Moeda',
                value: filterMoeda,
                onChange: setFilterMoeda,
                allLabel: 'Todas as moedas',
                options: [
                  { value: 'brl', label: '🇧🇷 BRL' },
                  { value: 'usd', label: '🇺🇸 USD' },
                ],
              },
            ]}
          />

          {/* Tabela */}
          <div className="surface overflow-hidden rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-700/60 bg-ink-850/50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">BM · Conta</th>
                  <th className="px-4 py-2.5 font-semibold">ID</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Qualidade</th>
                  <th className="px-4 py-2.5 font-semibold">Tier</th>
                  <th className="px-4 py-2.5 font-semibold">Moeda</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Gasto</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Logs</th>
                  <th className="px-4 py-2.5 text-right font-semibold"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700/40">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-xs text-slate-500">
                      Nenhuma conta corresponde aos filtros.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ad) => {
                    const status =
                      AD_ACCOUNT_STATUS_MAP[ad.status] ?? AD_ACCOUNT_STATUS_MAP.criada
                    const qualidade =
                      AD_ACCOUNT_QUALITY_MAP[ad.qualidade] ??
                      AD_ACCOUNT_QUALITY_MAP.iniciante
                    const tier =
                      AD_ACCOUNT_TIER_MAP[ad.tier] ?? AD_ACCOUNT_TIER_MAP.t2
                    const moeda = MOEDA_MAP[ad.moeda] ?? MOEDA_MAP.brl
                    return (
                      <tr
                        key={ad.rowKey}
                        className="transition hover:bg-ink-800/40"
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-slate-100">
                            {ad.nome || '—'}
                          </p>
                          <p className="text-[11px] text-slate-500">{ad.bmNome}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-300">
                          {ad.id || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={status.tone} label={status.label} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={qualidade.tone} label={qualidade.label} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={tier.tone} dot={false} label={tier.label} />
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <span>{moeda.emoji}</span>
                            {moeda.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-200">
                          {ad.gasto > 0 ? formatMoney(ad.gasto, ad.moeda) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="rounded-md bg-ink-800/80 px-1.5 py-0.5 text-[11px] tabular-nums text-slate-300">
                            {ad.logs?.length || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openBM(ad.bmId)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 hover:bg-ink-800 hover:text-neon-300"
                            title="Abrir BM"
                          >
                            <ExternalLink size={11} />
                            BM
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <BMModal
        open={!!bmModalOpen}
        bm={bmModalOpen}
        onClose={() => setBmModalOpen(null)}
      />
    </>
  )
}
