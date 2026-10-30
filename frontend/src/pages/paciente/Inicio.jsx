import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Info, ClipboardList, FileText, ArrowUpRight } from 'lucide-react'
import { listOwnAppointments } from '../../api/appointments.js'
import { getDoctor } from '../../api/doctors.js'
import ApiError from '../../shared/components/ApiError.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import { CLINIC_TIMEZONE, formatClinicDate, formatClinicTime } from '../../shared/lib/date.js'
import { useAuth } from '../../auth/useAuth.js'
import './Inicio.css'

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  REPROGRAMADA: 'Reprogramada',
  COMPLETADA: 'Completada',
}

const ACTIVE_STATES = new Set(['PENDIENTE', 'ACEPTADA'])

function formatStatus(value) {
  return STATUS_LABELS[value] || value || 'Sin estado'
}

function doctorName(doctor) {
  return doctor ? `${doctor.nombre} ${doctor.apellidos}` : 'Médico no disponible'
}

function doctorSpecialty(doctor) {
  return doctor?.especialidad?.nombre || 'Especialidad no disponible'
}

function dateParts(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { day: '—', month: '—' }
  const formatter = new Intl.DateTimeFormat('es-GT', {
    timeZone: CLINIC_TIMEZONE,
    day: 'numeric',
    month: 'long',
  })
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value: item }) => [type, item]))
  return { day: parts.day, month: (parts.month || '').toUpperCase() }
}

const Estado = ({ valor }) => (
  <span className={`ini-badge ini-badge--${valor.toLowerCase()}`}>{formatStatus(valor)}</span>
)

function AppointmentRow({ appointment, doctor, now }) {
  const canManage = ACTIVE_STATES.has(appointment.estado) && new Date(appointment.inicio).getTime() > now
  return (
    <div className="ini-row">
      <div className="ini-cell">
        <strong>{formatClinicDate(appointment.inicio) || 'Fecha no disponible'}</strong>
        <small>{formatClinicTime(appointment.inicio) || 'Hora no disponible'} · {appointment.id}</small>
      </div>
      <div className="ini-cell">
        <span>{doctorName(doctor)}</span>
        <small>{doctorSpecialty(doctor)}</small>
      </div>
      <div><Estado valor={appointment.estado} /></div>
      <Link className="ini-action ini-action--link" to={`/paciente/citas/${appointment.id}/reprogramar`}>
        {canManage ? 'Ver opciones' : 'Ver cita'}
      </Link>
    </div>
  )
}

export default function InicioPaciente({ soloCitas = false }) {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (!active) return
      setError(null)
    })

    listOwnAppointments()
      .then(async (items) => {
        if (!active) return
        const values = Array.isArray(items) ? items : []
        setAppointments(values)
        const doctorIds = [...new Set(values.map((appointment) => appointment.medicoId).filter(Boolean))]
        const results = await Promise.allSettled(doctorIds.map(async (id) => [id, await getDoctor(id)]))
        if (!active) return
        setDoctors(Object.fromEntries(results
          .filter((result) => result.status === 'fulfilled' && result.value[1])
          .map((result) => result.value)))
      })
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [])

  // La lista prioriza la cita creada más recientemente, independientemente de su fecha de atención.
  const orderedAppointments = useMemo(() => [...appointments].sort(
    (first, second) => new Date(second.creadoEn).getTime() - new Date(first.creadoEn).getTime(),
  ), [appointments])

  const nextAppointment = orderedAppointments.find((appointment) => (
    ACTIVE_STATES.has(appointment.estado) && new Date(appointment.inicio).getTime() > now
  ))
  const nextDoctor = nextAppointment ? doctors[nextAppointment.medicoId] : null
  const nextDate = nextAppointment ? dateParts(nextAppointment.inicio) : null

  return (
    <>
      <div className="ini-head">
        <div>
          <h1>{soloCitas ? 'Mis citas' : `Hola, ${user?.nombre || 'Paciente'}`}</h1>
          <p>{soloCitas ? 'Consulta el estado de tus solicitudes y próximas atenciones.' : 'Aquí puedes solicitar una nueva cita, revisar tus próximas consultas y acceder a tus diagnósticos y recetas.'}</p>
        </div>
        <Link to="/paciente/citas/solicitar" className="ini-cta">
          <Plus size={18} /> Solicitar cita
        </Link>
      </div>

      {error && <ApiError error={error} onRetry={() => window.location.reload()} />}

      {!soloCitas && loading && <LoadingState message="Cargando tus citas…" />}
      {!soloCitas && !loading && !error && nextAppointment && (
        <section className="ini-summary">
          <article className="ini-next">
            <div className="ini-next__top">
              <span>TU PRÓXIMA CITA</span>
              <Estado valor={nextAppointment.estado} />
            </div>

            <div className="ini-next__info">
              <div className="ini-date">
                <strong>{nextDate.day}</strong>
                <span>{nextDate.month}</span>
              </div>
              <div className="ini-next__details">
                <h2>{formatClinicTime(nextAppointment.inicio)}–{formatClinicTime(nextAppointment.fin)}</h2>
                <p>{doctorName(nextDoctor)}</p>
                <small>{doctorSpecialty(nextDoctor)} · Cita {nextAppointment.id}</small>
              </div>
            </div>

            <div className="ini-note">
              <Info size={16} color="#0e5733" />
              <p>Puedes revisar las opciones de tu cita antes de su inicio.</p>
            </div>

            <Link to={`/paciente/citas/${nextAppointment.id}/reprogramar`} className="ini-detail">Ver cita</Link>
          </article>

          <div className="ini-shortcuts">
            <Link to="/paciente/historial" className="ini-shortcut">
              <div><ClipboardList size={23} color="#16713e" /><ArrowUpRight size={18} color="#16713e" /></div>
              <h3>Mi historial</h3>
              <p>Consulta tus diagnósticos y resultados.</p>
            </Link>
            <Link to="/paciente/recetas" className="ini-shortcut">
              <div><FileText size={23} color="#16713e" /><ArrowUpRight size={18} color="#16713e" /></div>
              <h3>Mis recetas</h3>
              <p>Accede a tus recetas y tratamientos.</p>
            </Link>
          </div>
        </section>
      )}

      {!soloCitas && !loading && !error && !nextAppointment && (
        <EmptyState title="No tienes próximas citas" message="Puedes solicitar una nueva cita cuando lo necesites." />
      )}

      <section className="ini-panel">
        <div className="ini-panel__head">
          <h2>{soloCitas ? 'Todas mis citas' : 'Mis citas'}</h2>
          <span>{appointments.length} {appointments.length === 1 ? 'cita' : 'citas'}</span>
        </div>

        {loading ? <LoadingState message="Cargando tus citas…" /> : appointments.length === 0 ? (
          <EmptyState title="Aún no tienes citas" message="Las citas que solicites aparecerán aquí." />
        ) : (
          <div className="ini-table">
            <div className="ini-row ini-row--head">
              <span>FECHA Y HORA</span><span>PROFESIONAL</span><span>ESTADO</span><span>ACCIÓN</span>
            </div>
            {orderedAppointments.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} doctor={doctors[appointment.medicoId]} now={now} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
