import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg',
}) {
  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in items-start justify-center overflow-y-auto bg-ink-950/70 p-4 backdrop-blur-sm sm:p-8">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative my-8 flex w-full ${widths[size] ?? widths.lg} flex-col overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/95 shadow-card`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink-700/50 px-6 py-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-50">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-ink-800 hover:text-slate-100"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="border-t border-ink-700/50 bg-ink-900/80 px-6 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
