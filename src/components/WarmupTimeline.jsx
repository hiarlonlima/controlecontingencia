import { CheckCircle2, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TONE_STYLES } from '../utils/constants.js'

function StepCard({ step, isLast }) {
  const tone = TONE_STYLES[step.tone] ?? TONE_STYLES.cyan
  const isMilestone = !!step.isMilestone

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Linha vertical conectora */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[19px] top-10 h-[calc(100%-30px)] w-px bg-gradient-to-b from-ink-700/80 to-transparent"
        />
      )}

      {/* Bolinha do timeline */}
      <span
        className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${tone.border} ${tone.bg}`}
      >
        {isMilestone ? (
          <Sparkles size={16} className={tone.text} />
        ) : (
          <span className={`text-xs font-bold uppercase tracking-wide ${tone.text}`}>
            {step.day.replace(/^Dia /, '').replace(/^Fase$/, '★')}
          </span>
        )}
      </span>

      <div
        className={`flex-1 rounded-xl border p-4 transition ${
          isMilestone
            ? 'border-violet-500/30 bg-violet-500/5'
            : 'border-ink-700/60 bg-ink-850/60'
        }`}
      >
        <header className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`chip ${tone.bg} ${tone.border} ${tone.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            {step.day}
          </span>
          <h3 className="text-sm font-semibold text-slate-50">{step.title}</h3>
        </header>

        {step.description && (
          <p className="mb-3 text-xs text-slate-300">{step.description}</p>
        )}

        <ul className="space-y-1.5">
          {step.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2
                size={12}
                className={`mt-0.5 shrink-0 ${tone.text}`}
                strokeWidth={2.5}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {step.goal && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-ink-700/60 bg-ink-900/60 px-3 py-2">
            <Target size={13} className="mt-0.5 shrink-0 text-neon-300" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neon-300">
                Objetivo
              </p>
              <p className="text-xs text-slate-200">{step.goal}</p>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

export default function WarmupTimeline({ playbook }) {
  if (!playbook) return null
  const hasSteps = !!playbook.steps?.length

  return (
    <div>
      <header className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-50">
          <span className="text-2xl leading-none">{playbook.emoji}</span>
          {playbook.title}
        </h2>
        {playbook.description && (
          <p className="mt-1.5 max-w-3xl text-sm text-slate-400">{playbook.description}</p>
        )}
        {playbook.duration && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-ink-700/60 bg-ink-850/60 px-2 py-1 text-[11px] uppercase tracking-wider text-slate-400">
            duração estimada · {playbook.duration}
          </p>
        )}
      </header>

      {hasSteps ? (
        <ol className="relative">
          {playbook.steps.map((step, idx) => (
            <StepCard
              key={step.id}
              step={step}
              isLast={idx === playbook.steps.length - 1}
            />
          ))}
        </ol>
      ) : (
        <div className="surface flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neon-500/10 text-2xl">
            {playbook.emoji}
          </span>
          <h3 className="text-base font-semibold text-slate-100">
            {playbook.emptyState?.title || 'Esteira ainda não definida'}
          </h3>
          {playbook.emptyState?.description && (
            <p className="mt-1.5 max-w-md text-sm text-slate-400">
              {playbook.emptyState.description}
            </p>
          )}
          {playbook.emptyState?.cta && (
            <Link to={playbook.emptyState.cta.href} className="btn-primary mt-5">
              {playbook.emptyState.cta.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
