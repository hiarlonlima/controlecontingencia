import { Plus, Trash2 } from 'lucide-react'
import {
  AD_ACCOUNT_QUALITIES,
  AD_ACCOUNT_QUALITY_MAP,
  AD_ACCOUNT_STATUSES,
  AD_ACCOUNT_STATUS_MAP,
  AD_ACCOUNT_TIERS,
  MOEDAS,
  TONE_STYLES,
} from '../utils/constants.js'

export function countAdAccountsBy(accounts = [], field) {
  return accounts.reduce((acc, a) => {
    const key = a?.[field] || ''
    if (!key) return acc
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

export function adAccountsSummary(accounts = []) {
  const counts = countAdAccountsBy(accounts, 'qualidade')
  return AD_ACCOUNT_QUALITIES.filter((q) => counts[q.id])
    .map((q) => `${counts[q.id]} ${q.label.toLowerCase()}`)
    .join(' · ')
}

export default function AdAccountsEditor({ value = [], onChange }) {
  const statusCounts = countAdAccountsBy(value, 'status')
  const qualityCounts = countAdAccountsBy(value, 'qualidade')

  function add() {
    onChange?.([
      ...value,
      {
        nome: '',
        id: '',
        status: 'criada',
        qualidade: 'iniciante',
        tier: 't2',
        moeda: 'brl',
        gasto: 0,
        observacao: '',
      },
    ])
  }
  function update(idx, patch) {
    onChange?.(value.map((a, i) => (i === idx ? { ...a, ...patch } : a)))
  }
  function remove(idx) {
    onChange?.(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-ink-700/50 bg-ink-850/40 px-3 py-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">
            {value.length} {value.length === 1 ? 'conta' : 'contas'}
          </span>
          {AD_ACCOUNT_STATUSES.filter((s) => statusCounts[s.id]).map((s) => {
            const tone = TONE_STYLES[s.tone]
            return (
              <span
                key={s.id}
                className={`chip ${tone.bg} ${tone.border} ${tone.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {statusCounts[s.id]} {s.label.toLowerCase()}
              </span>
            )
          })}
          <span className="h-3 w-px bg-ink-700" />
          {AD_ACCOUNT_QUALITIES.filter((q) => qualityCounts[q.id]).map((q) => {
            const tone = TONE_STYLES[q.tone]
            return (
              <span
                key={q.id}
                className={`chip ${tone.bg} ${tone.border} ${tone.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {qualityCounts[q.id]} {q.label.toLowerCase()}
              </span>
            )
          })}
        </div>
      )}

      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-ink-700/60 bg-ink-900/40 px-4 py-5 text-center text-xs text-slate-500">
          Nenhuma conta de anúncio adicionada ainda.
        </div>
      )}

      {value.map((acc, idx) => {
        const status = AD_ACCOUNT_STATUS_MAP[acc.status] ?? AD_ACCOUNT_STATUS_MAP.criada
        const statusTone = TONE_STYLES[status.tone]
        return (
          <div
            key={idx}
            className={`flex flex-wrap items-center gap-2 rounded-lg border bg-ink-850/60 p-2 transition ${statusTone.border}`}
          >
            <span
              className={`mt-2 h-2 w-2 shrink-0 rounded-full ${statusTone.dot}`}
              title={status.label}
            />
            <input
              value={acc.nome || ''}
              onChange={(e) => update(idx, { nome: e.target.value })}
              placeholder="Nome da conta"
              className="input w-44 py-1.5 text-xs"
              aria-label="Nome da conta"
            />
            <input
              value={acc.id}
              onChange={(e) => update(idx, { id: e.target.value })}
              placeholder="AD-0000"
              className="input w-32 py-1.5 font-mono text-xs"
              aria-label="ID da conta"
            />
            <select
              value={acc.status}
              onChange={(e) => update(idx, { status: e.target.value })}
              className="input w-36 py-1.5 text-xs"
              aria-label="Status da conta"
              title="Status"
            >
              {AD_ACCOUNT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={acc.qualidade || 'iniciante'}
              onChange={(e) => update(idx, { qualidade: e.target.value })}
              className="input w-32 py-1.5 text-xs"
              aria-label="Qualidade"
              title="Qualidade"
            >
              {AD_ACCOUNT_QUALITIES.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
            <select
              value={acc.tier}
              onChange={(e) => update(idx, { tier: e.target.value })}
              className="input w-24 py-1.5 text-xs"
              aria-label="Tier da conta"
              title="Tier"
            >
              {AD_ACCOUNT_TIERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={acc.moeda || 'brl'}
              onChange={(e) => update(idx, { moeda: e.target.value })}
              className="input w-24 py-1.5 text-xs"
              aria-label="Moeda da conta"
              title="Moeda"
            >
              {MOEDAS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              value={Number.isFinite(acc.gasto) ? acc.gasto : 0}
              onChange={(e) =>
                update(idx, { gasto: parseFloat(e.target.value) || 0 })
              }
              placeholder="0,00"
              className="input w-28 py-1.5 text-right text-xs tabular-nums"
              aria-label="Valor gasto"
              title="Valor gasto"
            />
            <input
              value={acc.observacao || ''}
              onChange={(e) => update(idx, { observacao: e.target.value })}
              placeholder="Observação (opcional)"
              className="input min-w-[160px] flex-1 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="mt-1 rounded-md p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
              aria-label="Remover conta"
              title="Remover conta"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )
      })}

      <button
        type="button"
        onClick={add}
        className="btn-ghost w-full justify-center border-dashed text-slate-300"
      >
        <Plus size={14} />
        Adicionar conta de anúncio
      </button>
    </div>
  )
}

// Backwards compat: alguns componentes ainda usam countAdAccountsByStatus
export function countAdAccountsByStatus(accounts = []) {
  return countAdAccountsBy(accounts, 'qualidade')
}
