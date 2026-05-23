import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../types/user'

export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { isBootstrapping, user } = useAuth()

  if (isBootstrapping) {
    return <div style={{ padding: 16 }}>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <div style={{ padding: 16 }}>403 Forbidden</div>
  }

  return <>{children}</>
}
