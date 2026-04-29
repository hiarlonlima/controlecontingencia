import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  KanbanSquare,
  UserPlus,
  Building2,
  FileBarChart2,
  Flame,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/kanban/perfis', label: 'Kanban de Perfis', icon: KanbanSquare },
  { to: '/kanban/bms', label: 'Kanban de BMs', icon: KanbanSquare },
  { to: '/cadastro/perfil', label: 'Cadastro de Perfil', icon: UserPlus },
  { to: '/cadastro/bm', label: 'Cadastro de BM', icon: Building2 },
  { to: '/aquecimentos', label: 'Aquecimentos', icon: Flame },
  { to: '/relatorios', label: 'Relatórios', icon: FileBarChart2 },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const { logout } = useAuth()
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-ink-700/60 bg-ink-900/70 px-4 py-5 backdrop-blur-md">
      <div className="mb-7 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-400 to-cyan-700 shadow-glow">
          <ShieldCheck size={18} className="text-ink-950" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Contingência</p>
          <p className="text-[11px] uppercase tracking-widest text-slate-500">
            FB Ads · Console
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-ink-700/50 pt-4">
        <button
          onClick={logout}
          className="nav-item w-full text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
        <p className="mt-3 px-1 text-[11px] text-slate-500">
          v0.1.0 · Local Storage
        </p>
      </div>
    </aside>
  )
}
