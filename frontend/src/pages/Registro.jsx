import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, HeartHandshake, Sprout, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import PhoneInput from '../components/PhoneInput'
import './Login.css'      // reutiliza cabecera, panel verde y campos
import './Registro.css'

const INICIAL = {
  email: '', password: '', confirmar: '',
  nombre: '', apellidos: '', telefono: '', nacimiento: '',
  sexo: '', migrante: '', direccion: '', ocupacion: '', responsable: '',
}

function Campo({ label, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  )
}

export default function Registro() {
  const [datos, setDatos] = useState(INICIAL)
  const [ver, setVer] = useState({ password: false, confirmar: false })
  const [error, setError] = useState('')

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value })
  const alternar = (campo) => setVer({ ...ver, [campo]: !ver[campo] })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (datos.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (datos.password !== datos.confirmar) return setError('Las contraseñas no coinciden.')
    setError('')
    // TODO: conectar con la API (services/auth.js)
    console.log(datos)
  }

  const texto = (name, label, props = {}) => (
    <Campo label={label}>
      <span className="field__input">
        <input name={name} value={datos[name]} onChange={cambiar} required={!props.opcional} {...props.input} />
        {props.icono}
      </span>
    </Campo>
  )

  const clave = (name, label) => (
    <Campo label={label}>
      <span className="field__input">
        <input
          name={name}
          type={ver[name] ? 'text' : 'password'}
          placeholder="••••••••••••"
          value={datos[name]}
          onChange={cambiar}
          required
        />
        <button type="button" className="field__toggle" onClick={() => alternar(name)}
          aria-label={ver[name] ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {ver[name] ? <Eye size={18} color="#4f6e5b" /> : <EyeOff size={18} color="#4f6e5b" />}
        </button>
      </span>
    </Campo>
  )

  const lista = (name, label, opciones) => (
    <Campo label={label}>
      <span className="field__input">
        <select name={name} value={datos[name]} onChange={cambiar} required>
          <option value="" disabled>Selecciona</option>
          {opciones.map((o) => <option key={o}>{o}</option>)}
        </select>
      </span>
    </Campo>
  )

  return (
    <div className="login">
      <header className="login__header">
        <Link to="/" className="brand">
          <span className="brand__emblem"><Plus size={20} color="#fff" /></span>
          <span className="brand__text">
            <strong>TilinesMédicos</strong>
            <small>PLATAFORMA MÉDICA</small>
          </span>
        </Link>
      </header>

      <main className="login__main">
        <aside className="welcome">
          <p className="welcome__eyebrow">GESTIÓN MÉDICA INTEGRAL</p>
          <h1 className="welcome__title">Tu salud,<br />un poco más<br />cerca.</h1>
          <p className="welcome__text">
            Solicita tus citas y encuentra tu historial y tus recetas en un solo lugar.
          </p>

          <div className="care" aria-hidden="true">
            <div className="care__halo" />
            <div className="care__arch" />
            <HeartHandshake className="care__icon" size={64} color="#fff" strokeWidth={1.5} />
            <div className="care__card">
              <span className="care__card-icon"><Sprout size={22} color="#fff" /></span>
              <div>
                <strong>Cuidado con continuidad</strong>
                <span>Antes, durante y después de tu cita.</span>
              </div>
            </div>
          </div>

          <p className="welcome__footer">Consultas y expedientes clínicos · TilinesMédicos</p>
        </aside>

        <section className="form-panel form-panel--registro">
          <div className="form-panel__intro">
            <p className="eyebrow">BIENVENIDO A TILINESMÉDICOS</p>
            <h2>Empieza a cuidar de ti</h2>
            <p>Crea tu cuenta de paciente en TilinesMédicos. Los campos con * son obligatorios.</p>
          </div>

          <form className="registro" onSubmit={handleSubmit}>
            <fieldset className="group">
              <legend>Datos personales</legend>
              <div className="grid3">
                {texto('nombre', 'Nombre *', { input: { placeholder: 'Tu nombre' } })}
                {texto('apellidos', 'Apellidos *', { input: { placeholder: 'Tus apellidos' } })}
                <Campo label="Teléfono *">
                  <span className="field__input">
                    <PhoneInput value={datos.telefono} onChange={cambiar} required />
                  </span>
                </Campo>

                {texto('nacimiento', 'Fecha de nacimiento *', { input: { type: 'date' } })}
                {lista('sexo', 'Sexo *', ['Masculino', 'Femenino'])}
                {lista('migrante', 'Población migrante *', ['Sí', 'No'])}

                {texto('direccion', 'Dirección *', { input: { placeholder: 'Calle, zona, municipio' } })}
                {texto('ocupacion', 'Ocupación *', { input: { placeholder: 'Tu ocupación' } })}
                {texto('responsable', 'Responsable (opcional)', {
                  opcional: true,
                  input: { placeholder: 'Nombre del responsable' },
                })}
              </div>
            </fieldset>

            <fieldset className="group">
              <legend>Datos de cuenta</legend>
              <div className="grid3">
                {texto('email', 'Correo electrónico *', {
                  input: { type: 'email', placeholder: 'correo@ejemplo.com' },
                  icono: <Mail size={18} color="#4f6e5b" />,
                })}
                {clave('password', 'Contraseña *')}
                {clave('confirmar', 'Confirmar contraseña *')}
              </div>
              <p className={`hint ${error ? 'hint--error' : ''}`}>
                {error || 'Usa al menos 8 caracteres. Ambas contraseñas deben coincidir.'}
              </p>
            </fieldset>

            <button type="submit" className="btn-primary">
              <ArrowRight size={18} /> Crear cuenta de paciente
            </button>
          </form>

          <p className="back-login">
            ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </section>
      </main>
    </div>
  )
}