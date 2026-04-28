import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nada por aqui',
  description = 'Quando você cadastrar itens, eles aparecem nesta lista.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-700/60 bg-ink-900/40 px-6 py-12 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink-800/80 text-neon-300">
        <Icon size={20} />
      </span>
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
