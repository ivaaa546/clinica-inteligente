import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import {
  Plus, HeartHandshake, Sprout, Calendar, FileText, Pill,
  Mail, Eye, EyeOff, ArrowRight, UserPlus,
} from 'lucide-react'
import './Login.css'

const BENEFICIOS = [
  { icon: Calendar, texto: 'Consulta y agenda tus próximas citas' },
  { icon: FileText, texto: 'Revisa tus diagnósticos y resúmenes' },
  { icon: Pill, texto: 'Descarga tus recetas y documentos' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [recordar, setRecordar] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const session = await login({ email, password })
      const destinations = {
        PACIENTE: '/paciente',
        MEDICO: '/medico/agenda',
        ADMINISTRADOR: '/admin/usuarios',
      }
      const destination = destinations[session?.rol] || '/login'
      const requestedPath = location.state?.from
      const canRestorePatientPath = session?.rol === 'PACIENTE' && requestedPath?.startsWith('/paciente')
      navigate(canRestorePatientPath ? requestedPath : destination, { replace: true })
    } catch (error) {
      setErrorMessage(error?.isNetworkError
        ? 'No fue posible conectar con el servicio. Verificá tu conexión e intentá nuevamente.'
        : 'No pudimos iniciar sesión con esos datos. Revisá tu correo y contraseña e intentá nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login">
      <header className="login__header">
        <Link to="/" className="brand">
          <span className="brand__emblem"><Plus size={22} color="#fff" /></span>
          <span className="brand__text">
            <strong>TilinesMédicos</strong>
            <small>PLATAFORMA MÉDICA</small>
          </span>
        </Link>
        <Link to="/" className="login__back">← Volver al inicio</Link>
      </header>

      <main className="login__main">
        <aside className="welcome">
          <p className="welcome__eyebrow">PORTAL DE PACIENTES</p>
          <h1 className="welcome__title">
            Tus citas,<br />diagnósticos<br />y recetas.
          </h1>
          <p className="welcome__text">
            Consulta tus citas, revisa diagnósticos y descarga recetas desde un
            solo lugar, de forma segura y sencilla.
          </p>

          <div className="care" aria-hidden="true">
            <div className="care__halo" />
            <div className="care__arch" />
            <HeartHandshake className="care__icon" size={64} color="#fff" strokeWidth={1.5} />
            <div className="care__card">
              <span className="care__card-icon"><Sprout size={22} color="#fff" /></span>
              <div>
                <strong>Tus citas, diagnósticos y recetas</strong>
                <span>Todo en un solo lugar, para ti.</span>
              </div>
            </div>
          </div>

          <ul className="benefits">
            {BENEFICIOS.map(({ icon: Icon, texto }) => (
              <li key={texto}>
                <span className="benefits__icon"><Icon size={14} color="#e5f3e4" /></span>
                {texto}
              </li>
            ))}
          </ul>

          <p className="welcome__footer">Portal de pacientes · TilinesMédicos</p>
        </aside>

        <section className="form-panel">
          <div className="form-panel__intro">
            <p className="eyebrow">ACCESO DE PACIENTES</p>
            <h2>Inicia sesión</h2>
            <p>Ingresa con tu correo y contraseña para acceder a tus citas, diagnósticos y recetas.</p>
          </div>

          <hr className="divider" />

          {location.state?.registrationSuccess && (
            <p className="form-success" role="status">{location.state.registrationSuccess}</p>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Correo electrónico</span>
              <span className="field__input">
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} color="#4f6e5b" />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Contraseña</span>
              <span className="field__input">
                <input
                  type={verPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="field__toggle"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verPassword ? <Eye size={18} color="#4f6e5b" /> : <EyeOff size={18} color="#4f6e5b" />}
                </button>
              </span>
            </label>

            <div className="form__help">
              <label className="check">
                <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
                Recordarme
              </label>
              <Link to="/recuperar" className="link-strong">¿Olvidaste tu contraseña?</Link>
            </div>

            {errorMessage && (
              <p className="form-error" role="alert">{errorMessage}</p>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <ArrowRight size={18} /> {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="register">
            <hr className="divider" />
            <p>¿No tienes cuenta de paciente?</p>
            <Link to="/registro" className="btn-soft">
              <UserPlus size={14} /> Crear cuenta de paciente →
            </Link>
          </div>

          <footer className="form-panel__footer">
            <hr className="divider" />
            <nav>
              <Link to="/">Volver al inicio</Link><span>·</span>
              <Link to="/privacidad">Aviso de privacidad</Link><span>·</span>
              <Link to="/soporte">Soporte técnico</Link>
            </nav>
            <small>© 2026 TilinesMédicos · Portal de pacientes</small>
          </footer>
        </section>
      </main>
    </div>
  )
}
