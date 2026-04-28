import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Database,
  KeyRound,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants.js'
import { getSettings, removeKey, setSettings } from '../utils/storage.js'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function Configuracoes() {
  const { profiles, bms, resetData } = useData()
  const toast = useToast()
  const [form, setForm] = useState(() => getSettings())
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmWipe, setConfirmWipe] = useState(false)

  useEffect(() => {
    setForm(getSettings())
  }, [])

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave(e) {
    e.preventDefault()
    setSettings(form)
    toast.success('Configurações salvas.')
  }

  function handleReset() {
    resetData()
    setConfirmReset(false)
    toast.success('Dados restaurados ao mock inicial.')
  }

  function handleWipe() {
    Object.values(STORAGE_KEYS).forEach(removeKey)
    setConfirmWipe(false)
    toast.warning('Storage limpo. Recarregando...')
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Configurações"
        subtitle="Ajuste senha de admin, alertas e gerencie os dados locais."
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="surface rounded-xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <KeyRound size={14} className="text-neon-300" />
            Senha de administrador
          </h3>
          <PasswordField
            label="Senha atual configurada"
            value={form.adminPassword}
            onChange={(v) => set('adminPassword', v)}
            hint="Mínimo 4 caracteres"
          />
          <p className="mt-2 text-[11px] text-slate-500">
            A senha é guardada localmente neste navegador. Para uso em produção, conecte
            um backend real (a estrutura já está pronta para isso).
          </p>
        </section>

        <section className="surface rounded-xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <ShieldCheck size={14} className="text-neon-300" />
            Alertas operacionais
          </h3>
          <label className="label mb-1.5 block">Alertar ativos parados há mais de</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="60"
              className="input w-24"
              value={form.alertDaysIdle}
              onChange={(e) => set('alertDaysIdle', Math.max(1, Number(e.target.value) || 1))}
            />
            <span className="text-sm text-slate-300">dias</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Cards e dashboard destacam perfis e BMs sem movimentação há mais que esse limite.
          </p>

          <label className="surface mt-4 flex cursor-pointer items-center justify-between rounded-lg border border-ink-700/60 px-3 py-2 text-sm">
            <span>
              <span className="block text-xs uppercase tracking-wider text-slate-400">
                Modo compacto padrão
              </span>
              <span className="text-slate-200">
                Cards menores nos Kanbans
              </span>
            </span>
            <input
              type="checkbox"
              checked={!!form.compactMode}
              onChange={(e) => set('compactMode', e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
          </label>
        </section>

        <section className="lg:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setForm(DEFAULT_SETTINGS)}
            className="btn-ghost"
          >
            Restaurar padrão
          </button>
          <button type="submit" className="btn-primary">
            <Save size={14} />
            Salvar configurações
          </button>
        </section>
      </form>

      <section className="surface mt-6 rounded-xl p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Database size={14} className="text-cyan-300" />
          Dados locais
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div className="rounded-lg border border-ink-700/60 bg-ink-850/60 px-3 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Perfis</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
              {profiles.length}
            </p>
          </div>
          <div className="rounded-lg border border-ink-700/60 bg-ink-850/60 px-3 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">BMs</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">{bms.length}</p>
          </div>
          <div className="rounded-lg border border-ink-700/60 bg-ink-850/60 px-3 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Storage</p>
            <p className="mt-1 text-sm font-semibold text-slate-50">localStorage do navegador</p>
            <p className="text-[11px] text-slate-500">
              dados isolados por origem · sem sincronização entre dispositivos
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-amber-200">
              <AlertTriangle size={12} />
              Restaurar mock
            </h4>
            <p className="mt-1 text-[11px] text-slate-400">
              Substitui todos os perfis e BMs atuais pelos dados de exemplo iniciais. Útil para
              testes — esta ação não pode ser desfeita.
            </p>
            {confirmReset ? (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="btn-danger text-xs"
                  onClick={handleReset}
                >
                  Confirmar restauração
                </button>
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-ghost mt-3 text-amber-200 hover:bg-amber-500/10"
                onClick={() => setConfirmReset(true)}
              >
                Restaurar dados mock
              </button>
            )}
          </div>

          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-rose-200">
              <Trash2 size={12} />
              Limpar tudo
            </h4>
            <p className="mt-1 text-[11px] text-slate-400">
              Apaga todos os dados locais (perfis, BMs, configurações e sessão). Você precisará
              fazer login novamente.
            </p>
            {confirmWipe ? (
              <div className="mt-3 flex items-center gap-2">
                <button type="button" className="btn-danger text-xs" onClick={handleWipe}>
                  Confirmar limpeza
                </button>
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => setConfirmWipe(false)}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-ghost mt-3 text-rose-200 hover:bg-rose-500/10"
                onClick={() => setConfirmWipe(true)}
              >
                Limpar storage
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
