import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { STORAGE_KEYS } from '../utils/constants.js'
import { getSettings, loadJSON, removeKey, saveJSON } from '../utils/storage.js'
import { hasSupabase, supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() =>
    hasSupabase ? false : !!loadJSON(STORAGE_KEYS.AUTH, null),
  )
  const [user, setUser] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(hasSupabase)

  // Modo Supabase: escuta sessão
  useEffect(() => {
    if (!hasSupabase) return undefined

    let unsub
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session
      setUser(session?.user || null)
      setAuthed(!!session)
      setBootstrapping(false)
    })
    const { data: subData } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setAuthed(!!session)
    })
    unsub = subData?.subscription
    return () => unsub?.unsubscribe?.()
  }, [])

  // Modo localStorage: ouve mudanças entre abas
  useEffect(() => {
    if (hasSupabase) return undefined
    function onStorage(e) {
      if (e.key === STORAGE_KEYS.AUTH) setAuthed(!!loadJSON(STORAGE_KEYS.AUTH, null))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    if (hasSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email?.trim(),
        password,
      })
      if (error) {
        return { ok: false, error: traduzirErroSupabase(error.message) }
      }
      setUser(data.user)
      setAuthed(true)
      return { ok: true }
    }
    // Fallback local: a senha do admin local
    const settings = getSettings()
    if (password === settings.adminPassword) {
      saveJSON(STORAGE_KEYS.AUTH, { at: new Date().toISOString() })
      setAuthed(true)
      return { ok: true }
    }
    return { ok: false, error: 'Senha incorreta.' }
  }, [])

  const signUp = useCallback(async ({ email, password }) => {
    if (!hasSupabase) {
      return { ok: false, error: 'Supabase não configurado.' }
    }
    const { data, error } = await supabase.auth.signUp({
      email: email?.trim(),
      password,
    })
    if (error) return { ok: false, error: traduzirErroSupabase(error.message) }
    return { ok: true, needsVerification: !data.session, user: data.user }
  }, [])

  const logout = useCallback(async () => {
    if (hasSupabase) {
      await supabase.auth.signOut()
      setUser(null)
      setAuthed(false)
      return
    }
    removeKey(STORAGE_KEYS.AUTH)
    setAuthed(false)
  }, [])

  const value = useMemo(
    () => ({
      authed,
      user,
      mode: hasSupabase ? 'supabase' : 'local',
      bootstrapping,
      login,
      logout,
      signUp,
    }),
    [authed, user, bootstrapping, login, logout, signUp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function traduzirErroSupabase(msg) {
  if (!msg) return 'Falha no login.'
  const m = msg.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  if (m.includes('email not confirmed')) {
    return 'E-mail ainda não foi confirmado. Verifique sua caixa de entrada.'
  }
  if (m.includes('user already registered')) {
    return 'Este e-mail já está cadastrado.'
  }
  if (m.includes('password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (m.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }
  return msg
}
