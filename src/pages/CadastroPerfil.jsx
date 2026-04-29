import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, UserPlus } from 'lucide-react'
import { CONFIDENCE_LEVELS, PROFILE_STATUSES } from '../utils/constants.js'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PasswordField from '../components/PasswordField.jsx'
import SensitiveNotice from '../components/SensitiveNotice.jsx'
import TagInput from '../components/TagInput.jsx'

const initialState = {
  nome: '',
  codigoInterno: '',
  login: '',
  senha: '',
  twoFA: '',
  fornecedor: '',
  dataCompra: new Date().toISOString().slice(0, 10),
  dataCriacaoFacebook: '',
  status: 'novo',
  nivelConfianca: 'medio',
  pais: 'Brasil',
  proxy: '',
  telefone: '',
  bmVinculada: '',
  contaAnuncioVinculada: '',
  observacoes: '',
  tags: [],
}

export default function CadastroPerfil() {
  const { bms, createProfile } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Informe um nome ou apelido.'
    if (!form.fornecedor.trim()) e.fornecedor = 'Informe o fornecedor.'
    if (!form.dataCompra) e.dataCompra = 'Data obrigatória.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const created = createProfile({
      ...form,
      dataCompra: form.dataCompra ? new Date(form.dataCompra).toISOString() : '',
      dataCriacaoFacebook: form.dataCriacaoFacebook
        ? new Date(form.dataCriacaoFacebook).toISOString()
        : '',
    })
    toast.success(`Perfil "${created.nome}" cadastrado.`)
    navigate('/kanban/perfis')
  }

  function handleSubmitAndNew(e) {
    e.preventDefault()
    if (!validate()) return
    const created = createProfile({
      ...form,
      dataCompra: form.dataCompra ? new Date(form.dataCompra).toISOString() : '',
      dataCriacaoFacebook: form.dataCriacaoFacebook
        ? new Date(form.dataCriacaoFacebook).toISOString()
        : '',
    })
    toast.success(`Perfil "${created.nome}" cadastrado.`)
    setForm(initialState)
  }

  return (
    <>
      <PageHeader
        eyebrow="Inventário"
        title="Cadastro de Perfil"
        subtitle="Registre um novo perfil em menos de 1 minuto."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <section className="surface lg:col-span-2 rounded-xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <UserPlus size={14} className="text-neon-300" />
            Identificação
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label mb-1.5 block">
                Nome ou apelido <span className="text-rose-300">*</span>
              </label>
              <input
                className="input"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                placeholder="Ex.: Maria Oliveira"
              />
              {errors.nome && <p className="mt-1 text-xs text-rose-300">{errors.nome}</p>}
            </div>
            <div>
              <label className="label mb-1.5 block">Código interno</label>
              <input
                className="input"
                value={form.codigoInterno}
                onChange={(e) => set('codigoInterno', e.target.value)}
                placeholder="Ex.: MO-001"
              />
            </div>

            <div>
              <label className="label mb-1.5 block">
                Status inicial <span className="text-rose-300">*</span>
              </label>
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
              <label className="label mb-1.5 block">Confiança</label>
              <select
                className="input"
                value={form.nivelConfianca}
                onChange={(e) => set('nivelConfianca', e.target.value)}
              >
                {CONFIDENCE_LEVELS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label mb-1.5 block">
                Fornecedor <span className="text-rose-300">*</span>
              </label>
              <input
                className="input"
                value={form.fornecedor}
                onChange={(e) => set('fornecedor', e.target.value)}
                placeholder="Ex.: AlphaProfiles"
              />
              {errors.fornecedor && (
                <p className="mt-1 text-xs text-rose-300">{errors.fornecedor}</p>
              )}
            </div>

            <div>
              <label className="label mb-1.5 block">
                Data de compra/entrada <span className="text-rose-300">*</span>
              </label>
              <input
                type="date"
                className="input"
                value={form.dataCompra}
                onChange={(e) => set('dataCompra', e.target.value)}
              />
              {errors.dataCompra && (
                <p className="mt-1 text-xs text-rose-300">{errors.dataCompra}</p>
              )}
            </div>
            <div>
              <label className="label mb-1.5 block">Criação no Facebook</label>
              <input
                type="date"
                className="input"
                value={form.dataCriacaoFacebook}
                onChange={(e) => set('dataCriacaoFacebook', e.target.value)}
              />
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
              <label className="label mb-1.5 block">Telefone / Chip</label>
              <input
                className="input"
                value={form.telefone}
                onChange={(e) => set('telefone', e.target.value)}
                placeholder="+55 11 9 0000-0000"
              />
            </div>
          </div>

          <h3 className="mb-3 mt-7 text-sm font-semibold text-slate-100">Vínculos</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label mb-1.5 block">BM vinculada</label>
              <select
                className="input"
                value={form.bmVinculada}
                onChange={(e) => set('bmVinculada', e.target.value)}
              >
                <option value="">— sem vínculo —</option>
                {bms.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome} · {b.bmId}
                  </option>
                ))}
              </select>
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
              placeholder="Notas iniciais sobre este perfil..."
            />
          </div>
        </section>

        {/* Coluna lateral — segurança */}
        <section className="lg:col-span-1 space-y-4">
          <div className="surface rounded-xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">Acesso & Segurança</h3>
            <SensitiveNotice />
            <div className="mt-3 space-y-3">
              <div>
                <label className="label mb-1.5 block">Login / E-mail</label>
                <input
                  className="input"
                  value={form.login}
                  onChange={(e) => set('login', e.target.value)}
                  autoComplete="off"
                />
              </div>
              <PasswordField
                label="Senha"
                value={form.senha}
                onChange={(v) => set('senha', v)}
              />
              <PasswordField
                label="2FA / chave de autenticação"
                value={form.twoFA}
                onChange={(v) => set('twoFA', v)}
                hint="Base32"
              />
              <div>
                <label className="label mb-1.5 block">Proxy</label>
                <input
                  className="input font-mono"
                  value={form.proxy}
                  onChange={(e) => set('proxy', e.target.value)}
                  placeholder="ip:porta · tipo"
                />
              </div>
            </div>
          </div>

          <div className="surface rounded-xl p-5">
            <h4 className="mb-2 text-sm font-semibold text-slate-100">Dica</h4>
            <p className="text-xs text-slate-400">
              Cadastre o perfil já com o status real (novo, aquecimento, pronto…) — as
              colunas do Kanban refletem exatamente o que você define aqui.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button type="submit" className="btn-primary">
              <Save size={14} />
              Salvar e ir para o Kanban
            </button>
            <button type="button" onClick={handleSubmitAndNew} className="btn-ghost">
              Salvar e cadastrar outro
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
