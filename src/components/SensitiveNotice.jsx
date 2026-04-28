import { ShieldAlert } from 'lucide-react'

export default function SensitiveNotice({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200">
      <ShieldAlert size={13} className="mt-0.5 shrink-0" />
      <span>
        {children ||
          'Dados sensíveis. Senhas e 2FA ficam ocultos por padrão — clique no olho para visualizar e tenha cuidado em telas compartilhadas.'}
      </span>
    </div>
  )
}
