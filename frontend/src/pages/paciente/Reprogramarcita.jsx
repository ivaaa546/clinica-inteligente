import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Info } from 'lucide-react'
import { listDoctorAvailability } from '../../api/availability.js'
import { cancelAppointment, getAppointment, rescheduleAppointment } from '../../api/appointments.js'
import { createPreconsultation, updatePreconsultation } from '../../api/preconsultations.js'
import { getDoctor } from '../../api/doctors.js'
import ApiError from '../../components/ApiError.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import { clinicDateKey, formatClinicDate, formatClinicTime } from '../../lib/date.js'
import './Reprogramarcita.css'

const ACTIVE_STATES = new Set(['PENDIENTE', 'ACEPTADA'])
const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  REPROGRAMADA: 'Reprogramada',
  COMPLETADA: 'Completada',
}

const hoy = () => clinicDateKey(new Date())
const statusLabel = (status) => STATUS_LABELS[status] || status || 'Sin estado'
const doctorName = (doctor) => doctor ? `${doctor.nombre} ${doctor.apellidos}` : 'Médico no disponible'
const doctorSpecialty = (doctor) => doctor?.especialidad?.nombre || 'Especialidad no disponible'
const initials = (doctor) => `${doctor?.nombre?.[0] || ''}${doctor?.apellidos?.[0] || ''}`.toUpperCase()
const initialBackgroundText = (value) => {
  if (!value) return ''
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}

export default function ReprogramarCita() {
  const { id } = useParams()
  const [appointment, setAppointment] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [availability, setAvailability] = useState([])
  const [fecha, setFecha] = useState('')
  const [availabilityId, setAvailabilityId] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [antecedentesIniciales, setAntecedentesIniciales] = useState('')
  const [isSavingPreconsultation, setIsSavingPreconsultation] = useState(false)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => active && setError(null))

    getAppointment(id)
      .then(async (item) => {
        const [blocks, publicDoctor] = await Promise.all([
          item?.medicoId ? listDoctorAvailability(item.medicoId) : [],
          item?.medicoId ? getDoctor(item.medicoId) : null,
        ])
        if (!active) return
        setAppointment(item)
        setMotivoConsulta(item.preconsulta?.motivoConsulta || '')
        setAntecedentesIniciales(initialBackgroundText(item.preconsulta?.antecedentesIniciales))
        setFecha(clinicDateKey(item.inicio) || hoy())
        setAvailability(Array.isArray(blocks) ? blocks : [])
        setDoctor(publicDoctor)
      })
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [id])

  const canManage = Boolean(appointment
    && ACTIVE_STATES.has(appointment.estado)
    && new Date(appointment.inicio).getTime() > now)

  const blocksForDate = useMemo(() => availability.filter((block) => (
    block.activa !== false
    && new Date(block.inicio).getTime() > now
    && clinicDateKey(block.inicio) === fecha
  )), [availability, fecha, now])

  const selectedBlock = blocksForDate.find((block) => block.id === availabilityId)
  const filas = appointment ? [
    ['Especialidad', doctorSpecialty(doctor)],
    ['Fecha', formatClinicDate(appointment.inicio) || 'No disponible'],
    ['Inicio', formatClinicTime(appointment.inicio) || 'No disponible'],
    ['Fin', formatClinicTime(appointment.fin) || 'No disponible'],
    ['Estado', statusLabel(appointment.estado)],
  ] : []

  const confirmar = async () => {
    if (!canManage || !selectedBlock || isSubmitting) return
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      const replacement = await rescheduleAppointment(id, selectedBlock.id, appointment.modalidad)
      setAppointment((current) => ({ ...current, estado: 'REPROGRAMADA' }))
      setSuccess(replacement)
      setAvailabilityId('')
    } catch (requestError) {
      setError(requestError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const guardarPreconsulta = async () => {
    if (!appointment || !canManage || !motivoConsulta.trim() || isSavingPreconsultation) return
    setError(null)
    setSuccess(null)
    setIsSavingPreconsultation(true)
    try {
      const payload = {
        motivoConsulta: motivoConsulta.trim(),
        antecedentesIniciales: antecedentesIniciales.trim() || undefined,
      }
      const saved = appointment.preconsulta
        ? await updatePreconsultation(appointment.preconsulta.id, payload)
        : await createPreconsultation({ citaId: appointment.id, ...payload })
      setAppointment((current) => ({ ...current, preconsulta: saved }))
      setSuccess({ type: 'preconsulta', ...saved })
    } catch (requestError) {
      setError(requestError)
    } finally {
      setIsSavingPreconsultation(false)
    }
  }

  const cancelarCita = async () => {
    if (!canManage || isSubmitting || !window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      const cancelled = await cancelAppointment(id)
      setAppointment(cancelled)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <LoadingState message="Cargando el detalle de la cita…" />
  if (error && !appointment) return <ApiError error={error} onRetry={() => window.location.reload()} />
  if (!appointment) return <ApiError title="Cita no disponible" error={error} />

  return (
    <>
      <div className="rep-head">
        <div>
          <h1>Mi cita / Opciones</h1>
          <p>Cita {appointment.id} · Gestiona la cita antes de su inicio.</p>
        </div>
        <span className="rep-pill">{statusLabel(appointment.estado)}</span>
      </div>

      <div className="rep-notice">
        <Info size={16} color="#0e5733" />
        <p>
          Solo puedes cancelar o reprogramar citas propias en estado Pendiente o Aceptada antes del inicio.
        </p>
      </div>

      {error && <ApiError error={error} />}
      {success && (
        <div className="rep-success" role="status">
          {success.type === 'preconsulta' ? (
            <><strong>Preconsulta guardada</strong><p>El motivo y los antecedentes iniciales quedaron asociados a esta cita.</p></>
          ) : (
            <><strong>Solicitud reprogramada</strong><p>La cita original quedó Reprogramada y la nueva cita {success.id} está en estado {statusLabel(success.estado)}.</p></>
          )}
        </div>
      )}

      <div className="rep-main">
        <div className="rep-left">
          <section className="rep-card">
            <div className="rep-card__head">
              <div>
                <h2>Cita {appointment.id}</h2>
                <p>{doctorName(doctor)} · {doctorSpecialty(doctor)}</p>
              </div>
              <span className="rep-pill">{statusLabel(appointment.estado)}</span>
            </div>

            <dl className="rep-rows">
              {filas.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
            </dl>
            <hr />
            <dl className="rep-rows">
              <div><dt>Paciente</dt><dd>Mi cuenta</dd></div>
              <div><dt>Profesional</dt><dd>{doctorName(doctor)}</dd></div>
            </dl>
          </section>

          <section className="rep-card">
            <h2>Preconsulta</h2>
            <p className="rep-small">Comparte el motivo de tu cita y antecedentes iniciales. El médico asignado podrá consultarlos.</p>
            {!canManage || appointment.consulta ? (
              <p className="rep-small">La preconsulta queda disponible solo para lectura porque la cita ya no admite edición.</p>
            ) : (
              <>
                <label className="rep-field">
                  <span>Motivo de consulta</span>
                  <textarea value={motivoConsulta} onChange={(event) => setMotivoConsulta(event.target.value)} rows="3" required />
                </label>
                <label className="rep-field">
                  <span>Antecedentes iniciales (opcional)</span>
                  <textarea value={antecedentesIniciales} onChange={(event) => setAntecedentesIniciales(event.target.value)} rows="4" placeholder="Información que quieras declarar antes de la atención" />
                </label>
                <button type="button" className="rep-btn rep-btn--primary rep-btn--fit" onClick={guardarPreconsulta} disabled={!motivoConsulta.trim() || isSavingPreconsultation || isSubmitting}>
                  {isSavingPreconsultation ? 'Guardando…' : appointment.preconsulta ? 'Actualizar preconsulta' : 'Guardar preconsulta'}
                </button>
              </>
            )}
          </section>

          <section className="rep-card">
            <h2>Acciones disponibles</h2>
            <button type="button" className="rep-btn rep-btn--primary" onClick={() => document.getElementById('reschedule-date')?.focus()} disabled={!canManage || isSubmitting}>
              Reprogramar cita
            </button>
            <button type="button" className="rep-btn rep-btn--ghost" onClick={cancelarCita} disabled={!canManage || isSubmitting}>
              {isSubmitting ? 'Procesando…' : 'Cancelar cita'}
            </button>
            <p className="rep-small">La autorización final siempre la realiza el backend.</p>
          </section>
        </div>

        <aside className="rep-right">
          <div className="rep-doctor">
            <span className="rep-doctor__avatar">{initials(doctor)}</span>
            <strong>{doctorName(doctor)}</strong>
            <span>{doctorSpecialty(doctor)}</span>
          </div>

          <section className="rep-card">
            <h2>Reprogramar cita</h2>

            <label className="rep-field">
              <span>Fecha</span>
              <input id="reschedule-date" type="date" min={hoy()} value={fecha} onChange={(event) => { setFecha(event.target.value); setAvailabilityId('') }} disabled={!canManage} />
            </label>

            <label className="rep-field">
              <span>Horario disponible</span>
              <select value={availabilityId} onChange={(event) => setAvailabilityId(event.target.value)} disabled={!canManage}>
                <option value="">Selecciona un bloque</option>
                {blocksForDate.map((block) => (
                  <option value={block.id} key={block.id}>{formatClinicTime(block.inicio)}–{formatClinicTime(block.fin)}</option>
                ))}
              </select>
            </label>

            <div className="rep-field">
              <span>Duración</span>
              <div className="rep-static">30 min</div>
            </div>

            <div className="rep-field">
              <span>Estado de la nueva cita</span>
              <div className="rep-static">Pendiente</div>
            </div>

            <button type="button" className="rep-btn rep-btn--primary rep-btn--fit" onClick={confirmar} disabled={!canManage || !selectedBlock || isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Confirmar cambio'}
            </button>
            <p className="rep-small">La nueva cita se crea Pendiente y la original conserva su historial.</p>
          </section>

          <div className="rep-notice rep-notice--side">
            <Info size={16} color="#0e5733" />
            <p>Los bloques mostrados son del mismo médico y se confirman al reprogramar.</p>
          </div>

          <Link to="/paciente" className="rep-back">← Volver al inicio</Link>
        </aside>
      </div>
    </>
  )
}
