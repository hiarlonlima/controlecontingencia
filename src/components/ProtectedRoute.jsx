import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { authed, bootstrapping } = useAuth()
  const location = useLocation()

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={14} className="animate-spin text-neon-400" />
          Validando sessão...
        </div>
      </div>
    )
  }

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}
