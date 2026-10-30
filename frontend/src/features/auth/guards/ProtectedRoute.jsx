import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import ApiError from '../../../shared/components/ApiError.jsx'
import LoadingState from '../../../shared/components/LoadingState.jsx'
import { useAuth } from '../hooks/useAuth.js'
import './ProtectedRoute.css'

import { accessRouteFor, homeRouteFor, requestedPathFor } from './routePolicy'

function RoleUnavailable({ actualRole, requiredRole }) {
  const home = homeRouteFor(actualRole)

  return (
    <main className="route-state" aria-labelledby="role-unavailable-title">
      <section className="route-state__panel">
        <p className="eyebrow">ACCESO RESTRINGIDO</p>
        <h1 id="role-unavailable-title">Este espacio no está disponible para tu rol</h1>
        <p>
          Tu cuenta tiene el rol <strong>{actualRole}</strong>, pero esta sección requiere
          <strong> {requiredRole}</strong>.
        </p>
        <Link className="route-state__link" to={home}>Ir a mi espacio</Link>
      </section>
    </main>
  )
}

export default function ProtectedRoute({ role }) {
  const { status, user, refreshSession } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return <LoadingState message="Comprobando tu sesión…" />
  }

  if (status === 'error') {
    return <ApiError title="No pudimos comprobar tu sesión" onRetry={refreshSession} />
  }

  if (!user) {
    const accessRoute = accessRouteFor(role)
    const from = requestedPathFor(location)
    return <Navigate to={accessRoute} replace state={{ from }} />
  }

  if (role && user.rol !== role) {
    return <RoleUnavailable actualRole={user.rol} requiredRole={role} />
  }

  return <Outlet />
}
