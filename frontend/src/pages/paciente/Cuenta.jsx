import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Check } from 'lucide-react'
import PhoneInput from '../../components/PhoneInput'
import './Cuenta.css'

// TODO: reemplazar por los datos reales de la API (GET /paciente/me)
const PERFIL = {
  codigo: 'P-0024',
  nombre: 'Tilin', apellidos: 'Insano', email: 'correo@ejemplo.com', telefono: '+502 0000 0000',
  nacimiento: '1992-03-14', sexo: 'Masculino', direccion: 'Calle principal 12-45, zona 1',
  ocupacion: 'Ingeniero', migrante: 'No', responsable: '',
}

const iniciales = (n, a) => `${n[0] ?? ''}${a[0] ?? ''}`.toUpperCase()

function Campo({ label, children, ancho }) {
  return (
    <label className={`cta-field ${ancho ? 'cta-field--full' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function Cuenta() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(PERFIL)
  const [guardado, setGuardado] = useState(false)

  const cambiar = (e) => { setDatos({ ...datos, [e.target.name]: e.target.value }); setGuardado(false) }

  const guardar = (e) => {
    e.preventDefault()
    // TODO: conectar con la API (PUT /paciente/me)
    console.log(datos)
    setGuardado(true)
  }

  const texto = (name, label, props = {}) => (
    <Campo label={label} ancho={props.ancho}>
      <input name={name} value={datos[name]} onChange={cambiar} {...props.input} />
    </Campo>
  )

  return (
    <form className="cta" onSubmit={guardar}>
      <Link to="/paciente" className="cta-back">← Volver a mi espacio</Link>

      <div className="cta-head">
        <h1>Mi cuenta</h1>
        <p>Actualiza tus datos personales.</p>
      </div>

      <div className="cta-profile">
        <span className="cta-profile__avatar">{iniciales(datos.nombre, datos.apellidos)}</span>
        <div>
          <strong>{datos.nombre} {datos.apellidos}</strong>
          <small>Tu cuenta personal · {PERFIL.codigo}</small>
        </div>
        <span className="cta-pill">Paciente</span>
      </div>

      <section className="cta-panel">
        <h2>Datos personales</h2>
        <div className="cta-fields cta-fields--three">
          {texto('nombre', 'Nombre', { input: { required: true } })}
          {texto('apellidos', 'Apellidos', { input: { required: true } })}

          <Campo label="Correo electrónico">
            <span className="cta-pass">
              <input name="email" type="email" value={datos.email} readOnly title="Es el correo con el que inicias sesión" />
              <Mail size={18} color="#4f6e5b" />
            </span>
          </Campo>

          <Campo label="Teléfono">
            <span className="cta-pass">
              <PhoneInput value={datos.telefono} onChange={cambiar} required />
            </span>
          </Campo>
          {texto('nacimiento', 'Fecha de nacimiento', { input: { type: 'date', required: true } })}

          <Campo label="Sexo">
            <select name="sexo" value={datos.sexo} onChange={cambiar}>
              <option>Masculino</option>
              <option>Femenino</option>
            </select>
          </Campo>

          <Campo label="Población migrante">
            <select name="migrante" value={datos.migrante} onChange={cambiar}>
              <option>Sí</option>
              <option>No</option>
            </select>
          </Campo>
          {texto('ocupacion', 'Ocupación', { input: { required: true } })}
          {texto('responsable', 'Responsable (opcional)', { input: { placeholder: '—' } })}

          {texto('direccion', 'Dirección', { ancho: true, input: { required: true } })}
        </div>
      </section>

      <div className="cta-actions">
        <div>
          <strong>{guardado ? 'Cambios guardados.' : 'Solo se modifican los datos de tu cuenta.'}</strong>
          <small>Puedes actualizar tus datos personales, pero no la información clínica.</small>
        </div>
        <div className="cta-actions__btns">
          <button type="button" className="cta-btn cta-btn--ghost" onClick={() => navigate('/paciente')}>Cancelar</button>
          <button type="submit" className="cta-btn cta-btn--primary"><Check size={18} /> Guardar cambios</button>
        </div>
      </div>
    </form>
  )
}