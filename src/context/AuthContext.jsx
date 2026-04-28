import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../utils/constants.js'
import { getSettings, loadJSON, removeKey, saveJSON } from '../utils/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => !!loadJSON(STORAGE_KEYS.AUTH, null))

  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEYS.AUTH) setAuthed(!!loadJSON(STORAGE_KEYS.AUTH, null))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback((password) => {
    const settings = getSettings()
    if (password === settings.adminPassword) {
      saveJSON(STORAGE_KEYS.AUTH, { at: new Date().toISOString() })
      setAuthed(true)
      return { ok: true }
    }
    return { ok: false, error: 'Senha incorreta.' }
  }, [])

  const logout = useCallback(() => {
    removeKey(STORAGE_KEYS.AUTH)
    setAuthed(false)
  }, [])

  const value = useMemo(() => ({ authed, login, logout }), [authed, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
