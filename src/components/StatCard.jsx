import { TONE_STYLES } from '../utils/constants.js'

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'cyan',
  highlight = false,
}) {
  const style = TONE_STYLES[tone] ?? TONE_STYLES.cyan
  return (
    <div
      className={`surface relative overflow-hidden rounded-xl p-4 transition hover:border-ink-600/80 ${
        highlight ? 'shadow-glow border-neon-500/30' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        {Icon && (
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.bg} ${style.text}`}
          >
            <Icon size={15} />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}
