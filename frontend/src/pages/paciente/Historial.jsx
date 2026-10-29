import { useEffect, useState } from 'react'
import { ClipboardList, Stethoscope } from 'lucide-react'
import { listOwnClinicalHistory } from '../../api/consultations.js'
import ApiError from '../../components/ApiError.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import { formatClinicDate } from '../../lib/date.js'
import './Diagnosticos.css'

const VITALS = [
  ['pesoLb', 'Peso', 'lb'], ['tallaCm', 'Talla', 'cm'], ['temperatura', 'Temperatura', '°C'],
  ['presionArterial', 'Presión arterial', ''], ['frecCardiaca', 'Frecuencia cardíaca', 'lpm'], ['frecRespiratoria', 'Frecuencia respiratoria', 'rpm'],
]

export default function Historial() {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    listOwnClinicalHistory()
      .then((items) => active && setConsultations(Array.isArray(items) ? items : []))
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  return (
    <>
      <div className="dx-head">
        <div>
          <h1>Mi historial clínico</h1>
          <p>Consultas completadas, diagnósticos, signos vitales y recetas asociadas.</p>
        </div>
        {!loading && !error && <span className="dx-pill">{consultations.length} {consultations.length === 1 ? 'consulta' : 'consultas'}</span>}
      </div>

      <div className="dx-notice">
        <ClipboardList size={16} color="#0e5733" />
        <p>Este historial muestra únicamente información clínica segura de tus propias consultas completadas.</p>
      </div>

      {loading && <LoadingState message="Cargando tu historial clínico…" />}
      {error && <ApiError error={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && consultations.length === 0 && <EmptyState title="Aún no tienes consultas completadas" message="Tu historial aparecerá aquí cuando un médico complete una consulta." />}

      {!loading && !error && consultations.length > 0 && (
        <div className="dx-main">
          <section className="dx-panel">
            <h2>Consultas completadas</h2>
            {consultations.map((consultation) => (
              <article className="dx-registro" key={consultation.id}>
                <div className="dx-registro__head">
                  <div>
                    <strong>{formatClinicDate(consultation.fechaConsulta || consultation.cita?.inicio) || 'Fecha no disponible'}</strong>
                    <small>{consultation.cita?.medico?.usuario ? `${consultation.cita.medico.usuario.nombre} ${consultation.cita.medico.usuario.apellidos} · ${consultation.cita.medico.especialidad?.nombre || 'Especialidad no disponible'}` : 'Profesional no disponible'}</small>
                  </div>
                  <span className="dx-pill">Completada</span>
                </div>
                <div className="dx-data"><span className="dx-label">MOTIVO DE CONSULTA</span><p>{consultation.motivoConsulta}</p></div>
                <div className="dx-data"><span className="dx-label">DIAGNÓSTICO</span><p className="dx-strong">{consultation.diagnostico}</p></div>
                <div className="dx-data">
                  <span className="dx-label"><Stethoscope size={14} /> SIGNOS VITALES</span>
                  <p>{VITALS.map(([field, label, unit]) => {
                    const value = consultation.signosVitales?.[field]
                    const displayed = value === null || value === undefined ? 'No registrado' : `${value}${unit ? ` ${unit}` : ''}`
                    return `${label}: ${displayed}`
                  }).join(' · ')}</p>
                </div>
                {consultation.recetas?.length > 0 && (
                  <div className="dx-data"><span className="dx-label">RECETAS</span><p>{consultation.recetas.map((prescription) => prescription.medicamento).join(', ')}</p></div>
                )}
              </article>
            ))}
          </section>
        </div>
      )}
    </>
  )
}
