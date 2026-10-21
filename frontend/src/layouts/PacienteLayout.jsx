import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, House, CalendarDays, ClipboardList, FileText, User, Lock, LogOut } from 'lucide-react'
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

export default function PacienteLayout() {
  const navigate = useNavigate()

  const cerrarSesion = () => {
    // TODO: limpiar token / sesión
    navigate('/login')
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
          <span className="pac__avatar">{iniciales(USUARIO.nombre)}</span>
          <span className="pac__name">{USUARIO.nombre}</span>
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
            <button type="button" className="pac__logout" onClick={cerrarSesion}>
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="pac__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}