import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, CalendarDays, ArrowRight, Info, MapPin, Video } from 'lucide-react'
import { listDoctorAvailability } from '../../api/availability.js'
import { requestAppointment } from '../../api/appointments.js'
import { listDoctors } from '../../api/doctors.js'
import { listSpecialties } from '../../api/specialties.js'
import ApiError from '../../components/ApiError.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import { clinicDateKey, formatClinicDate, formatClinicTime } from '../../lib/date.js'
import { useAuth } from '../../auth/useAuth.js'
import './SolicitarCita.css'

const hoy = () => clinicDateKey(new Date())
const capitalizar = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : ''

function initials(doctor) {
  return `${doctor.nombre?.[0] || ''}${doctor.apellidos?.[0] || ''}`.toUpperCase()
}

export default function SolicitarCita() {
  const { user } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [especialidadId, setEspecialidadId] = useState('')
  const [especialidades, setEspecialidades] = useState([])
  const [medicos, setMedicos] = useState([])
  const [medicoId, setMedicoId] = useState('')
  const [disponibilidades, setDisponibilidades] = useState([])
  const [fecha, setFecha] = useState(hoy())
  const [bloqueId, setBloqueId] = useState('')
  const [modalidadElegida, setModalidadElegida] = useState('')
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState(null)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    listSpecialties()
      .then((items) => {
        if (!active) return
        const values = Array.isArray(items) ? items : []
        setEspecialidades(values)
        setEspecialidadId((current) => current || values[0]?.id || '')
      })
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setCatalogLoading(false))

    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (!active) return
      setMedicoId('')
      setDisponibilidades([])
      setBloqueId('')
      setDoctorsLoading(Boolean(especialidadId))
      if (!especialidadId) setMedicos([])
      setError(null)
    })

    if (!especialidadId) return undefined

    listDoctors(especialidadId)
      .then((items) => active && setMedicos(Array.isArray(items) ? items : []))
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setDoctorsLoading(false))

    return () => { active = false }
  }, [especialidadId])

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (!active) return
      setDisponibilidades([])
      setBloqueId('')
      setAvailabilityLoading(Boolean(medicoId))
      setError(null)
    })

    if (!medicoId) return undefined

    listDoctorAvailability(medicoId)
      .then((items) => active && setDisponibilidades(Array.isArray(items) ? items : []))
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setAvailabilityLoading(false))

    return () => { active = false }
  }, [medicoId])

  const medicosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase()
    return medicos.filter((doctor) => !query
      || `${doctor.nombre} ${doctor.apellidos} ${doctor.especialidad?.nombre || ''}`.toLowerCase().includes(query))
  }, [busqueda, medicos])

  const bloques = useMemo(() => disponibilidades.filter((block) => {
    const isFuture = new Date(block.inicio).getTime() > now
    return isFuture && clinicDateKey(block.inicio) === fecha
  }), [disponibilidades, fecha, now])

  const medico = medicos.find((item) => item.id === medicoId)
  const bloque = bloques.find((item) => item.id === bloqueId)
  const especialidad = especialidades.find((item) => item.id === especialidadId)

  const modalidadesDisponibles = bloque?.modalidades || []
  const modalidad = (modalidadesDisponibles.includes(modalidadElegida) ? modalidadElegida : null)
    || (modalidadesDisponibles.includes('PRESENCIAL') ? 'PRESENCIAL' : modalidadesDisponibles[0]) || ''

  const diaLargo = fecha ? capitalizar(formatClinicDate(`${fecha}T12:00:00Z`) || '') : ''
  const completo = Boolean(medico && bloque && modalidad)

  const seleccionarMedico = (id) => {
    setMedicoId(id)
    setBloqueId('')
    setModalidadElegida('')
    setCreatedAppointment(null)
  }

  const seleccionarBloque = (id) => {
    setBloqueId(id)
    const target = bloques.find((b) => b.id === id)
    if (target?.modalidades && !target.modalidades.includes(modalidadElegida)) {
      setModalidadElegida(target.modalidades.includes('PRESENCIAL') ? 'PRESENCIAL' : target.modalidades[0])
    }
  }

  const enviar = async () => {
    if (!completo || isSubmitting || createdAppointment) return

    setError(null)
    setIsSubmitting(true)
    try {
      const appointment = await requestAppointment({
        medicoId: medico.id,
        disponibilidadId: bloque.id,
        modalidad,
      })
      setCreatedAppointment(appointment)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="sol-head">
        <h1>Solicitar cita</h1>
        <p>
          Busca médico activo por especialidad, selecciona día y bloque disponible de 30 min.
          La solicitud queda pendiente hasta que el médico la acepte o rechace.
        </p>
      </div>

      {error && <ApiError error={error} onRetry={() => window.location.reload()} />}

      <div className="sol-grid">
        <section className="sol-panel">
          <h2>Médico y horario</h2>

          <div className="sol-row">
            <label className="sol-field">
              <span>Buscar médico activo</span>
              <span className="sol-input">
                <input
                  type="text"
                  placeholder="Buscar por nombre o especialidad"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                />
                <Search size={18} color="#4f6e5b" />
              </span>
            </label>

            <label className="sol-field">
              <span>Especialidad</span>
              <span className="sol-input">
                <select value={especialidadId} onChange={(event) => setEspecialidadId(event.target.value)} disabled={catalogLoading}>
                  <option value="">Todas las especialidades</option>
                  {especialidades.map((item) => <option value={item.id} key={item.id}>{item.nombre}</option>)}
                </select>
                <ChevronDown size={18} color="#4f6e5b" />
              </span>
            </label>
          </div>

          {catalogLoading || doctorsLoading ? <LoadingState message="Cargando médicos…" /> : (
            <div className="sol-doctors" role="radiogroup" aria-label="Médico">
              {medicosFiltrados.length === 0 && (
                <EmptyState title="No hay médicos disponibles" message="No encontramos médicos activos para estos criterios." />
              )}
              {medicosFiltrados.map((item) => {
                const selected = item.id === medicoId
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`sol-doctor ${selected ? 'is-selected' : ''}`}
                    onClick={() => seleccionarMedico(item.id)}
                  >
                    <span className="sol-doctor__top">
                      <span className="sol-doctor__avatar">{initials(item)}</span>
                      <span className="sol-radio" />
                    </span>
                    <strong>{item.nombre} {item.apellidos}</strong>
                    <small>{item.especialidad?.nombre || 'Especialidad no disponible'}</small>
                  </button>
                )
              })}
            </div>
          )}

          <hr />

          <div className="sol-schedule">
            <div className="sol-date">
              <label className="sol-field">
                <span>Fecha</span>
                <span className="sol-input">
                  <input type="date" min={hoy()} value={fecha} onChange={(event) => { setFecha(event.target.value); setBloqueId(''); setCreatedAppointment(null) }} />
                  <CalendarDays size={18} color="#4f6e5b" />
                </span>
              </label>
              <small>{diaLargo}</small>
            </div>

            <div className="sol-slots">
              <span className="sol-slots__title">Bloques disponibles (30 min)</span>
              {availabilityLoading ? <LoadingState message="Cargando horarios…" /> : (
                <>
                  <div className="sol-slots__list">
                    {bloques.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`sol-slot ${bloqueId === item.id ? 'is-selected' : ''}`}
                        onClick={() => seleccionarBloque(item.id)}
                      >
                        {formatClinicTime(item.inicio)}–{formatClinicTime(item.fin)}
                      </button>
                    ))}
                  </div>
                  {bloques.length === 0 && <small>No hay bloques futuros para esta fecha.</small>}
                  <small>La disponibilidad se confirma al reservar; un bloque activo puede ocuparse antes.</small>
                </>
              )}
            </div>
          </div>

          <hr />

          {bloque && modalidadesDisponibles.length > 0 && (
            <>
              <div className="sol-modalidad">
                <span className="sol-slots__title">Modalidad de atención</span>
                <div className="sol-modalidad__opciones">
                  {modalidadesDisponibles.includes('PRESENCIAL') && (
                    <button
                      type="button"
                      className={`sol-modalidad__btn ${modalidad === 'PRESENCIAL' ? 'is-selected' : ''}`}
                      onClick={() => setModalidadElegida('PRESENCIAL')}
                    >
                      <MapPin size={18} />
                      <div>
                        <strong>Presencial</strong>
                        <small>En consultorio del médico</small>
                      </div>
                    </button>
                  )}
                  {modalidadesDisponibles.includes('VIRTUAL') && (
                    <button
                      type="button"
                      className={`sol-modalidad__btn ${modalidad === 'VIRTUAL' ? 'is-selected' : ''}`}
                      onClick={() => setModalidadElegida('VIRTUAL')}
                    >
                      <Video size={18} />
                      <div>
                        <strong>En línea (Videollamada)</strong>
                        <small>Consulta remota desde tu navegador</small>
                      </div>
                    </button>
                  )}
                </div>
              </div>
              <hr />
            </>
          )}
        </section>

        <aside className="sol-side">
          <div className="sol-summary">
            <h2>Tu solicitud</h2>
            <span className="sol-badge">Confirmación automática</span>

            {createdAppointment && (
              <div className="sol-success" role="status">
                <strong>Cita confirmada</strong>
                <p>Tu cita quedó confirmada en estado {createdAppointment.estado}.</p>
              </div>
            )}

            <dl>
              <div><dt>Paciente</dt><dd>{user?.nombre || '—'}</dd></div>
              <div><dt>Profesional</dt><dd>{medico ? `${medico.nombre} ${medico.apellidos}` : '—'}</dd></div>
              <div><dt>Especialidad</dt><dd>{especialidad?.nombre || '—'}</dd></div>
              <div><dt>Modalidad</dt><dd>{modalidad === 'VIRTUAL' ? 'En línea (Videollamada)' : modalidad === 'PRESENCIAL' ? 'Presencial' : '—'}</dd></div>
              <div><dt>Fecha y hora</dt><dd>{completo ? `${formatClinicDate(bloque.inicio)} · ${formatClinicTime(bloque.inicio)}–${formatClinicTime(bloque.fin)}` : 'Selecciona un bloque'}</dd></div>
              <div><dt>Correo electrónico</dt><dd className="is-plain">{user?.correo || '—'}</dd></div>
            </dl>

            <hr />
            <button type="button" className="sol-submit" disabled={!completo || isSubmitting || Boolean(createdAppointment)} onClick={enviar}>
              <ArrowRight size={18} /> {isSubmitting ? 'Enviando solicitud…' : createdAppointment ? 'Solicitud enviada' : 'Solicitar cita'}
            </button>
          </div>

          <div className="sol-info">
            <Info size={17} color="#4f6e5b" />
            <p>
              La disponibilidad se confirma al reservar. No se garantiza que todos los bloques activos sigan libres.
            </p>
          </div>

          <Link to="/paciente" className="sol-back">← Volver a mis solicitudes</Link>
        </aside>
      </div>
    </>
  )
}
