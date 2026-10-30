import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Menu, ChevronDown, CalendarDays, Users, LogOut, UserCog } from 'lucide-react'
import { useSesion } from '../features/auth/hooks/useSesion'
// Estructura y estilos compartidos con el panel del administrador (clases `esp__*`).
// Es independiente del layout del paciente.
import './EspacioLayout.css'
import './MedicoLayout.css'

const SECCIONES = [
  { to: '/medico/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/medico/pacientes', label: 'Mis pacientes', icon: Users },
]

const iniciales = (nombre: string) =>
  nombre.split(' ').filter((p) => /^[A-ZÁÉÍÓÚÑ]/.test(p)).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

// Misma preferencia que el layout del paciente: el menú recuerda si estaba oculto
const CLAVE_MENU = 'tm:menu-colapsado'

export default function MedicoLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useSesion()
  const [abierto, setAbierto] = useState(false)
  const [colapsado, setColapsado] = useState(() => {
    try { return localStorage.getItem(CLAVE_MENU) === '1' } catch { return false }
  })
  const menuRef = useRef<HTMLDivElement>(null)
  const contenidoRef = useRef<HTMLElement>(null)

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
    const fuera = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setAbierto(false)
    }
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  const cerrarSesion = async () => {
    setAbierto(false)
    try { await logout() } finally { navigate('/acceso-personal') }
  }

  const nombre = user?.nombre ?? 'Médico'

  return (
    <div className={`esp ${colapsado ? 'esp--collapsed' : ''}`}>
      <header className="esp__header">
        <div className="esp__brand">
          <button
            type="button"
            className="esp__emblem"
            onClick={alternarMenu}
            aria-label={colapsado ? 'Mostrar menú' : 'Ocultar menú'}
            aria-expanded={!colapsado}
          >
            {colapsado ? <Menu size={20} color="#fff" /> : <Plus size={20} color="#fff" />}
          </button>
          <Link to="/medico/agenda" className="esp__brand-text">
            <strong>TilinesMédicos</strong>
            <small>PLATAFORMA MÉDICA</small>
          </Link>
        </div>

        <div className="esp__account" ref={menuRef}>
          <span className="esp__space">Espacio del médico</span>
          <span className="esp__sep" />
          <Link to="/medico/cuenta" className="esp__space med__cuenta">
            Mi cuenta
            <small>Cambiar contraseña</small>
          </Link>

          <button
            type="button"
            className="esp__user"
            onClick={() => setAbierto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={abierto}
          >
            <span className="esp__avatar">{iniciales(nombre)}</span>
            <span className="esp__name">{nombre}</span>
            <ChevronDown size={16} color="#4f6e5b" className={abierto ? 'is-open' : ''} />
          </button>

          {abierto && (
            <div className="esp__menu" role="menu">
              <Link to="/medico/cuenta" role="menuitem" onClick={() => setAbierto(false)}>
                <UserCog size={16} /> Mi cuenta
              </Link>
              <hr />
              <button type="button" role="menuitem" onClick={cerrarSesion}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="esp__body">
        <aside className="esp__nav">
          <nav className="esp__sections">
            <p className="esp__label">Mi práctica</p>
            {SECCIONES.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="esp__link">
                <Icon size={19} /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="esp__promo">
            <strong>Siempre un poco más cerca.</strong>
            <p>Consultas y cuidado, en un mismo lugar.</p>
          </div>
        </aside>

        <main className="esp__content" ref={contenidoRef}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
