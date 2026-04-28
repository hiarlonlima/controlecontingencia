export function formatDate(input, opts = {}) {
  if (!input) return '—'
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...opts,
  })
}

export function formatDateTime(input) {
  if (!input) return '—'
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function relativeTime(input) {
  if (!input) return '—'
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'agora há pouco'
  const min = Math.floor(sec / 60)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const days = Math.floor(h / 24)
  if (days < 30) return `há ${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `há ${months}m`
  const years = Math.floor(months / 12)
  return `há ${years}a`
}

export function daysBetween(input, ref = new Date()) {
  if (!input) return 0
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return 0
  const diff = ref.getTime() - d.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export function pct(num, total) {
  if (!total) return 0
  return Math.round((num / total) * 100)
}

export function maskValue(value, visible = false) {
  if (!value) return ''
  if (visible) return value
  return '•'.repeat(Math.min(12, Math.max(6, value.length)))
}

export function tagTone(tag, palette) {
  if (!tag) return palette[0]
  let hash = 0
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash << 5) - hash + tag.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % palette.length
  return palette[idx]
}
