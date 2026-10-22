import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Plus, ChevronDown, House, CalendarDays, ClipboardList, FileText, User, Lock, LogOut } from 'lucide-react'
import ApiError from '../components/ApiError.jsx'
import { useAuth } from '../auth/useAuth.js'
import './PacienteLayout.css'

const SECCIONES = [
  { to: '/paciente', label: 'Inicio', icon: House, end: true },
  { to: '/paciente/citas', label: 'Mis citas', icon: CalendarDays },
  { to: '/paciente/historial', label: 'Mi historial', icon: ClipboardList },
  { to: '/paciente/recetas', label: 'Mis recetas', icon: FileText },
]

const iniciales = (nombre) =>
  nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

export default function PacienteLayout() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)
  const nombre = user?.nombre || 'Paciente'

  const cerrarSesion = async () => {
    setLogoutError(null)
    setIsLoggingOut(true)

    try {
      await logout()
    } catch (error) {
      setLogoutError(error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="pac">
      <header className="pac__header">
        <Link to="/paciente" className="pac__brand">
          <span className="pac__emblem"><Plus size={22} color="#fff" /></span>
          <span className="pac__brand-text">
            <strong>TilinesMédicos</strong>
            <small>PLATAFORMA MÉDICA</small>
          </span>
        </Link>

        <div className="pac__account">
          <span className="pac__space">Espacio del paciente</span>
          <span className="pac__sep" />
          <span className="pac__avatar">{iniciales(nombre)}</span>
          <span className="pac__name">{nombre}</span>
          <ChevronDown size={16} color="#4f6e5b" />
        </div>
      </header>

      <div className="pac__body">
        <aside className="pac__nav">
          <nav className="pac__sections">
            <p className="pac__label">Mi salud</p>
            {SECCIONES.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="pac__link">
                <Icon size={20} /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="pac__foot">
            <div className="pac__promo">
              <strong>Tu clínica, siempre organizada.</strong>
              <p>Gestiona tus citas y consulta tus diagnósticos y recetas desde un mismo lugar.</p>
            </div>

            <div className="pac__account-links">
              <NavLink to="/paciente/cuenta"><User size={16} /> Mi cuenta</NavLink>
              <NavLink to="/paciente/cambiar-password"><Lock size={16} /> Cambiar contraseña</NavLink>
            </div>

            <hr />
            <button type="button" className="pac__logout" onClick={cerrarSesion} disabled={isLoggingOut}>
              <LogOut size={18} /> {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </div>
        </aside>

        <main className="pac__content">
          {logoutError && <ApiError error={logoutError} title="No se pudo cerrar la sesión" />}
          <Outlet />
        </main>
      </div>
    </div>
  )
}