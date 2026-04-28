import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Login() {
  const { login, signUp, mode } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const isSupabase = mode === 'supabase'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isSupabase && isSignUp) {
        const result = await signUp({ email, password })
        if (!result.ok) {
          setError(result.error)
          return
        }
        if (result.needsVerification) {
          toast.success('Conta criada. Confirme o e-mail e faça login.')
          setIsSignUp(false)
          return
        }
        toast.success('Conta criada e logado.')
        navigate(location.state?.from?.pathname || '/', { replace: true })
        return
      }
      const result = await login({ email, password })
      if (!result.ok) {
        setError(result.error)
        return
      }
      toast.success('Acesso liberado.')
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const buttonLabel = loading
    ? isSignUp
      ? 'Criando...'
      : 'Validando...'
    : isSignUp
      ? 'Criar conta'
      : 'Entrar'

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="absolute inset-0 -z-10 bg-grid-fade" />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
        {/* Painel lateral */}
        <div className="hidden md:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-700/60 bg-ink-900/60 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-neon-300">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-400" />
            {isSupabase ? 'Console · Supabase' : 'Console · Local'}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-50">
            Controle de
            <br />
            <span className="bg-gradient-to-r from-neon-300 to-cyan-500 bg-clip-text text-transparent">
              Contingência FB Ads
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Visualize seus perfis e BMs em Kanban, controle aquecimento, vínculos,
            bloqueios e mantenha o histórico de cada ativo do seu inventário.
          </p>

          <ul className="mt-7 space-y-3 text-sm">
            {[
              'Kanban dedicado para Perfis e BMs',
              'Histórico de movimentações por ativo',
              'Senhas, 2FA e proxy ocultos por padrão',
              isSupabase
                ? 'Dados sincronizados entre dispositivos'
                : 'Importação e exportação em CSV',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-slate-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-500/15 text-neon-300">
                  <ShieldCheck size={11} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="surface mx-auto w-full max-w-md rounded-2xl p-7 shadow-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-400 to-cyan-700 shadow-glow">
              {isSignUp ? (
                <UserPlus size={18} className="text-ink-950" strokeWidth={2.5} />
              ) : (
                <Lock size={18} className="text-ink-950" strokeWidth={2.5} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                {isSignUp ? 'Criar conta' : 'Acesso restrito'}
              </h2>
              <p className="text-xs text-slate-400">
                {isSupabase
                  ? isSignUp
                    ? 'Cadastre-se para acessar o console.'
                    : 'Entre com seu e-mail e senha cadastrados.'
                  : 'Informe a senha de administrador para entrar.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSupabase && (
              <div>
                <label className="label mb-1.5 block">E-mail</label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    autoFocus
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="voce@email.com"
                    className="input pl-9"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label mb-1.5 block">
                {isSupabase ? 'Senha' : 'Senha de administrador'}
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  autoFocus={!isSupabase}
                  autoComplete={
                    isSupabase
                      ? isSignUp
                        ? 'new-password'
                        : 'current-password'
                      : 'off'
                  }
                  name={isSupabase ? 'password' : 'cfb-admin-pass'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="••••••••"
                  className="input pr-11"
                  spellCheck={false}
                  data-form-type="other"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:bg-ink-700 hover:text-neon-300"
                  aria-label={show ? 'Ocultar' : 'Mostrar'}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !password || (isSupabase && !email)}
              className="btn-primary w-full"
            >
              {buttonLabel}
              {!loading && <ArrowRight size={14} />}
            </button>

            {isSupabase && (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp((v) => !v)
                  setError('')
                }}
                className="w-full text-center text-xs text-slate-400 transition hover:text-neon-300"
              >
                {isSignUp ? 'Já tem conta? Entrar' : 'Criar conta nova'}
              </button>
            )}
          </form>

          <div className="mt-5 rounded-lg border border-ink-700/60 bg-ink-850/60 px-3 py-2 text-[11px] text-slate-400">
            {isSupabase ? (
              <>
                <strong className="text-slate-200">Modo Supabase ativo.</strong> Dados
                sincronizados em nuvem. Convide operadores diretamente pelo painel do
                Supabase ou pelo botão "Criar conta".
              </>
            ) : (
              <>
                Senha padrão de teste:{' '}
                <span className="font-mono text-slate-200">admin123</span>
                <span className="ml-1 text-slate-500">
                  · altere em Configurações após o primeiro acesso.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
