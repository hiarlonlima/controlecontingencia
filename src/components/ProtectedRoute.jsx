import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { authed } = useAuth()
  const location = useLocation()
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}
