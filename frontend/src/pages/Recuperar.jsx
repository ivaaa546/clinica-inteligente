import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, LockKeyhole, Mail, Info } from 'lucide-react'
import { recuperarPassword } from '../services/authService'
import './Login.css'       // reutiliza cabecera, panel verde y campos
import './Recuperar.css'

export default function Recuperar() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await recuperarPassword(email)
      setEnviado(true) // siempre el mismo mensaje, exista o no el correo
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login recuperar">
      <header className="login__header">
        <Link to="/" className="brand">
          <span className="brand__emblem"><Plus size={22} color="#fff" /></span>
          <span className="brand__text">
            <strong>TilinesMédicos</strong>
            <small>PLATAFORMA MÉDICA</small>
          </span>
        </Link>
        <span className="recuperar__top">Acceso a tu cuenta</span>
      </header>

      <main className="login__main">
        <aside className="welcome">
          <p className="welcome__eyebrow">TU CUENTA, PROTEGIDA</p>
          <h1 className="welcome__title">Vuelve a tu espacio de cuidado.</h1>
          <p className="welcome__text">
            Recupera el acceso a TilinesMédicos sin compartir tu contraseña con nadie.
          </p>
          <div className="lock" aria-hidden="true">
            <LockKeyhole size={48} color="#fff" strokeWidth={1.5} />
          </div>
          <hr className="welcome__divider" />
          <p className="welcome__note">Para pacientes, médicos y administradores.</p>
        </aside>

        <section className="form-panel recuperar__panel">
          <div className="form-panel__intro">
            <h2>Recuperar contraseña</h2>
            <p>Escribe el correo que utilizas para acceder a tu cuenta.</p>
          </div>

          <hr className="divider divider--green" />

          <form className="recuperar__form" onSubmit={handleSubmit}>
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

            {error && <p className="form__error" role="alert">{error}</p>}

            <button type="submit" className="btn-solid-green" disabled={enviando}>
              <Mail size={18} /> {enviando ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          {enviado && (
            <div className="respuesta" role="status">
              <div className="aviso">
                <Info size={16} color="#0e5733" />
                <p>
                  Si existe una cuenta asociada a este correo, recibirás un enlace con
                  instrucciones para definir una nueva contraseña.
                </p>
              </div>
              <small>Por seguridad, no confirmamos si el correo está registrado.</small>
            </div>
          )}

          <hr className="divider divider--green" />

          <Link to="/login" className="recuperar__back">← Volver al acceso</Link>
          <p className="recuperar__tip">Por seguridad, no compartas el enlace ni tu nueva contraseña.</p>
        </section>
      </main>
    </div>
  )
}
