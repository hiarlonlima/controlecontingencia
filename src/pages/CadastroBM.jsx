import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Save } from 'lucide-react'
import { BM_STATUSES, PRIORITIES } from '../utils/constants.js'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import AdAccountsEditor from '../components/AdAccountsEditor.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TagInput from '../components/TagInput.jsx'

const initialState = {
  nome: '',
  bmId: '',
  perfilDono: '',
  perfisVinculados: [],
  contasAnuncio: [],
  metodoPagamento: false,
  limiteDiario: '',
  status: 'nova',
  prioridade: 'media',
  pais: 'Brasil',
  dominios: '',
  paginas: '',
  observacoes: '',
  tags: [],
}

function splitList(s) {
  if (!s) return []
  return s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export default function CadastroBM() {
  const { profiles, createBM } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function toggleVinculo(perfilId) {
    set(
      'perfisVinculados',
      form.perfisVinculados.includes(perfilId)
        ? form.perfisVinculados.filter((id) => id !== perfilId)
        : [...form.perfisVinculados, perfilId],
    )
  }

  function validate() {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome da BM.'
    if (!form.bmId.trim()) e.bmId = 'Informe o ID da BM.'
    if (!form.perfilDono) e.perfilDono = 'Selecione o perfil dono.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function buildPayload() {
    return {
      ...form,
      contasAnuncio: form.contasAnuncio,
      dominios: splitList(form.dominios),
      paginas: splitList(form.paginas),
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const created = createBM(buildPayload())
    toast.success(`BM "${created.nome}" cadastrada.`)
    navigate('/kanban/bms')
  }

  function handleSubmitAndNew(e) {
    e.preventDefault()
    if (!validate()) return
    const created = createBM(buildPayload())
    toast.success(`BM "${created.nome}" cadastrada.`)
    setForm(initialState)
  }

  return (
    <>
      <PageHeader
        eyebrow="Inventário"
        title="Cadastro de BM"
        subtitle="Centralize os dados de cada Business Manager para operação ágil."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="surface lg:col-span-2 rounded-xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Building2 size={14} className="text-violet-300" />
            Dados principais
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label mb-1.5 block">
                Nome da BM <span className="text-rose-300">*</span>
              </label>
              <input
                className="input"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                placeholder="Ex.: BM Comercial #1"
              />
              {errors.nome && <p className="mt-1 text-xs text-rose-300">{errors.nome}</p>}
            </div>
            <div>
              <label className="label mb-1.5 block">
                ID da BM <span className="text-rose-300">*</span>
              </label>
              <input
                className="input font-mono"
                value={form.bmId}
                onChange={(e) => set('bmId', e.target.value)}
                placeholder="Ex.: 102938475610"
              />
              {errors.bmId && <p className="mt-1 text-xs text-rose-300">{errors.bmId}</p>}
            </div>

            <div>
              <label className="label mb-1.5 block">Status inicial</label>
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
              <label className="label mb-1.5 block">Prioridade</label>
              <select
                className="input"
                value={form.prioridade}
                onChange={(e) => set('prioridade', e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label mb-1.5 block">
                Perfil dono <span className="text-rose-300">*</span>
              </label>
              <select
                className="input"
                value={form.perfilDono}
                onChange={(e) => set('perfilDono', e.target.value)}
              >
                <option value="">— selecione —</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              {errors.perfilDono && (
                <p className="mt-1 text-xs text-rose-300">{errors.perfilDono}</p>
              )}
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
                value={form.limiteDiario}
                onChange={(e) => set('limiteDiario', e.target.value)}
                placeholder="Ex.: R$ 5.000"
              />
            </div>
            <label className="surface flex cursor-pointer items-center justify-between rounded-lg border border-ink-700/60 px-3 py-2 text-sm">
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
                checked={form.metodoPagamento}
                onChange={(e) => set('metodoPagamento', e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
            </label>
          </div>

          <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-100">Contas de anúncio</h3>
          <p className="mb-3 text-[11px] text-slate-500">
            Adicione cada conta com status (boa, mediana, ruim, em preparação ou bloqueada)
            e tier. Você consegue editar tudo depois pelo modal de detalhes.
          </p>
          <AdAccountsEditor
            value={form.contasAnuncio}
            onChange={(v) => set('contasAnuncio', v)}
          />

          <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-100">Domínios & Páginas</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label mb-1.5 block">Domínios verificados</label>
              <textarea
                className="input min-h-[64px] resize-y"
                value={form.dominios}
                onChange={(e) => set('dominios', e.target.value)}
                placeholder="lojaprincipal.com.br"
              />
            </div>
            <div>
              <label className="label mb-1.5 block">Páginas vinculadas</label>
              <textarea
                className="input min-h-[64px] resize-y"
                value={form.paginas}
                onChange={(e) => set('paginas', e.target.value)}
                placeholder="Página Oficial, Página Reserva"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label mb-1.5 block">Tags</label>
            <TagInput value={form.tags} onChange={(v) => set('tags', v)} />
          </div>
          <div className="mt-4">
            <label className="label mb-1.5 block">Observações</label>
            <textarea
              className="input min-h-[100px] resize-y"
              value={form.observacoes}
              onChange={(e) => set('observacoes', e.target.value)}
              placeholder="Notas iniciais sobre esta BM..."
            />
          </div>
        </section>

        <section className="lg:col-span-1 space-y-4">
          <div className="surface rounded-xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">Perfis vinculados</h3>
            <p className="mb-3 text-[11px] text-slate-500">
              Marque os perfis que têm acesso a esta BM. Você pode editar depois.
            </p>
            <div className="max-h-[260px] space-y-1 overflow-y-auto rounded-lg border border-ink-700/60 bg-ink-900/40 p-1">
              {profiles.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-slate-500">
                  Nenhum perfil cadastrado ainda.
                </p>
              )}
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
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button type="submit" className="btn-primary">
              <Save size={14} />
              Salvar e ir para o Kanban
            </button>
            <button type="button" onClick={handleSubmitAndNew} className="btn-ghost">
              Salvar e cadastrar outra
            </button>
            <button
              type="button"
              onClick={() => setForm(initialState)}
              className="btn-ghost text-rose-300 hover:bg-rose-500/10"
            >
              Limpar formulário
            </button>
          </div>
        </section>
      </form>
    </>
  )
}
