import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { getOwnPatientProfile, updateOwnPatientProfile } from '../../api/patients.js'
import ApiError from '../../shared/components/ApiError.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import { formatBirthDate } from '../../shared/lib/date.js'
import { useAuth } from '../../auth/useAuth.js'
import './CuentaPaciente.css'

const SEX_LABELS = { M: 'Masculino', F: 'Femenino', NO_ESPECIFICADO: 'No especificado' }
const unavailable = 'No disponible en este contrato'

export default function CuentaPaciente() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ direccion: '', ocupacion: '', nombreResponsable: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    getOwnPatientProfile()
      .then((value) => {
        if (!active) return
        setProfile(value)
        setForm({
          direccion: value?.direccion || '',
          ocupacion: value?.ocupacion || '',
          nombreResponsable: value?.nombreResponsable || '',
        })
      })
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [])

  const change = (event) => {
    setSaved(false)
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const save = async (event) => {
    event.preventDefault()
    if (saving) return
    setError(null)
    setSaved(false)
    setSaving(true)

    try {
      const updated = await updateOwnPatientProfile(form)
      setProfile(updated)
      setForm({
        direccion: updated?.direccion || '',
        ocupacion: updated?.ocupacion || '',
        nombreResponsable: updated?.nombreResponsable || '',
      })
      setSaved(true)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Cargando los datos de tu cuenta…" />
  if (error && !profile) return <ApiError error={error} onRetry={() => window.location.reload()} />

  return (
    <>
      <div className="cuenta-head">
        <div>
          <h1>Mi cuenta</h1>
          <p>Consulta tus datos disponibles y actualiza únicamente la información permitida.</p>
        </div>
      </div>

      {error && <ApiError error={error} />}
      {saved && <p className="cuenta-success" role="status">Datos de cuenta actualizados.</p>}

      <div className="cuenta-grid">
        <section className="cuenta-card">
          <h2>Datos de acceso</h2>
          <div className="cuenta-fields">
            <div className="cuenta-field">
              <span>Nombre</span>
              <strong>{user?.nombre || unavailable}</strong>
            </div>
            <div className="cuenta-field">
              <span>Correo electrónico</span>
              <strong>{user?.correo || unavailable}</strong>
            </div>
            <div className="cuenta-field">
              <span>Apellidos</span>
              <strong>{unavailable}</strong>
            </div>
            <div className="cuenta-field">
              <span>Teléfono</span>
              <strong>{unavailable}</strong>
            </div>
          </div>
          <p className="cuenta-note">El contrato actual no permite editar apellidos, teléfono, correo ni contraseña desde esta pantalla.</p>
        </section>

        <section className="cuenta-card">
          <h2>Datos del paciente</h2>
          <div className="cuenta-fields">
            <div className="cuenta-field">
              <span>Fecha de nacimiento</span>
              <strong>{formatBirthDate(profile?.fechaNacimiento?.slice?.(0, 10)) || unavailable}</strong>
            </div>
            <div className="cuenta-field">
              <span>Sexo</span>
              <strong>{SEX_LABELS[profile?.sexo] || unavailable}</strong>
            </div>
            <div className="cuenta-field">
              <span>Población migrante</span>
              <strong>{typeof profile?.poblacionMigrante === 'boolean' ? (profile.poblacionMigrante ? 'Sí' : 'No') : unavailable}</strong>
            </div>
          </div>
        </section>

        <section className="cuenta-card cuenta-card--editable">
          <h2>Información editable</h2>
          <form onSubmit={save}>
            <label className="cuenta-edit-field">
              <span>Dirección</span>
              <input name="direccion" value={form.direccion} onChange={change} placeholder="No registrada" />
            </label>
            <label className="cuenta-edit-field">
              <span>Ocupación</span>
              <input name="ocupacion" value={form.ocupacion} onChange={change} placeholder="No registrada" />
            </label>
            <label className="cuenta-edit-field">
              <span>Nombre del responsable</span>
              <input name="nombreResponsable" value={form.nombreResponsable} onChange={change} placeholder="No registrado" />
            </label>
            <button className="cuenta-save" type="submit" disabled={saving}>
              <Save size={17} /> {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </section>
      </div>
    </>
  )
}
