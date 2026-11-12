import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Video, MapPin } from 'lucide-react'
import EstadoCita from '../../components/EstadoCita.jsx'
import ModalidadTag from '../../components/ModalidadTag.jsx'
import { listDoctorAvailability } from '../../features/disponibilidad/api/availability.js'
import { cancelAppointment, getAppointment, rescheduleAppointment } from '../../features/citas/api/appointments.js'
import { createPreconsultation, updatePreconsultation } from '../../api/preconsultations.js'
import { getDoctor } from '../../api/doctors.js'
import { useAuth } from '../../features/auth/hooks/useAuth.js'
import { clinicDateKey, formatClinicDate, formatClinicTime } from '../../shared/lib/date.js'
import './DetalleCita.css'

const ACTIVAS = ['PENDIENTE', 'ACEPTADA']
const hoy = () => clinicDateKey(new Date())
const iniciales = (doctor) => `${doctor?.nombre?.[0] || ''}${doctor?.apellidos?.[0] || ''}`.toUpperCase()
const nombreDoctor = (doctor) => doctor ? `${doctor.nombre} ${doctor.apellidos}` : 'Médico no disponible'
const especialidadDoctor = (doctor) => doctor?.especialidad?.nombre || 'Especialidad no disponible'

export default function DetalleCita() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cita, setCita] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [disponibilidades, setDisponibilidades] = useState([])
  const [quiere, setQuiere] = useState(pathname.endsWith('/reprogramar'))
  const [fecha, setFecha] = useState(hoy())
  const [bloqueId, setBloqueId] = useState('')
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [antecedentesIniciales, setAntecedentesIniciales] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [guardandoPreconsulta, setGuardandoPreconsulta] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [ahora] = useState(() => Date.now())

  useEffect(() => {
    let vigente = true
    getAppointment(id)
      .then(async (valor) => {
        const [medico, bloques] = await Promise.all([
          valor?.medicoId ? getDoctor(valor.medicoId) : null,
          valor?.medicoId ? listDoctorAvailability(valor.medicoId) : [],
        ])
        if (!vigente) return
        setCita(valor)
        setDoctor(medico)
        setDisponibilidades(Array.isArray(bloques) ? bloques : [])
        setFecha(clinicDateKey(valor.inicio) || hoy())
        setMotivoConsulta(valor.preconsulta?.motivoConsulta || '')
        const antecedentes = valor.preconsulta?.antecedentesIniciales
        setAntecedentesIniciales(typeof antecedentes === 'string' ? antecedentes : antecedentes ? JSON.stringify(antecedentes, null, 2) : '')
      })
      .catch((requestError) => vigente && setError(requestError?.message || 'No se pudo cargar la cita.'))
      .finally(() => vigente && setCargando(false))
    return () => { vigente = false }
  }, [id])

  const bloques = useMemo(() => disponibilidades.filter((item) => (
    item.activa !== false
    && new Date(item.inicio).getTime() > ahora
    && clinicDateKey(item.inicio) === fecha
  )), [ahora, disponibilidades, fecha])

  if (cargando) return <p className="dc-state">Cargando cita...</p>
  if (error && !cita) return <p className="dc-state">{error} <Link to="/paciente/citas">Volver a mis citas</Link></p>
  if (!cita) return <p className="dc-state">Cita no disponible.</p>

  const activa = ACTIVAS.includes(cita.estado)
  const puedeCambiar = activa && new Date(cita.inicio).getTime() > ahora
  const virtual = cita.modalidad === 'VIRTUAL'
  const puedeUnirse = virtual && cita.estado === 'ACEPTADA'
  const bloque = bloques.find((item) => item.id === bloqueId)

  const cancelar = async () => {
    if (!puedeCambiar || enviando || !window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    setEnviando(true)
    setError('')
    try {
      setCita(await cancelAppointment(cita.id))
      setQuiere(false)
      setAviso('Cita cancelada correctamente.')
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo cancelar la cita.')
    } finally {
      setEnviando(false)
    }
  }

  const confirmar = async () => {
    if (!puedeCambiar || !bloque || enviando) return
    setEnviando(true)
    setError('')
    try {
      await rescheduleAppointment(cita.id, bloque.id, cita.modalidad)
      navigate('/paciente/citas')
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo reprogramar la cita.')
      setEnviando(false)
    }
  }

  const guardarPreconsulta = async () => {
    if (!puedeCambiar || !motivoConsulta.trim() || guardandoPreconsulta) return
    setGuardandoPreconsulta(true)
    setError('')
    try {
      const payload = {
        motivoConsulta: motivoConsulta.trim(),
        antecedentesIniciales: antecedentesIniciales.trim() || undefined,
      }
      const guardada = cita.preconsulta
        ? await updatePreconsultation(cita.preconsulta.id, payload)
        : await createPreconsultation({ citaId: cita.id, ...payload })
      setCita((actual) => ({ ...actual, preconsulta: guardada }))
      setAviso('Preconsulta guardada correctamente.')
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo guardar la preconsulta.')
    } finally {
      setGuardandoPreconsulta(false)
    }
  }

  const datos = [
    ['Especialidad', especialidadDoctor(doctor)],
    ['Fecha', formatClinicDate(cita.inicio) || 'No disponible'],
    ['Hora', `${formatClinicTime(cita.inicio) || '—'} – ${formatClinicTime(cita.fin) || '—'}`],
    ['Modalidad', <ModalidadTag key="modalidad" modalidad={cita.modalidad} />],
    ['Profesional', nombreDoctor(doctor)],
    ['Paciente', [user?.nombre, user?.apellidos].filter(Boolean).join(' ') || 'Paciente'],
    ['Contacto', [user?.correo, user?.telefono].filter(Boolean).join(' · ') || 'No disponible', true],
  ]

  return (
    <>
      <div className="dc-head">
        <div><h1>Detalle de la cita</h1><p>Cita {cita.id}</p></div>
        <EstadoCita estado={cita.estado} />
      </div>

      {error && <p className="dc-error" role="alert">{error}</p>}
      {aviso && <p className="dc-success" role="status">{aviso}</p>}

      <section className={`dc-hero ${virtual ? 'dc-hero--virtual' : 'dc-hero--presencial'}`}>
        <span className="dc-hero__icon">
          {virtual ? <Video size={26} color="#fff" /> : <MapPin size={26} color="#16713e" />}
        </span>
        <div className="dc-hero__text">
          <strong>{virtual ? 'Cita por videollamada' : 'Cita presencial'}</strong>
          <span>{formatClinicDate(cita.inicio)} · {formatClinicTime(cita.inicio)} – {formatClinicTime(cita.fin)} · {nombreDoctor(doctor)}</span>
          {virtual && cita.estado === 'PENDIENTE' && <small>Podrás entrar a la sala cuando el médico acepte la cita.</small>}
          {!virtual && cita.direccionAtencionPresencial && <small>{cita.direccionAtencionPresencial}</small>}
        </div>
        <div className="dc-hero__actions">
          {virtual && activa && (puedeUnirse ? (
            <Link to={`/paciente/citas/${cita.id}/llamada`} className="dc-join"><Video size={18} /> Unirse a la videollamada</Link>
          ) : (
            <button type="button" className="dc-join" disabled><Video size={18} /> Unirse a la videollamada</button>
          ))}
          {puedeCambiar && <button type="button" className="dc-cancel" onClick={cancelar} disabled={enviando}>Cancelar cita</button>}
        </div>
      </section>

      <div className="dc-main">
        <section className="dc-card">
          <div className="dc-who">
            <span className="dc-who__avatar">{iniciales(doctor)}</span>
            <div><strong>{nombreDoctor(doctor)}</strong><small>{especialidadDoctor(doctor)}</small></div>
          </div>
          <dl className="dc-data">
            {datos.map(([clave, valor, ancho]) => (
              <div key={clave} className={ancho ? 'is-wide' : ''}><dt>{clave}</dt><dd>{valor}</dd></div>
            ))}
          </dl>
        </section>

        <aside className="dc-card">
          <h2>Reprogramar cita</h2>
          {puedeCambiar ? (
            <>
              <div className="dc-ask">
                <span>¿Quieres reprogramar tu cita?</span>
                <div className="dc-choice" role="radiogroup" aria-label="¿Quieres reprogramar tu cita?">
                  <button type="button" role="radio" aria-checked={quiere} className={quiere ? 'is-on' : ''} onClick={() => setQuiere(true)}>Sí</button>
                  <button type="button" role="radio" aria-checked={!quiere} className={!quiere ? 'is-on' : ''} onClick={() => setQuiere(false)}>No</button>
                </div>
              </div>
              <fieldset className="dc-lock" disabled={!quiere}>
                <div className="dc-two">
                  <label className="dc-field"><span>Nueva fecha</span><input type="date" min={hoy()} value={fecha} onChange={(evento) => { setFecha(evento.target.value); setBloqueId('') }} /></label>
                  <label className="dc-field">
                    <span>Nueva hora</span>
                    <select value={bloqueId} onChange={(evento) => setBloqueId(evento.target.value)}>
                      <option value="">{bloques.length ? 'Selecciona un horario' : 'Sin horarios'}</option>
                      {bloques.map((item) => <option key={item.id} value={item.id}>{formatClinicTime(item.inicio)} – {formatClinicTime(item.fin)}</option>)}
                    </select>
                  </label>
                </div>
              </fieldset>
              {quiere && bloques.length === 0 && <p className="dc-hint">No hay bloques libres ese día. Prueba con otra fecha.</p>}
              <button type="button" className="dc-btn dc-btn--primary" onClick={confirmar} disabled={!quiere || !bloque || enviando}>{enviando ? 'Guardando...' : 'Confirmar cambio'}</button>
            </>
          ) : <p className="dc-hint">Solo se pueden reprogramar citas Pendientes o Aceptadas antes de su fecha y hora.</p>}
          <Link to="/paciente/citas" className="dc-back">← Volver a mis citas</Link>
        </aside>

        <section className="dc-card dc-preconsult">
          <h2>Preconsulta</h2>
          <p className="dc-hint">Comparte el motivo y antecedentes iniciales con el médico asignado.</p>
          <label className="dc-field"><span>Motivo de consulta</span><textarea value={motivoConsulta} onChange={(evento) => setMotivoConsulta(evento.target.value)} disabled={!puedeCambiar} /></label>
          <label className="dc-field"><span>Antecedentes iniciales (opcional)</span><textarea value={antecedentesIniciales} onChange={(evento) => setAntecedentesIniciales(evento.target.value)} disabled={!puedeCambiar} /></label>
          {puedeCambiar && <div className="dc-preconsult__actions"><button type="button" className="dc-btn dc-btn--primary" onClick={guardarPreconsulta} disabled={!motivoConsulta.trim() || guardandoPreconsulta}>{guardandoPreconsulta ? 'Guardando...' : 'Guardar preconsulta'}</button></div>}
        </section>
      </div>
    </>
  )
}
