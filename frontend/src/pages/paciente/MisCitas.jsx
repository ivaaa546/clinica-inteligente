import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, CalendarX } from 'lucide-react'
import EstadoCita from '../../components/EstadoCita.jsx'
import ModalidadTag from '../../components/ModalidadTag.jsx'
import { cancelAppointment } from '../../features/citas/api/appointments.js'
import { usePatientAppointments } from '../../features/citas/hooks/usePatientAppointments.js'
import { formatClinicDate, formatClinicTime } from '../../shared/lib/date.js'
import './MisCitas.css'

const ACTIVAS = ['PENDIENTE', 'ACEPTADA']

const esProxima = (cita) => ACTIVAS.includes(cita.estado) && new Date(cita.inicio).getTime() > Date.now()
const FILTROS = [
  { id: 'proximas', label: 'Próximas', test: esProxima },
  { id: 'anteriores', label: 'Anteriores', test: (cita) => !esProxima(cita) },
  { id: 'todas', label: 'Todas', test: () => true },
]

export default function MisCitas() {
  const { appointments, doctors, loading, error: loadError } = usePatientAppointments()
  const [cambios, setCambios] = useState({})
  const [filtro, setFiltro] = useState('proximas')
  const [error, setError] = useState('')
  const [cancelando, setCancelando] = useState('')

  const citas = useMemo(() => appointments.map((cita) => cambios[cita.id] || cita), [appointments, cambios])

  const visibles = useMemo(() => {
    const prueba = FILTROS.find((item) => item.id === filtro)?.test || (() => true)
    return citas.filter(prueba).sort((a, b) => (
      filtro === 'proximas'
        ? new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
        : new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
    ))
  }, [citas, filtro])

  const cuenta = (item) => citas.filter(item.test).length

  const cancelar = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    setError('')
    setCancelando(id)
    try {
      const actualizada = await cancelAppointment(id)
      setCambios((actuales) => ({ ...actuales, [id]: actualizada }))
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo cancelar la cita.')
    } finally {
      setCancelando('')
    }
  }

  return (
    <>
      <div className="mc-head">
        <div>
          <h1>Mis citas</h1>
          <p>Consulta el estado de tus citas, cancélalas o reprográmalas antes de la fecha y hora.</p>
        </div>
        <Link to="/paciente/citas/solicitar" className="mc-cta"><Plus size={18} /> Solicitar cita</Link>
      </div>

      {(error || loadError) && <p className="mc-error" role="alert">{error || loadError?.message}</p>}

      <div className="mc-tabs" role="tablist">
        {FILTROS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filtro === item.id}
            className={filtro === item.id ? 'is-active' : ''}
            onClick={() => setFiltro(item.id)}
          >
            {item.label} <span>{cuenta(item)}</span>
          </button>
        ))}
      </div>

      <section className="mc-panel">
        {loading ? (
          <div className="mc-empty"><p>Cargando tus citas...</p></div>
        ) : visibles.length === 0 ? (
          <div className="mc-empty">
            <CalendarX size={28} color="#4f6e5b" />
            <p>No tienes citas en esta vista.</p>
          </div>
        ) : (
          <div className="mc-table">
            <div className="mc-row mc-row--head">
              <span>FECHA Y HORA</span><span>PROFESIONAL</span><span>ESTADO</span><span>ACCIÓN</span>
            </div>

            {visibles.map((cita) => {
              const editable = esProxima(cita)
              const medico = doctors[cita.medicoId]
              const nombreMedico = medico ? `${medico.nombre} ${medico.apellidos}` : 'Médico no disponible'
              return (
                <div className="mc-row" key={cita.id}>
                  <div className="mc-cell">
                    <strong>{formatClinicDate(cita.inicio) || 'Fecha no disponible'}</strong>
                    <small>{formatClinicTime(cita.inicio) || 'Hora no disponible'} · {cita.id}</small>
                  </div>
                  <div className="mc-cell">
                    <span>{nombreMedico}</span>
                    <small>{medico?.especialidad?.nombre || 'Especialidad no disponible'}</small>
                  </div>
                  <div className="mc-state"><EstadoCita estado={cita.estado} /><ModalidadTag modalidad={cita.modalidad} /></div>
                  <div className="mc-actions">
                    <Link to={`/paciente/citas/${cita.id}`}>Ver detalle</Link>
                    {editable && <Link to={`/paciente/citas/${cita.id}/reprogramar`}>Reprogramar</Link>}
                    {editable && (
                      <button type="button" onClick={() => cancelar(cita.id)} disabled={cancelando === cita.id}>
                        {cancelando === cita.id ? 'Cancelando…' : 'Cancelar'}
                      </button>
                    )}
                    {cita.estado === 'COMPLETADA' && <Link to="/paciente/historial">Historial</Link>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
