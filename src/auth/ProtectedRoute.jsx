import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <p>Loading...</p>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}