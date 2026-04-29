import { useEffect, useMemo, useState } from 'react'
import { Save, Trash2, Send, History, AlertTriangle } from 'lucide-react'
import {
  CONFIDENCE_LEVELS,
  NACIONALIDADES,
  PROFILE_STATUSES,
  PROFILE_STATUS_MAP,
} from '../utils/constants.js'
import { formatDateTime } from '../utils/format.js'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import HistoryList from './HistoryList.jsx'
import Modal from './Modal.jsx'
import PasswordField from './PasswordField.jsx'
import SensitiveNotice from './SensitiveNotice.jsx'
import StatusBadge from './StatusBadge.jsx'
import TagInput from './TagInput.jsx'

const TABS = [
  { id: 'detalhes', label: 'Detalhes' },
  { id: 'seguranca', label: 'Acesso & Segurança' },
  { id: 'historico', label: 'Histórico & Notas' },
]

function dateInputValue(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}

export default function ProfileModal({ open, profile, onClose }) {
  const { profiles, bms, updateProfile, moveProfileStatus, addProfileNote, deleteProfile } =
    useData()
  const toast = useToast()
  const [tab, setTab] = useState('detalhes')
  const [form, setForm] = useState(null)
  const [note, setNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({ ...profile })
      setTab('detalhes')
      setConfirmDelete(false)
      setNote('')
    }
  }, [profile])

  const linkedBM = useMemo(
    () => bms.find((b) => b.id === form?.bmVinculada),
    [bms, form],
  )

  if (!form) return null

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    const original = profile
    const patch = { ...form }
    delete patch.id
    delete patch.historico
    delete patch.notas
    delete patch.createdAt

    // detecta mudanças relevantes
    const changedFields = Object.keys(patch).filter(
      (k) => JSON.stringify(patch[k]) !== JSON.stringify(original[k]),
    )

    if (form.status !== original.status) {
      moveProfileStatus(original.id, form.status)
    }

    const fieldsExceptStatus = changedFields.filter((k) => k !== 'status')
    if (fieldsExceptStatus.length) {
      updateProfile(
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
    toast.success('Perfil atualizado.')
    onClose?.()
  }

  function handleAddNote() {
    if (!note.trim()) return
    addProfileNote(profile.id, note)
    setNote('')
    toast.success('Anotação adicionada.')
  }

  function handleDelete() {
    deleteProfile(profile.id)
    toast.success('Perfil removido.')
    onClose?.()
  }

  const status = PROFILE_STATUS_MAP[form.status] ?? PROFILE_STATUS_MAP.novo

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={form.nome || 'Perfil sem nome'}
      subtitle={
        <span className="flex items-center gap-2">
          <StatusBadge tone={status.tone} label={status.label} />
          {form.codigoInterno && (
            <span className="text-[11px] text-slate-400">#{form.codigoInterno}</span>
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
                Confirma remover este perfil?
                <button
                  className="btn-danger px-2 py-1 text-xs"
                  onClick={handleDelete}
                >
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
            <label className="label mb-1.5 block">Nome do perfil</label>
            <input className="input" value={form.nome} onChange={(e) => set('nome', e.target.value)} />
          </div>
          <div>
            <label className="label mb-1.5 block">Código interno</label>
            <input
              className="input"
              value={form.codigoInterno}
              onChange={(e) => set('codigoInterno', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-1.5 block">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {PROFILE_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Nível de confiança</label>
            <select
              className="input"
              value={form.nivelConfianca}
              onChange={(e) => set('nivelConfianca', e.target.value)}
            >
              {CONFIDENCE_LEVELS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label mb-1.5 block">Fornecedor</label>
            <input
              className="input"
              value={form.fornecedor}
              onChange={(e) => set('fornecedor', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-1.5 block">Data de compra/entrada</label>
            <input
              type="date"
              className="input"
              value={dateInputValue(form.dataCompra)}
              onChange={(e) => set('dataCompra', e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Criação no Facebook</label>
            <input
              type="date"
              className="input"
              value={dateInputValue(form.dataCriacaoFacebook)}
              onChange={(e) =>
                set(
                  'dataCriacaoFacebook',
                  e.target.value ? new Date(e.target.value).toISOString() : '',
                )
              }
            />
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
          <div className="md:col-span-2">
            <label className="label mb-1.5 block">Telefone / Chip</label>
            <input
              className="input"
              value={form.telefone}
              onChange={(e) => set('telefone', e.target.value)}
              placeholder="+55 11 9 0000-0000"
            />
          </div>

          <div>
            <label className="label mb-1.5 block">BM vinculada</label>
            <select
              className="input"
              value={form.bmVinculada || ''}
              onChange={(e) => set('bmVinculada', e.target.value)}
            >
              <option value="">— sem vínculo —</option>
              {bms.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome} · {b.bmId}
                </option>
              ))}
            </select>
            {linkedBM && (
              <p className="mt-1 text-[11px] text-slate-500">
                Dono atual: {profiles.find((p) => p.id === linkedBM.perfilDono)?.nome ?? '—'}
              </p>
            )}
          </div>
          <div>
            <label className="label mb-1.5 block">Conta de anúncio vinculada</label>
            <input
              className="input"
              value={form.contaAnuncioVinculada}
              onChange={(e) => set('contaAnuncioVinculada', e.target.value)}
              placeholder="AD-0000"
            />
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

      {tab === 'seguranca' && (
        <div className="space-y-4">
          <SensitiveNotice />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label mb-1.5 block">Login / E-mail</label>
              <input
                className="input"
                value={form.login || ''}
                onChange={(e) => set('login', e.target.value)}
              />
            </div>
            <div>
              <label className="label mb-1.5 block">Proxy</label>
              <input
                className="input font-mono"
                value={form.proxy || ''}
                onChange={(e) => set('proxy', e.target.value)}
                placeholder="ip:porta · tipo"
              />
            </div>
            <PasswordField
              label="Senha"
              value={form.senha}
              onChange={(v) => set('senha', v)}
            />
            <PasswordField
              label="2FA / Chave de autenticação"
              value={form.twoFA}
              onChange={(v) => set('twoFA', v)}
              hint="Base32"
            />
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
                placeholder="Escreva uma observação rápida sobre este perfil..."
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
