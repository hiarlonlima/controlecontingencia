import { TONE_STYLES } from '../utils/constants.js'

export default function StatusBadge({ tone = 'slate', label, dot = true, className = '' }) {
  const style = TONE_STYLES[tone] ?? TONE_STYLES.slate
  return (
    <span className={`chip ${style.bg} ${style.border} ${style.text} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
      {label}
    </span>
  )
}
