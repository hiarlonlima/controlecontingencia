import {
  ArrowRightLeft,
  CircleDot,
  PenSquare,
  PlusCircle,
  StickyNote,
} from 'lucide-react'
import { formatDateTime, relativeTime } from '../utils/format.js'

const ICONS = {
  criado: PlusCircle,
  status: ArrowRightLeft,
  edicao: PenSquare,
  nota: StickyNote,
  default: CircleDot,
}

const TONES = {
  criado: 'text-emerald-300 bg-emerald-500/10',
  status: 'text-cyan-300 bg-cyan-500/10',
  edicao: 'text-amber-300 bg-amber-500/10',
  nota: 'text-violet-300 bg-violet-500/10',
  default: 'text-slate-300 bg-slate-500/10',
}

export default function HistoryList({ items = [] }) {
  if (!items.length) {
    return (
      <p className="rounded-lg border border-dashed border-ink-700/60 px-4 py-6 text-center text-xs text-slate-500">
        Nenhuma movimentação registrada ainda.
      </p>
    )
  }

  const ordered = [...items].sort((a, b) => new Date(b.data) - new Date(a.data))

  return (
    <ol className="space-y-2.5">
      {ordered.map((entry) => {
        const Icon = ICONS[entry.tipo] ?? ICONS.default
        const tone = TONES[entry.tipo] ?? TONES.default
        return (
          <li
            key={entry.id}
            className="flex items-start gap-3 rounded-lg border border-ink-700/50 bg-ink-850/50 px-3 py-2.5"
          >
            <span className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-md ${tone}`}>
              <Icon size={13} />
            </span>
            <div className="flex-1">
              <p className="text-xs text-slate-200">{entry.descricao}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {formatDateTime(entry.data)} · {relativeTime(entry.data)} · {entry.autor || 'admin'}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
