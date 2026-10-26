import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Plus, Menu, ChevronDown, House, CalendarDays, ClipboardList, FileText, User, Lock, LogOut,
} from 'lucide-react'
import { cerrarSesion as cerrarSesionApi } from '../services/authService'
import './PacienteLayout.css'

// TODO: reemplazar por el usuario real que devuelva la API
const USUARIO = { nombre: 'Tilin Insano' }

const SECCIONES = [
  { to: '/paciente', label: 'Inicio', icon: House, end: true },
  { to: '/paciente/citas', label: 'Mis citas', icon: CalendarDays },
  { to: '/paciente/historial', label: 'Mi historial', icon: ClipboardList },
  { to: '/paciente/recetas', label: 'Mis recetas', icon: FileText },
]

const iniciales = (nombre) =>
  nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

const CLAVE_MENU = 'tm:menu-colapsado'

export default function PacienteLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [colapsado, setColapsado] = useState(() => {
    try { return localStorage.getItem(CLAVE_MENU) === '1' } catch { return false }
  })
  const menuRef = useRef(null)
  const contenidoRef = useRef(null)

  // Cada pantalla nueva empieza desde arriba (no hereda el scroll de la anterior)
  useEffect(() => {
    contenidoRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  const alternarMenu = () => {
    setColapsado((v) => {
      try { localStorage.setItem(CLAVE_MENU, v ? '0' : '1') } catch { /* sin almacenamiento */ }
      return !v
    })
  }

  // Cierra el menú al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => { if (!menuRef.current?.contains(e.target)) setAbierto(false) }
    const tecla = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  const cerrarSesion = async () => {
    setAbierto(false)
    try { await cerrarSesionApi() } finally { navigate('/login') }
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
            {colapsado ? <Menu size={20} color="#fff" /> : <Plus size={20} color="#fff" />}
          </button>
          <Link to="/paciente" className="pac__brand-text">
            <strong>TilinesMédicos</strong>
            <small>PLATAFORMA MÉDICA</small>
          </Link>
        </div>

        <div className="pac__account" ref={menuRef}>
          <span className="pac__space">Espacio del paciente</span>
          <span className="pac__sep" />

          <button
            type="button"
            className="pac__user"
            onClick={() => setAbierto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={abierto}
          >
            <span className="pac__avatar">{iniciales(USUARIO.nombre)}</span>
            <span className="pac__name">{USUARIO.nombre}</span>
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
              <button type="button" role="menuitem" onClick={cerrarSesion}>
                <LogOut size={16} /> Cerrar sesión
              </button>
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
