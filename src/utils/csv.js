// Utilitários simples de CSV — sem dependências externas
function escapeCell(value) {
  if (value == null) return ''
  let s = typeof value === 'string' ? value : JSON.stringify(value)
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    s = `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function toCSV(rows, columns) {
  if (!rows?.length) return columns.map((c) => c.label).join(',') + '\n'
  const header = columns.map((c) => c.label).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => escapeCell(typeof c.value === 'function' ? c.value(row) : row[c.key]))
        .join(','),
    )
    .join('\n')
  return `${header}\n${body}\n`
}

export function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Parser tolerante a aspas e quebras de linha dentro de células citadas
export function parseCSV(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i += 1
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1
      row.push(cell)
      cell = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else {
      cell += ch
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    if (row.some((c) => c.trim() !== '')) rows.push(row)
  }
  if (!rows.length) return { headers: [], rows: [] }
  const [headers, ...data] = rows
  return {
    headers: headers.map((h) => h.trim()),
    rows: data.map((r) => {
      const obj = {}
      headers.forEach((h, idx) => {
        obj[h.trim()] = r[idx] ?? ''
      })
      return obj
    }),
  }
}
