import { Eye, EyeOff, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '../context/ToastContext.jsx'

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder = '',
  readOnly = false,
  hint,
  copyable = true,
  monospace = true,
}) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  function handleCopy() {
    if (!value) return
    try {
      navigator.clipboard.writeText(value)
      setCopied(true)
      toast.info('Copiado para a área de transferência.')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  return (
    <div>
      {label && (
        <label className="label mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {hint && <span className="text-[10px] normal-case text-slate-500">{hint}</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          autoComplete="new-password"
          className={`input pr-20 ${monospace ? 'font-mono tracking-wide' : ''}`}
        />
        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              className="rounded p-1.5 text-slate-400 hover:bg-ink-700 hover:text-neon-300"
              title="Copiar"
              aria-label="Copiar"
            >
              {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="rounded p-1.5 text-slate-400 hover:bg-ink-700 hover:text-neon-300"
            title={visible ? 'Ocultar' : 'Mostrar'}
            aria-label={visible ? 'Ocultar' : 'Mostrar'}
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
