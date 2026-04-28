import { useState } from 'react'
import { X } from 'lucide-react'
import { TAG_TONES, TONE_STYLES } from '../utils/constants.js'
import { tagTone } from '../utils/format.js'

export default function TagInput({ value = [], onChange, placeholder = 'Adicionar tag...' }) {
  const [input, setInput] = useState('')

  function commit(raw) {
    const tag = raw.trim().toLowerCase()
    if (!tag) return
    if (value.includes(tag)) {
      setInput('')
      return
    }
    onChange?.([...value, tag])
    setInput('')
  }

  function remove(tag) {
    onChange?.(value.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-700/70 bg-ink-850/70 px-2 py-1.5">
      {value.map((t) => {
        const tone = TONE_STYLES[tagTone(t, TAG_TONES)]
        return (
          <span key={t} className={`chip ${tone.bg} ${tone.border} ${tone.text}`}>
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="ml-0.5 text-slate-400 hover:text-rose-300"
              aria-label={`Remover ${t}`}
            >
              <X size={11} />
            </button>
          </span>
        )
      })}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit(input)
          } else if (e.key === 'Backspace' && !input && value.length) {
            remove(value[value.length - 1])
          }
        }}
        onBlur={() => commit(input)}
        placeholder={value.length ? '' : placeholder}
        className="min-w-[90px] flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
      />
    </div>
  )
}
