import { useState } from 'react'
import { Flame } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import WarmupTimeline from '../components/WarmupTimeline.jsx'
import { WARMUP_PLAYBOOKS } from '../data/warmupPlaybooks.js'

export default function Aquecimentos() {
  const [activeId, setActiveId] = useState('contas')
  const active = WARMUP_PLAYBOOKS.find((p) => p.id === activeId) || WARMUP_PLAYBOOKS[0]

  return (
    <>
      <PageHeader
        eyebrow="Operação"
        title="Aquecimentos"
        subtitle="Esteiras operacionais para aquecer perfis, BMs e contas de anúncio antes da escala."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
            <Flame size={12} />
            playbooks de referência
          </span>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-ink-700/60 pb-2">
        {WARMUP_PLAYBOOKS.map((p) => {
          const isActive = p.id === activeId
          return (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`flex items-center gap-2 rounded-t-md px-3.5 py-2 text-sm transition ${
                isActive
                  ? 'bg-ink-800 font-semibold text-neon-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base leading-none">{p.emoji}</span>
              {p.label}
              {p.steps?.length > 0 && (
                <span className="rounded-md bg-ink-800/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-400">
                  {p.steps.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <section className="surface rounded-xl p-6">
        <WarmupTimeline playbook={active} />
      </section>
    </>
  )
}
