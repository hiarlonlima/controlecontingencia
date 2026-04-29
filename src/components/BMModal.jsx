import { useEffect, useMemo, useState } from 'react'
import { Save, Trash2, Send, History, AlertTriangle } from 'lucide-react'
import {
  BM_STATUSES,
  BM_STATUS_MAP,
  BM_VERIFICACOES,
  NACIONALIDADES,
} from '../utils/constants.js'
import { formatDateTime } from '../utils/format.js'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import AdAccountsEditor from './AdAccountsEditor.jsx'
import HistoryList from './HistoryList.jsx'
import Modal from './Modal.jsx'
import StatusBadge from './StatusBadge.jsx'
import TagInput from './TagInput.jsx'

const TABS = [
  { id: 'detalhes', label: 'Detalhes' },
  { id: 'vinculos', label: 'Vínculos & Domínios' },
  { id: 'historico', label: 'Histórico & Notas' },
]

function joinList(arr) {
  return Array.isArray(arr) ? arr.join(', ') : ''
}
function splitList(s) {
  if (!s) return []
  return s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export default function BMModal({ open, bm, onClose }) {
  const { profiles, updateBM, moveBMStatus, addBMNote, deleteBM } = useData()
  const toast = useToast()
  const [tab, setTab] = useState('detalhes')
  const [form, setForm] = useState(null)
  const [note, setNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (bm) {
      setForm({ ...bm })
      setTab('detalhes')
      setConfirmDelete(false)
      setNote('')
    }
  }, [bm])

  const dono = useMemo(
    () => profiles.find((p) => p.id === form?.perfilDono),
    [profiles, form],
  )

  if (!form) return null

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleVinculo(perfilId) {
    set(
      'perfisVinculados',
      form.perfisVinculados.includes(perfilId)
        ? form.perfisVinculados.filter((id) => id !== perfilId)
        : [...form.perfisVinculados, perfilId],
    )
  }

  function handleSave() {
    const original = bm
    const patch = { ...form }
    delete patch.id
    delete patch.historico
    delete patch.notas
    delete patch.createdAt

    const changedFields = Object.keys(patch).filter(
      (k) => JSON.stringify(patch[k]) !== JSON.stringify(original[k]),
    )

    if (form.status !== original.status) {
      moveBMStatus(original.id, form.status)
    }

    const fieldsExceptStatus = changedFields.filter((k) => k !== 'status')
    if (fieldsExceptStatus.length) {
      updateBM(
        original.id,
        Object.fromEntries(fieldsExceptStatus.map((k) => [k, patch[k]])),
        {
          history: {
            tipo: 'edicao',
            descricao: `Campos atualizados: ${fieldsExceptStatus.join(', ')}.`,
          },
        },
      )
    }
    toast.success('BM atualizada.')
    onClose?.()
  }

  function handleAddNote() {
    if (!note.trim()) return
    addBMNote(bm.id, note)
    setNote('')
    toast.success('Anotação adicionada.')
  }

  function handleDelete() {
    deleteBM(bm.id)
    toast.success('BM removida.')
    onClose?.()
  }

  const status = BM_STATUS_MAP[form.status] ?? BM_STATUS_MAP.nova

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={form.nome || 'BM sem nome'}
      subtitle={
        <span className="flex items-center gap-2">
          <StatusBadge tone={status.tone} label={status.label} />
          {form.bmId && (
            <span className="font-mono text-[11px] text-slate-400">{form.bmId}</span>
          )}
          <span className="text-[11px] text-slate-500">
            atualizado em {formatDateTime(form.updatedAt)}
          </span>
        </span>
      }
      footer={
        <div className="flex items-center justify-between">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle size={13} />
                Confirma remover esta BM?
                <button className="btn-danger px-2 py-1 text-xs" onClick={handleDelete}>
                  Remover
                </button>
                <button
                  className="btn-ghost px-2 py-1 text-xs"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                className="btn-ghost text-rose-300 hover:bg-rose-500/10"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={14} />
                Remover
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary">
              <Save size={14} />
              Salvar alterações
            </button>
          </div>
        </div>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-1 border-b border-ink-700/60 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-md px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? 'bg-ink-800 text-neon-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'detalhes' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label mb-1.5 block">Nome da BM</label>
            <input className="input" value={form.nome} onChange={(e) => set('nome', e.target.value)} />
          </div>
          <div>
            <label className="label mb-1.5 block">ID da BM</label>
            <input
              className="input font-mono"
              value={form.bmId}
              onChange={(e) => set('bmId', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-1.5 block">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {BM_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Verificação Meta</label>
            <select
              className="input"
              value={form.verificacao || 'nao_verificada'}
              onChange={(e) => set('verificacao', e.target.value)}
            >
              {BM_VERIFICACOES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Selo de verificado aparece no card quando "Verificada".
            </p>
          </div>

          <div>
            <label className="label mb-1.5 block">Perfil dono</label>
            <select
              className="input"
              value={form.perfilDono || ''}
              onChange={(e) => set('perfilDono', e.target.value)}
            >
              <option value="">— selecione —</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            {dono && (
              <p className="mt-1 text-[11px] text-slate-500">
                Status do dono: {dono.status}
              </p>
            )}
          </div>
          <div>
            <label className="label mb-1.5 block">Nacionalidade</label>
            <select
              className="input"
              value={form.nacionalidade || 'br'}
              onChange={(e) => set('nacionalidade', e.target.value)}
            >
              {NACIONALIDADES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.emoji} {n.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">País / Região</label>
            <input
              className="input"
              value={form.pais}
              onChange={(e) => set('pais', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-1.5 block">Limite diário</label>
            <input
              className="input"
              value={form.limiteDiario || ''}
              onChange={(e) => set('limiteDiario', e.target.value)}
              placeholder="Ex.: R$ 5.000"
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="surface flex flex-1 cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm">
              <span>
                <span className="block text-xs uppercase tracking-wider text-slate-400">
                  Método de pagamento
                </span>
                <span className="text-slate-200">
                  {form.metodoPagamento ? 'Vinculado' : 'Sem método'}
                </span>
              </span>
              <input
                type="checkbox"
                checked={!!form.metodoPagamento}
                onChange={(e) => set('metodoPagamento', e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="label mb-1.5 block">Tags</label>
            <TagInput value={form.tags || []} onChange={(v) => set('tags', v)} />
          </div>

          <div className="md:col-span-2">
            <label className="label mb-1.5 block">Observações</label>
            <textarea
              className="input min-h-[100px] resize-y"
              value={form.observacoes || ''}
              onChange={(e) => set('observacoes', e.target.value)}
            />
          </div>
        </div>
      )}

      {tab === 'vinculos' && (
        <div className="space-y-5">
          <section>
            <h4 className="mb-2 text-sm font-semibold text-slate-100">
              Contas de anúncio
            </h4>
            <p className="mb-3 text-[11px] text-slate-500">
              Cadastre cada conta com seu status (boa, mediana, ruim, em preparação ou
              bloqueada) e tier. O card no Kanban mostra o resumo visual dessas contas.
            </p>
            <AdAccountsEditor
              value={form.contasAnuncio}
              onChange={(v) => set('contasAnuncio', v)}
            />
          </section>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <section>
              <h4 className="mb-2 text-sm font-semibold text-slate-100">Perfis vinculados</h4>
              <div className="surface max-h-72 overflow-y-auto rounded-xl p-2">
                {profiles.map((p) => {
                  const checked = form.perfisVinculados.includes(p.id)
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition ${
                        checked ? 'bg-cyan-500/10 text-cyan-200' : 'hover:bg-ink-800/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVinculo(p.id)}
                        className="h-3.5 w-3.5 accent-cyan-400"
                      />
                      <span className="flex-1 truncate">{p.nome}</span>
                      <span className="text-[10px] text-slate-500">{p.codigoInterno}</span>
                    </label>
                  )
                })}
                {profiles.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-slate-500">Nenhum perfil cadastrado.</p>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <label className="label mb-1.5 block">Domínios verificados</label>
                <textarea
                  className="input min-h-[64px] resize-y"
                  value={joinList(form.dominios)}
                  onChange={(e) => set('dominios', splitList(e.target.value))}
                  placeholder="lojaprincipal.com.br, leadpro.com.br"
                />
              </div>
              <div>
                <label className="label mb-1.5 block">Páginas vinculadas</label>
                <textarea
                  className="input min-h-[64px] resize-y"
                  value={joinList(form.paginas)}
                  onChange={(e) => set('paginas', splitList(e.target.value))}
                  placeholder="Página Oficial, Página Reserva"
                />
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'historico' && (
        <div className="space-y-5">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100">Anotações rápidas</h4>
              <span className="text-[11px] text-slate-500">{form.notas?.length || 0} no total</span>
            </div>
            <div className="flex items-start gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escreva uma observação rápida sobre esta BM..."
                className="input min-h-[64px] flex-1 resize-y"
              />
              <button onClick={handleAddNote} className="btn-primary self-stretch">
                <Send size={14} />
              </button>
            </div>
            {!!form.notas?.length && (
              <ul className="mt-3 space-y-2">
                {form.notas.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-ink-700/50 bg-ink-850/60 px-3 py-2 text-xs text-slate-300"
                  >
                    <p className="whitespace-pre-wrap">{n.texto}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {formatDateTime(n.data)} · {n.autor}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
              <History size={14} />
              Histórico de movimentações
            </h4>
            <HistoryList items={form.historico || []} />
          </section>
        </div>
      )}
    </Modal>
  )
}
