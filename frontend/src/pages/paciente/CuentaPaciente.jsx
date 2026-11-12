import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Check, Pencil } from 'lucide-react'
import { getOwnPatientProfile, updateOwnPatientProfile } from '../../features/pacientes/api/profile.js'
import { useAuth } from '../../features/auth/hooks/useAuth.js'
import './Cuenta.css'

const SEX_LABELS = { M: 'Masculino', F: 'Femenino', NO_ESPECIFICADO: 'No especificado' }
const iniciales = (nombre = '', apellidos = '') => `${nombre[0] ?? ''}${apellidos[0] ?? ''}`.toUpperCase()

function Campo({ label, children, ancho }) {
  return (
    <label className={`cta-field ${ancho ? 'cta-field--full' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function CuentaPaciente() {
  const { user } = useAuth()
  const [original, setOriginal] = useState(null)
  const [datos, setDatos] = useState(null)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    getOwnPatientProfile()
      .then((perfil) => {
        if (!activo) return
        const vista = {
          ...perfil,
          nombre: user?.nombre || '',
          apellidos: user?.apellidos || '',
          correo: user?.correo || '',
          telefono: user?.telefono || '',
          direccion: perfil?.direccion || '',
          ocupacion: perfil?.ocupacion || '',
          nombreResponsable: perfil?.nombreResponsable || '',
        }
        setOriginal(vista)
        setDatos(vista)
      })
      .catch((requestError) => activo && setError(requestError?.message || 'No se pudo cargar tu perfil.'))
    return () => { activo = false }
  }, [user])

  if (!datos) return <p className="cta-loading">{error || 'Cargando tus datos...'}</p>

  const cambiar = (evento) => {
    setDatos((actual) => ({ ...actual, [evento.target.name]: evento.target.value }))
    setMensaje('')
  }

  const empezar = () => { setEditando(true); setMensaje(''); setError('') }
  const cancelar = () => { setDatos(original); setEditando(false); setError('') }

  const guardar = async (evento) => {
    evento.preventDefault()
    if (!editando || guardando) return
    setGuardando(true)
    setError('')
    try {
      const perfil = await updateOwnPatientProfile({
        direccion: datos.direccion,
        ocupacion: datos.ocupacion,
        nombreResponsable: datos.nombreResponsable,
      })
      const guardado = { ...datos, ...perfil }
      setOriginal(guardado)
      setDatos(guardado)
      setEditando(false)
      setMensaje('Cambios guardados.')
    } catch (requestError) {
      setError(requestError?.message || 'No se pudieron guardar los cambios.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="cta" onSubmit={guardar}>
      <Link to="/paciente" className="cta-back">← Volver a mi espacio</Link>

      <div className="cta-head">
        <h1>Mi cuenta</h1>
        <p>Consulta y actualiza tus datos personales.</p>
      </div>

      <div className="cta-profile">
        <span className="cta-profile__avatar">{iniciales(datos.nombre, datos.apellidos)}</span>
        <div>
          <strong>{datos.nombre} {datos.apellidos}</strong>
          <small>Tu cuenta personal · {datos.id || 'Paciente'}</small>
        </div>
        <span className="cta-pill">Paciente</span>
      </div>

      <section className="cta-panel">
        <h2>Datos personales</h2>
        <div className="cta-fields cta-fields--three">
          <Campo label="Nombres"><input value={datos.nombre || ''} readOnly /></Campo>
          <Campo label="Apellidos"><input value={datos.apellidos || 'No disponible'} readOnly /></Campo>
          <Campo label="Correo electrónico">
            <span className="cta-pass">
              <input type="email" value={datos.correo || 'No disponible'} readOnly />
              <Mail size={18} color="#4f6e5b" />
            </span>
          </Campo>
          <Campo label="Teléfono"><input value={datos.telefono || 'No disponible'} readOnly /></Campo>
          <Campo label="Fecha de nacimiento"><input value={datos.fechaNacimiento?.slice?.(0, 10) || 'No disponible'} readOnly /></Campo>
          <Campo label="Sexo"><input value={SEX_LABELS[datos.sexo] || 'No disponible'} readOnly /></Campo>
          <Campo label="Población migrante"><input value={typeof datos.poblacionMigrante === 'boolean' ? (datos.poblacionMigrante ? 'Sí' : 'No') : 'No disponible'} readOnly /></Campo>
          <Campo label="Ocupación">
            <input name="ocupacion" value={datos.ocupacion} onChange={cambiar} disabled={!editando || guardando} placeholder="No registrada" />
          </Campo>
          <Campo label="Responsable (opcional)">
            <input name="nombreResponsable" value={datos.nombreResponsable} onChange={cambiar} disabled={!editando || guardando} placeholder="—" />
          </Campo>
          <Campo label="Dirección" ancho>
            <input name="direccion" value={datos.direccion} onChange={cambiar} disabled={!editando || guardando} placeholder="No registrada" />
          </Campo>
        </div>
      </section>

      <div className="cta-actions">
        <div>
          <strong>
            {error ? <span className="cta-error">{error}</span>
              : mensaje || (editando ? 'Estás editando tus datos.' : 'Tus datos están protegidos.')}
          </strong>
          <small>
            {editando
              ? 'Puedes actualizar dirección, ocupación y responsable; los datos de acceso permanecen protegidos.'
              : 'Presiona “Actualizar datos” para editar la información permitida.'}
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
