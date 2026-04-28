import { Search, X, Filter } from 'lucide-react'

export default function SearchFilter({
  search,
  onSearch,
  filters = [],
  rightSlot,
  resultCount,
  totalCount,
}) {
  const hasActive = filters.some((f) => f.value && f.value !== 'all')

  return (
    <div className="surface mb-4 flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5">
      <div className="relative flex min-w-[220px] flex-1 items-center">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 text-slate-500"
        />
        <input
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Buscar por nome, ID, fornecedor ou tag..."
          className="input pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch?.('')}
            className="absolute right-2 rounded p-1 text-slate-400 hover:text-slate-100"
            aria-label="Limpar busca"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1 text-[11px] uppercase tracking-wider text-slate-500 md:inline-flex">
            <Filter size={12} />
            Filtros
          </span>
          {filters.map((f) => (
            <select
              key={f.key}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="input min-w-[140px] py-1.5 text-xs"
            >
              <option value="all">{f.allLabel ?? `Todos: ${f.label}`}</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
          {hasActive && (
            <button
              type="button"
              onClick={() => filters.forEach((f) => f.onChange('all'))}
              className="text-[11px] text-slate-400 underline-offset-2 hover:text-neon-300 hover:underline"
            >
              limpar
            </button>
          )}
        </div>
      )}

      {(typeof resultCount === 'number' || rightSlot) && (
        <div className="ml-auto flex items-center gap-3">
          {typeof resultCount === 'number' && (
            <span className="text-xs text-slate-400">
              <span className="font-semibold text-slate-100">{resultCount}</span>
              {typeof totalCount === 'number' && <span> / {totalCount}</span>}
            </span>
          )}
          {rightSlot}
        </div>
      )}
    </div>
  )
}
