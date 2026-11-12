import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Menu, ChevronDown, House, CalendarDays, ClipboardList, FileText, User, Lock, LogOut,
} from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth.js'
import logoMediQuetzal from '../assets/MediQuetzalbueno.png'
import './PacienteLayout.css'

const SECCIONES = [
  { to: '/paciente', label: 'Inicio', icon: House, end: true },
  { to: '/paciente/citas', label: 'Mis citas', icon: CalendarDays },
  { to: '/paciente/historial', label: 'Mi historial', icon: ClipboardList },
  { to: '/paciente/recetas', label: 'Mis recetas', icon: FileText },
]

const iniciales = (nombre) =>
  nombre.split(' ').map((parte) => parte[0]).slice(0, 2).join('').toUpperCase()

const CLAVE_MENU = 'tm:menu-colapsado'

export default function PacienteLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [cerrandoSesion, setCerrandoSesion] = useState(false)
  const [errorSesion, setErrorSesion] = useState('')
  const [colapsado, setColapsado] = useState(() => {
    try { return localStorage.getItem(CLAVE_MENU) === '1' } catch { return false }
  })
  const menuRef = useRef(null)
  const contenidoRef = useRef(null)
  const nombre = user?.nombre || 'Paciente'

  useEffect(() => {
    contenidoRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  const alternarMenu = () => {
    setColapsado((valor) => {
      try { localStorage.setItem(CLAVE_MENU, valor ? '0' : '1') } catch { /* almacenamiento no disponible */ }
      return !valor
    })
  }

  useEffect(() => {
    if (!abierto) return undefined
    const fuera = (evento) => { if (!menuRef.current?.contains(evento.target)) setAbierto(false) }
    const tecla = (evento) => { if (evento.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  const cerrarSesion = async () => {
    setErrorSesion('')
    setCerrandoSesion(true)
    try {
      await logout()
    } catch (error) {
      setErrorSesion(error?.message || 'No se pudo cerrar la sesión.')
      setCerrandoSesion(false)
    }
  }

  return (
    <div className={`pac ${colapsado ? 'pac--collapsed' : ''}`}>
      <header className="pac__header">
        <div className="pac__brand">
          <button
            type="button"
            className="pac__emblem"
            onClick={alternarMenu}
            aria-label={colapsado ? 'Mostrar menú' : 'Ocultar menú'}
            aria-expanded={!colapsado}
          >
            {colapsado ? <Menu size={20} color="#0e5733" /> : <img src={logoMediQuetzal} alt="Logo MediQuetzal" />}
          </button>
          <Link to="/paciente" className="pac__brand-text">
            <strong>MediQuetzal</strong>
            <small>PLATAFORMA MÉDICA</small>
          </Link>
        </div>

        <div className="pac__account" ref={menuRef}>
          <span className="pac__space">Espacio del paciente</span>
          <span className="pac__sep" />
          <button
            type="button"
            className="pac__user"
            onClick={() => setAbierto((valor) => !valor)}
            aria-haspopup="menu"
            aria-expanded={abierto}
          >
            <span className="pac__avatar">{iniciales(nombre)}</span>
            <span className="pac__name">{nombre}</span>
            <ChevronDown size={16} color="#4f6e5b" className={abierto ? 'is-open' : ''} />
          </button>

          {abierto && (
            <div className="pac__menu" role="menu">
              <NavLink to="/paciente/cuenta" role="menuitem" onClick={() => setAbierto(false)}>
                <User size={16} /> Mi cuenta
              </NavLink>
              <NavLink to="/paciente/cambiar-password" role="menuitem" onClick={() => setAbierto(false)}>
                <Lock size={16} /> Cambiar contraseña
              </NavLink>
              <hr />
              <button type="button" role="menuitem" onClick={cerrarSesion} disabled={cerrandoSesion}>
                <LogOut size={16} /> {cerrandoSesion ? 'Cerrando sesión…' : 'Cerrar sesión'}
              </button>
              {errorSesion && <p className="pac__menu-error" role="alert">{errorSesion}</p>}
            </div>
          )}
        </div>
      </header>

      <div className="pac__body">
        <aside className="pac__nav">
          <nav className="pac__sections">
            <p className="pac__label">Mi salud</p>
            {SECCIONES.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="pac__link">
                <Icon size={19} /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="pac__promo">
            <strong>Tu clínica, siempre organizada.</strong>
            <p>Gestiona tus citas y consulta tus diagnósticos y recetas desde un mismo lugar.</p>
          </div>
        </aside>

        <main className="pac__content" ref={contenidoRef}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
