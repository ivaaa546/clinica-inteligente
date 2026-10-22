import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Info, Check } from 'lucide-react'
import './Cuenta.css'

const VACIO = { actual: '', nueva: '', confirmar: '' }

export default function CambiarPassword() {
  const navigate = useNavigate()
  const [clave, setClave] = useState(VACIO)
  const [ver, setVer] = useState({ actual: false, nueva: false, confirmar: false })
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)

  const cambiar = (e) => { setClave({ ...clave, [e.target.name]: e.target.value }); setListo(false) }

  const guardar = (e) => {
    e.preventDefault()
    if (clave.nueva.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.')
    if (clave.nueva !== clave.confirmar) return setError('La nueva contraseña y su confirmación no coinciden.')
    setError('')
    // TODO: conectar con la API (POST /auth/cambiar-password)
    console.log('Cambiar contraseña')
    setClave(VACIO)
    setListo(true)
  }

  const campo = (name, label) => (
    <label className="cta-field">
      <span>{label}</span>
      <span className="cta-pass">
        <input
          name={name}
          type={ver[name] ? 'text' : 'password'}
          placeholder="••••••••••••"
          value={clave[name]}
          onChange={cambiar}
          autoComplete={name === 'actual' ? 'current-password' : 'new-password'}
          required
        />
        <button
          type="button"
          onClick={() => setVer({ ...ver, [name]: !ver[name] })}
          aria-label={ver[name] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {ver[name] ? <Eye size={18} color="#4f6e5b" /> : <EyeOff size={18} color="#4f6e5b" />}
        </button>
      </span>
    </label>
  )

  return (
    <form className="cta cta--narrow" onSubmit={guardar}>
      <Link to="/paciente" className="cta-back">← Volver a mi espacio</Link>

      <div className="cta-head">
        <h1>Cambiar contraseña</h1>
        <p>Cuida el acceso a tu cuenta actualizando tu contraseña.</p>
      </div>

      <section className="cta-panel">
        <div className="cta-fields cta-fields--one">
          {campo('actual', 'Contraseña actual')}
          {campo('nueva', 'Nueva contraseña')}
          {campo('confirmar', 'Confirmar nueva contraseña')}
        </div>

        <div className="cta-note">
          <Info size={16} color="#0e5733" />
          <p>La nueva contraseña y su confirmación deben coincidir. Usa al menos 8 caracteres.</p>
        </div>

        {error && <p className="cta-error" role="alert">{error}</p>}
        {listo && <p className="cta-ok" role="status">Tu contraseña se actualizó correctamente.</p>}

        <div className="cta-actions__btns cta-actions__btns--end">
          <button type="button" className="cta-btn cta-btn--ghost" onClick={() => navigate('/paciente')}>Cancelar</button>
          <button type="submit" className="cta-btn cta-btn--primary"><Check size={18} /> Actualizar contraseña</button>
        </div>
      </section>
    </form>
  )
}