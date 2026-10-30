import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Menu, ChevronDown, Users, Briefcase, CalendarDays, BarChart3, Info, LogOut, UserCog } from 'lucide-react'
import { useSesion } from '../auth/useSesion'
// Misma estructura que los demás espacios (clases `esp__*`) con ajustes propios del administrador
import './EspacioLayout.css'
import './AdminLayout.css'

const SECCIONES = [
  { to: '/admin/usuarios', label: 'Usuarios', detalle: 'Cuentas y accesos', icon: Users },
  { to: '/admin/especialidades', label: 'Especialidades', detalle: '', icon: Briefcase },
  { to: '/admin/citas', label: 'Citas', detalle: '', icon: CalendarDays },
  { to: '/admin/metricas', label: 'Métricas', detalle: '', icon: BarChart3 },
]

const iniciales = (nombre: string) =>
  nombre.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

const CLAVE_MENU = 'tm:menu-colapsado'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useSesion()
  const nombre = user?.nombre ?? 'Administrador'
  const [abierto, setAbierto] = useState(false)
  const [colapsado, setColapsado] = useState(() => {
    try { return localStorage.getItem(CLAVE_MENU) === '1' } catch { return false }
  })
  const menuRef = useRef<HTMLDivElement>(null)
  const contenidoRef = useRef<HTMLElement>(null)

  useEffect(() => { contenidoRef.current?.scrollTo({ top: 0 }) }, [pathname])

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setAbierto(false) }
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  const alternarMenu = () => {
    setColapsado((v) => {
      try { localStorage.setItem(CLAVE_MENU, v ? '0' : '1') } catch { /* sin almacenamiento */ }
      return !v
    })
  }

  const cerrarSesion = async () => {
    setAbierto(false)
    try { await logout() } finally { navigate('/acceso-personal') }
  }

  return (
    <div className={`esp adm ${colapsado ? 'esp--collapsed' : ''}`}>
      <header className="esp__header">
        <div className="esp__brand">
          <button type="button" className="esp__emblem" onClick={alternarMenu} aria-label={colapsado ? 'Mostrar menú' : 'Ocultar menú'} aria-expanded={!colapsado}>
            {colapsado ? <Menu size={20} color="#fff" /> : <Plus size={20} color="#fff" />}
          </button>
          <Link to="/admin/usuarios" className="esp__brand-text">
            <strong>TilinesMédicos</strong>
            <small>PLATAFORMA MÉDICA</small>
          </Link>
        </div>

        <div className="esp__account" ref={menuRef}>
          <span className="esp__space">Administración no clínica</span>
          <span className="esp__sep" />
          <Link to="/admin/cuenta" className="esp__space adm__cuenta">Mi cuenta</Link>

          <button type="button" className="esp__user" onClick={() => setAbierto((v) => !v)} aria-haspopup="menu" aria-expanded={abierto}>
            <span className="esp__avatar">{iniciales(nombre)}</span>
            <span className="adm__quien">
              <span className="esp__name">{nombre}</span>
              <small>Administrador</small>
            </span>
            <ChevronDown size={16} color="#4f6e5b" className={abierto ? 'is-open' : ''} />
          </button>

          {abierto && (
            <div className="esp__menu" role="menu">
              <Link to="/admin/cuenta" role="menuitem" onClick={() => setAbierto(false)}><UserCog size={16} /> Mi cuenta</Link>
              <hr />
              <button type="button" role="menuitem" onClick={cerrarSesion}><LogOut size={16} /> Cerrar sesión</button>
            </div>
          )}
        </div>
      </header>

      <div className="esp__body">
        <aside className="esp__nav">
          <nav className="esp__sections" aria-label="Administración">
            {SECCIONES.map(({ to, label, detalle, icon: Icon }) => (
              <NavLink key={to} to={to} className="esp__link adm__link">
                <span className="adm__icono"><Icon size={17} /></span>
                <span className="adm__texto">
                  <strong>{label}</strong>
                  {detalle && <small>{detalle}</small>}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="adm__pie">
            <div className="esp__promo">
              <strong><Info size={14} aria-hidden="true" /> Gestión administrativa</strong>
              <p>Usuarios, especialidades, citas y métricas. Sin acceso a información clínica.</p>
            </div>
            <Link to="/admin/cuenta" className="adm__enlace">Mi cuenta</Link>
            <button type="button" className="adm__enlace" onClick={cerrarSesion}>Cerrar sesión</button>
          </div>
        </aside>

        <main className="esp__content" ref={contenidoRef}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
