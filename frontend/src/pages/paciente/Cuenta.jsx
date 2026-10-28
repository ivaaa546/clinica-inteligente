import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Check, Pencil } from 'lucide-react'
import PhoneInput from '../../components/PhoneInput'
import { actualizarPerfil, obtenerPerfil } from '../../services/perfilService'
import './Cuenta.css'

const iniciales = (n = '', a = '') => `${n[0] ?? ''}${a[0] ?? ''}`.toUpperCase()

function Campo({ label, children, ancho }) {
  return (
    <label className={`cta-field ${ancho ? 'cta-field--full' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function Cuenta() {
  const [original, setOriginal] = useState(null) // lo guardado
  const [datos, setDatos] = useState(null)       // lo que se está editando
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerPerfil()
      .then((p) => { setOriginal(p); setDatos(p) })
      .catch((e) => setError(e.message))
  }, [])

  if (!datos) return <p className="cta-loading">{error || 'Cargando tus datos...'}</p>

  const cambiar = (e) => { setDatos({ ...datos, [e.target.name]: e.target.value }); setMensaje('') }

  const empezar = () => { setEditando(true); setMensaje(''); setError('') }

  const cancelar = () => { setDatos(original); setEditando(false); setError('') }

  const guardar = async (e) => {
    e.preventDefault()
    if (!editando) return
    setGuardando(true)
    setError('')
    try {
      const guardado = await actualizarPerfil(datos)
      setOriginal(guardado)
      setDatos(guardado)
      setEditando(false)
      setMensaje('Cambios guardados.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
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
        <p>Consulta y actualiza tus datos personales.</p>
      </div>

      <div className="cta-profile">
        <span className="cta-profile__avatar">{iniciales(original.nombre, original.apellidos)}</span>
        <div>
          <strong>{original.nombre} {original.apellidos}</strong>
          <small>Tu cuenta personal · {original.codigo}</small>
        </div>
        <span className="cta-pill">Paciente</span>
      </div>

      <section className="cta-panel">
        <h2>Datos personales</h2>

        {/* Mientras no se presiona "Actualizar datos", todos los campos están bloqueados */}
        <fieldset className="cta-lock" disabled={!editando || guardando}>
          <div className="cta-fields cta-fields--three">
            {texto('nombre', 'Nombres', { input: { required: true } })}
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
        </fieldset>
      </section>

      <div className="cta-actions">
        <div>
          <strong>
            {error ? <span className="cta-error">{error}</span>
              : mensaje ? mensaje
              : editando ? 'Estás editando tus datos.'
              : 'Tus datos están protegidos.'}
          </strong>
          <small>
            {editando
              ? 'Puedes actualizar tus datos personales, pero no la información clínica.'
              : 'Presiona “Actualizar datos” para poder editarlos.'}
          </small>
        </div>

        <div className="cta-actions__btns">
          {editando ? (
            <>
              <button type="button" className="cta-btn cta-btn--ghost" onClick={cancelar} disabled={guardando}>Cancelar</button>
              <button type="submit" className="cta-btn cta-btn--primary" disabled={guardando}>
                <Check size={18} /> {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          ) : (
            <button type="button" className="cta-btn cta-btn--primary" onClick={empezar}>
              <Pencil size={17} /> Actualizar datos
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
