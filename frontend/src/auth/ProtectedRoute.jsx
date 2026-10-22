import { Navigate, Outlet, useLocation } from 'react-router-dom'
import ApiError from '../components/ApiError.jsx'
import LoadingState from '../components/LoadingState.jsx'
import { useAuth } from './useAuth.js'
import './ProtectedRoute.css'

function RoleUnavailable({ role }) {
  return (
    <main className="route-state" aria-labelledby="role-unavailable-title">
      <section className="route-state__panel">
        <p className="eyebrow">ACCESO RESTRINGIDO</p>
        <h1 id="role-unavailable-title">Este espacio no está disponible para tu rol</h1>
        <p>
          Tu cuenta tiene el rol <strong>{role}</strong>. El portal de paciente solo está
          disponible para cuentas con rol PACIENTE.
        </p>
        <a className="route-state__link" href="/">Volver al inicio</a>
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
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && user.rol !== role) {
    return <RoleUnavailable role={user.rol} />
  }

  return <Outlet />
}
