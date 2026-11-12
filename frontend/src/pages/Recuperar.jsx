import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'
import './Login.css'
import './Recuperar.css'
import logoMediQuetzal from '../assets/MediQuetzalbueno.png'

export default function Recuperar() {
  return (
    <div className="login recuperar">
      <header className="login__header">
        <Link to="/" className="brand">
          <span className="brand__emblem"><img src={logoMediQuetzal} alt="Logo MediQuetzal" /></span>
          <span className="brand__text">
            <strong>MediQuetzal</strong>
            <small>PLATAFORMA MÉDICA</small>
          </span>
        </Link>
        <span className="recuperar__top">Acceso a tu cuenta</span>
      </header>

      <main className="login__main">
        <aside className="welcome welcome--brand">
          <p className="welcome__eyebrow">TU CUENTA, PROTEGIDA</p>
          <h1 className="welcome__title">Vuelve a tu espacio de cuidado.</h1>
          <p className="welcome__text">
            Recupera el acceso a MediQuetzal sin compartir tu contraseña con nadie.
          </p>
          <div className="login-brandmark" aria-hidden="true">
            <img src={logoMediQuetzal} alt="" />
          </div>
          <hr className="welcome__divider" />
          <p className="welcome__note">Para pacientes, médicos y administradores.</p>
        </aside>

        <section className="form-panel recuperar__panel">
          <div className="form-panel__intro">
            <h2>Recuperar contraseña</h2>
            <p>La recuperación de contraseña todavía no está disponible.</p>
          </div>

          <hr className="divider divider--green" />

          <div className="recuperar__unavailable" role="status">
            <Info size={18} color="#0e5733" aria-hidden="true" />
            <div>
              <strong>Función fuera de alcance</strong>
              <p>
                No existe un servicio de correo ni un endpoint para restablecer contraseñas en
                esta versión. No ingreses tu correo aquí: no se enviará ningún enlace.
              </p>
            </div>
          </div>

          <hr className="divider divider--green" />

          <Link to="/login" className="recuperar__back">← Volver al acceso</Link>
          <p className="recuperar__tip">Por seguridad, no compartas tu contraseña con nadie.</p>
        </section>
      </main>
    </div>
  )
}
