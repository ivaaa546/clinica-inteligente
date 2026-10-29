import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Plus, Menu, ChevronDown, CalendarDays, Users, LogOut } from 'lucide-react'
import { obtenerMedicoActual } from '../services/medicoService'
import { logout } from '../api/auth'
import type { Medico } from '../types/medico'
// Comparte estructura y estilos con el layout del paciente (mismas clases `pac__*`),
// así ambos espacios se ven igual y no se duplica CSS.
import './PacienteLayout.css'

const SECCIONES = [
  { to: '/medico/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/medico/pacientes', label: 'Mis pacientes', icon: Users },
]

const iniciales = (nombre: string) =>
  nombre.split(' ').filter((p) => /^[A-ZÁÉÍÓÚÑ]/.test(p)).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

// Misma preferencia que el layout del paciente: el menú recuerda si estaba oculto
const CLAVE_MENU = 'tm:menu-colapsado'

export default function MedicoLayout() {
  const { pathname } = useLocation()
  const [medico, setMedico] = useState<Medico | null>(null)
  const [abierto, setAbierto] = useState(false)
  const [colapsado, setColapsado] = useState(() => {
    try { return localStorage.getItem(CLAVE_MENU) === '1' } catch { return false }
  })
  const menuRef = useRef<HTMLDivElement>(null)
  const contenidoRef = useRef<HTMLElement>(null)

  // Médico con sesión iniciada (nombre y avatar de la cabecera)
  useEffect(() => {
    let vigente = true
    obtenerMedicoActual()
      .then((m) => { if (vigente) setMedico(m) })
      .catch(() => { /* la cabecera usa un nombre genérico si falla */ })
    return () => { vigente = false }
  }, [])

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
    try {
      await logout()
      window.location.assign('/login')
    } catch {
      // La sesión local se conserva si el servidor no confirmó el cierre.
    }
  }

  const nombre = medico?.nombre ?? 'Médico'

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
          <Link to="/medico/agenda" className="pac__brand-text">
            <strong>TilinesMédicos</strong>
            <small>PLATAFORMA MÉDICA</small>
          </Link>
        </div>

        <div className="pac__account" ref={menuRef}>
          <span className="pac__space">Espacio del médico</span>
          <span className="pac__sep" />

          <button
            type="button"
            className="pac__user"
            onClick={() => setAbierto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={abierto}
          >
            <span className="pac__avatar">{medico?.iniciales ?? iniciales(nombre)}</span>
            <span className="pac__name">{nombre}</span>
            <ChevronDown size={16} color="#4f6e5b" className={abierto ? 'is-open' : ''} />
          </button>

          {abierto && (
            <div className="pac__menu" role="menu">
              {/* TODO: "Mi cuenta" y "Cambiar contraseña" (pantallas 13 y 14 del Figma) llegan en una etapa posterior */}
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
            <p className="pac__label">Mi práctica</p>
            {SECCIONES.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="pac__link">
                <Icon size={19} /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="pac__promo">
            <strong>Siempre un poco más cerca.</strong>
            <p>Consultas y cuidado, en un mismo lugar.</p>
          </div>
        </aside>

        <main className="pac__content" ref={contenidoRef}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
