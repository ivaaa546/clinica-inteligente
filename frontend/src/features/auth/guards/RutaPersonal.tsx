import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import ApiError from '../../../shared/components/ApiError.jsx'
import LoadingState from '../../../shared/components/LoadingState.jsx'
import { useSesion } from '../hooks/useSesion'
import './RutaPersonal.css'

interface Props {
  /** Espacio que protege: solo entra quien tenga ese rol */
  rol: 'MEDICO' | 'ADMINISTRADOR'
}

const ESPACIO = {
  MEDICO: { nombre: 'espacio del médico', ruta: '/medico' },
  ADMINISTRADOR: { nombre: 'panel de administración', ruta: '/admin' },
}

/**
 * Protege las rutas del personal con la sesión real (`AuthProvider`). Es la versión de `ProtectedRoute` para
 * médicos y administradores: sin sesión envía al acceso de personal (no al login de pacientes) y, si el rol
 * no corresponde, explica y ofrece ir al espacio propio.
 */
export default function RutaPersonal({ rol }: Props) {
  const { status, user, refreshSession, logout } = useSesion()
  const ubicacion = useLocation()

  if (status === 'checking') return <LoadingState message="Comprobando tu sesión…" />
  if (status === 'error') return <ApiError error={null} title="No pudimos comprobar tu sesión" onRetry={refreshSession} />
  if (!user) return <Navigate to="/acceso-personal" replace state={{ from: ubicacion.pathname }} />
  if (user.rol === rol) return <Outlet />

  const propio = user.rol === 'PACIENTE' ? { nombre: 'portal de paciente', ruta: '/paciente' } : ESPACIO[user.rol]
  return (
    <div className="rp">
      <h1>No tienes acceso al {ESPACIO[rol].nombre}</h1>
      <p>Tu cuenta tiene el rol {user.rol}. Cada rol tiene su propio espacio.</p>
      <div className="rp__acciones">
        <Link to={propio.ruta} className="rp__btn rp__btn--primario">Ir al {propio.nombre}</Link>
        <button type="button" className="rp__btn" onClick={() => void logout()}>Cerrar sesión</button>
      </div>
    </div>
  )
}
