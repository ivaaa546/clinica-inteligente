import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Lock, Stethoscope, Mail, Eye, EyeOff, ArrowRight, Info } from 'lucide-react'
import { useSesion } from '../auth/useSesion'
import { esCorreo } from '../lib/texto'
// Misma estructura visual que el login de pacientes: se reutilizan sus estilos
import './Login.css'
import './PersonalLogin.css'

const INICIO = { MEDICO: '/medico/agenda', ADMINISTRADOR: '/admin/usuarios' } as const
const MENSAJE_CREDENCIALES = 'Credenciales incorrectas o cuenta no disponible.'

export default function PersonalLogin() {
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const { user, login, logout } = useSesion()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Si ya hay una sesión de personal abierta se ofrece continuar (un paciente no cuenta: este acceso no es para él)
  const sesionActiva = user && user.rol !== 'PACIENTE' ? user : null

  const entrar = async (e: FormEvent) => {
    e.preventDefault()
    if (enviando) return
    setError('')
    if (!correo.trim() || !contrasena) return setError('Ingresa tu correo institucional y tu contraseña.')
    if (!esCorreo(correo)) return setError('Escribe un correo electrónico válido.')

    setEnviando(true)
    try {
      const sesion = await login({ email: correo.trim(), password: contrasena })
      if (sesion.rol === 'PACIENTE') {
        // Este acceso es solo para personal: se cierra la sesión y se responde igual que con credenciales erróneas
        await logout()
        throw new Error(MENSAJE_CREDENCIALES)
      }
      // Si venía de una pantalla protegida de su propio espacio, vuelve a ella
      const desde = (ubicacion.state as { from?: string } | null)?.from
      const prefijo = sesion.rol === 'MEDICO' ? '/medico' : '/admin'
      navigate(desde && desde.startsWith(prefijo) ? desde : INICIO[sesion.rol], { replace: true })
    } catch (err) {
      const sinConexion = (err as { isNetworkError?: boolean }).isNetworkError
      setError(sinConexion ? 'No fue posible conectar con el servicio. Verifica tu conexión e inténtalo nuevamente.' : MENSAJE_CREDENCIALES)
    } finally {
      setEnviando(false)
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
        <span className="pl-area"><Lock size={14} aria-hidden="true" /> Área interna</span>
      </header>

      <main className="login__main">
        <aside className="welcome">
          <p className="welcome__eyebrow">ESPACIO DE TRABAJO</p>
          <h1 className="welcome__title">Conectados<br />para cuidar.</h1>
          <p className="welcome__text">Un acceso independiente para el equipo de TilinesMédicos.</p>

          <div className="care" aria-hidden="true">
            <div className="care__halo" />
            <div className="care__arch" />
            <Stethoscope className="care__icon" size={64} color="#fff" strokeWidth={1.5} />
          </div>

          <p className="welcome__footer">TilinesMédicos · Acceso de personal</p>
        </aside>

        <section className="form-panel">
          <div className="form-panel__intro">
            <p className="eyebrow">MÉDICOS Y ADMINISTRADORES</p>
            <h2>Acceso de personal</h2>
            <p>Ingresa con las credenciales de tu cuenta institucional.</p>
          </div>

          <hr className="divider" />

          {sesionActiva && (
            <p className="pl-sesion" role="status">
              Ya tienes una sesión iniciada como <strong>{sesionActiva.nombre}</strong>.{' '}
              <Link to={INICIO[sesionActiva.rol as 'MEDICO' | 'ADMINISTRADOR']}>Continuar</Link>
            </p>
          )}

          <form className="form" onSubmit={entrar} noValidate>
            <label className="field">
              <span className="field__label">Correo institucional</span>
              <span className="field__input">
                <input
                  type="email" placeholder="Ingresa tu correo institucional" value={correo} autoComplete="username"
                  onChange={(e) => setCorreo(e.target.value)}
                />
                <Mail size={18} color="#4f6e5b" />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Contraseña</span>
              <span className="field__input">
                <input
                  type={ver ? 'text' : 'password'} placeholder="Ingresa tu contraseña" value={contrasena} autoComplete="current-password"
                  onChange={(e) => setContrasena(e.target.value)}
                />
                <button type="button" className="field__toggle" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {ver ? <Eye size={18} color="#4f6e5b" /> : <EyeOff size={18} color="#4f6e5b" />}
                </button>
              </span>
            </label>

            <div className="pl-olvido"><Link to="/recuperar" className="link-strong">¿Olvidaste tu contraseña?</Link></div>

            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? 'Ingresando...' : <>Ingresar <ArrowRight size={18} aria-hidden="true" /></>}
            </button>

            <p className="pl-nota"><Info size={14} aria-hidden="true" /> El acceso depende de tu cuenta y permisos</p>
          </form>

          {error && <p className="pl-error" role="alert"><Info size={15} aria-hidden="true" /> {error}</p>}

          <footer className="pl-pie">
            <p>Las cuentas de médicos las crea el administrador.</p>
            <strong>Acceso exclusivo para personal con una cuenta activa.</strong>
          </footer>
        </section>
      </main>
    </div>
  )
}
