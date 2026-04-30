import { useMemo, useState } from 'react'
import {
  Building2,
  CreditCard,
  ScrollText,
  Send,
  Trash2,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  AD_ACCOUNT_QUALITY_MAP,
  AD_ACCOUNT_STATUS_MAP,
  AD_ACCOUNT_TIER_MAP,
  MOEDA_MAP,
} from '../utils/constants.js'
import { formatDateTime, relativeTime } from '../utils/format.js'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SearchFilter from '../components/SearchFilter.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

function LogEntry({ log, onDelete }) {
  return (
    <li className="group flex items-start gap-2 rounded-lg border border-ink-700/50 bg-ink-900/50 px-3 py-2">
      <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-neon-400" />
      <div className="flex-1">
        <p className="whitespace-pre-wrap text-xs text-slate-200">{log.texto}</p>
        <p className="mt-1 text-[10px] text-slate-500">
          {formatDateTime(log.data)} · {relativeTime(log.data)} · {log.autor}
        </p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="rounded p-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-300"
        title="Remover registro"
      >
        <Trash2 size={11} />
      </button>
    </li>
  )
}

function AdAccountLogRow({ ad, onAddLog, onDeleteLog }) {
  const [text, setText] = useState('')
  const status = AD_ACCOUNT_STATUS_MAP[ad.status] ?? AD_ACCOUNT_STATUS_MAP.criada
  const qualidade =
    AD_ACCOUNT_QUALITY_MAP[ad.qualidade] ?? AD_ACCOUNT_QUALITY_MAP.iniciante
  const tier = AD_ACCOUNT_TIER_MAP[ad.tier] ?? AD_ACCOUNT_TIER_MAP.t2
  const moeda = MOEDA_MAP[ad.moeda] ?? MOEDA_MAP.brl
  const logs = ad.logs || []

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAddLog(text)
    setText('')
  }

  return (
    <article className="surface rounded-xl p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-200">
              <Building2 size={11} />
              {ad.bmNome || 'BM sem nome'}
            </span>
            <span className="text-[11px] text-slate-500">→</span>
            <p className="truncate text-sm font-semibold text-slate-50">
              {ad.nome || 'Conta sem nome'}
            </p>
          </div>
          <p className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
            <CreditCard size={10} />
            {ad.id || '—'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge tone={status.tone} label={status.label} />
          <StatusBadge tone={qualidade.tone} label={qualidade.label} />
          <StatusBadge tone={tier.tone} dot={false} label={tier.label} />
          <StatusBadge
            tone={moeda.tone}
            dot={false}
            label={
              <span className="inline-flex items-center gap-1">
                <span className="text-[12px] leading-none">{moeda.emoji}</span>
                {moeda.label}
              </span>
            }
          />
        </div>
      </header>

      {ad.observacao && (
        <p className="mt-3 rounded-md border border-ink-700/50 bg-ink-850/40 px-3 py-2 text-[11px] italic text-slate-400">
          obs.: {ad.observacao}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <ScrollText size={11} />
          Registros ({logs.length})
        </h4>
      </div>

      {logs.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {logs.map((log) => (
            <LogEntry
              key={log.id}
              log={log}
              onDelete={() => onDeleteLog(log.id)}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-2 rounded-lg border border-dashed border-ink-700/50 bg-ink-900/30 px-3 py-3 text-center text-[11px] text-slate-500">
          Nenhum registro ainda. Use o campo abaixo pra adicionar o primeiro.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex items-start gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Registrar observação ou movimentação operacional..."
          className="input min-h-[44px] flex-1 resize-y text-xs"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary self-stretch"
          title="Cmd/Ctrl + Enter"
        >
          <Send size={13} />
          Registrar
        </button>
      </form>
    </article>
  )
}

export default function Logs() {
  const { bms, addAdAccountLog, deleteAdAccountLog } = useData()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterBm, setFilterBm] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Achata todas as contas de anúncio com referência à BM
  const allAdAccounts = useMemo(
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
    return allAdAccounts.filter((ad) => {
      if (filterBm !== 'all' && ad.bmId !== filterBm) return false
      if (filterStatus !== 'all' && ad.status !== filterStatus) return false
      if (!q) return true
      const haystack = [ad.nome, ad.id, ad.bmNome, ad.observacao]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [allAdAccounts, search, filterBm, filterStatus])

  const totalLogs = useMemo(
    () => allAdAccounts.reduce((sum, a) => sum + (a.logs?.length || 0), 0),
    [allAdAccounts],
  )

  const statusOptions = Object.values(AD_ACCOUNT_STATUS_MAP).map((s) => ({
    value: s.id,
    label: s.label,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Operação"
        title="Logs operacionais"
        subtitle="Histórico centralizado de todas as contas de anúncio cadastradas. Registre observações por conta com data, hora e autor."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neon-500/30 bg-neon-500/10 px-2.5 py-1 text-[11px] font-medium text-neon-200">
            <ScrollText size={12} />
            {totalLogs} {totalLogs === 1 ? 'registro' : 'registros'}
          </span>
        }
      />

      <SearchFilter
        search={search}
        onSearch={setSearch}
        resultCount={filtered.length}
        totalCount={allAdAccounts.length}
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
            options: statusOptions,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title={
            allAdAccounts.length === 0
              ? 'Nenhuma conta de anúncio cadastrada'
              : 'Nenhum resultado para os filtros'
          }
          description={
            allAdAccounts.length === 0
              ? 'Cadastre contas dentro das BMs (aba Vínculos & Domínios) e elas aparecem aqui automaticamente.'
              : 'Tente limpar os filtros ou buscar por outro termo.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((ad) => (
            <li key={ad.rowKey}>
              <AdAccountLogRow
                ad={ad}
                onAddLog={(text) => {
                  addAdAccountLog(ad.bmId, ad.adIndex, text)
                  toast.success('Registro adicionado.')
                }}
                onDeleteLog={(logId) => {
                  if (window.confirm('Remover este registro do log?')) {
                    deleteAdAccountLog(ad.bmId, ad.adIndex, logId)
                  }
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
