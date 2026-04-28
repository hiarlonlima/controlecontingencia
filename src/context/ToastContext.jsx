import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const TONE = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  error: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration) setTimeout(() => remove(id), duration)
      return id
    },
    [remove],
  )

  const api = useMemo(
    () => ({
      push,
      success: (m, d) => push(m, 'success', d),
      error: (m, d) => push(m, 'error', d),
      warning: (m, d) => push(m, 'warning', d),
      info: (m, d) => push(m, 'info', d),
      remove,
    }),
    [push, remove],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] ?? Info
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex animate-slide-in-right items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm shadow-card backdrop-blur-md ${TONE[t.type]}`}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="text-slate-400 hover:text-slate-100"
                aria-label="Fechar"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
