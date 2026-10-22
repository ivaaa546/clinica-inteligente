import { useEffect, useState } from 'react'
import { Info, FileText, Printer, Download } from 'lucide-react'
import { listOwnPrescriptions } from '../../api/prescriptions.js'
import ApiError from '../../components/ApiError.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import { useAuth } from '../../auth/useAuth.js'
import './Diagnosticos.css'

const DATOS_RECETA = [
  ['DOSIS', 'dosis'],
  ['VÍA', 'via'],
  ['FRECUENCIA', 'frecuencia'],
  ['DURACIÓN', 'duracion'],
  ['INDICACIONES', 'indicaciones'],
]

function Receta({ receta }) {
  return (
    <div className="dx-receta">
      <div className="dx-receta__head">
        <strong>Receta</strong>
        <span className="dx-pill dx-pill--soft">Receta simple</span>
      </div>

      <div className="dx-data">
        <span className="dx-label">MEDICAMENTO</span>
        <p className="dx-strong">{receta.medicamento}</p>
      </div>

      <div className="dx-list-data">
        {DATOS_RECETA.map(([title, key]) => (
          <div className="dx-data" key={key}>
            <span className="dx-label">{title}</span>
            <p>{receta[key]}</p>
          </div>
        ))}
      </div>

      <div className="dx-actions">
        <button type="button" disabled title="La visualización de recetas no está disponible todavía">
          <FileText size={18} /> Abrir receta (no disponible)
        </button>
        <button type="button" onClick={() => window.print()}>
          <Printer size={18} /> Imprimir vista
        </button>
        <button type="button" disabled title="La descarga PDF no está disponible todavía">
          <Download size={18} /> Descargar PDF (no disponible)
        </button>
      </div>
    </div>
  )
}

export default function Diagnosticos() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    listOwnPrescriptions()
      .then((items) => {
        if (!active) return
        const values = Array.isArray(items) ? items : []
        setPrescriptions(values)
        setSelectedId(values[0]?.id || null)
      })
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [])

  const selected = prescriptions.find((prescription) => prescription.id === selectedId) || prescriptions[0]

  return (
    <>
      <div className="dx-head">
        <div>
          <h1>Mis diagnósticos y recetas</h1>
          <p>Diagnósticos y recetas propias disponibles en tu cuenta{user?.nombre ? ` · ${user.nombre}` : ''}.</p>
        </div>
        {!loading && !error && <span className="dx-pill">{prescriptions.length} {prescriptions.length === 1 ? 'receta' : 'recetas'}</span>}
      </div>

      <div className="dx-notice">
        <Info size={16} color="#0e5733" />
        <p>
          Solo se muestran los datos seguros disponibles para pacientes. Las recetas son simples,
          sin firma digital ni validez legal. Esta pantalla no representa un historial clínico completo.
        </p>
      </div>

      {loading && <LoadingState message="Cargando tus recetas…" />}
      {error && <ApiError error={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && prescriptions.length === 0 && (
        <EmptyState title="No tienes recetas disponibles" message="Las recetas aparecerán aquí cuando un médico las registre en una consulta." />
      )}

      {!loading && !error && selected && (
        <div className="dx-main">
          <section className="dx-panel">
            <h2>Recetas disponibles</h2>

            {prescriptions.map((prescription) => (
              <article
                key={prescription.id}
                className={`dx-registro ${prescription.id === selected.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(prescription.id)}
              >
                <div className="dx-registro__head">
                  <div>
                    <strong>{prescription.medicamento}</strong>
                    <small>Receta propia</small>
                  </div>
                </div>

                <div className="dx-data">
                  <span className="dx-label">DIAGNÓSTICO</span>
                  <p className="dx-strong">{prescription.consulta?.diagnostico || 'No disponible en esta proyección'}</p>
                </div>

                <Receta receta={prescription} />
              </article>
            ))}
          </section>

          <aside className="dx-side">
            <div className="dx-panel">
              <h2>Datos disponibles</h2>
              <span className="dx-pill">Receta simple</span>
              <p className="dx-strong">{selected.medicamento}</p>
              <p className="dx-muted">Diagnóstico: {selected.consulta?.diagnostico || 'No disponible'}</p>
              <hr />
              <small className="dx-muted">PACIENTE</small>
              <p className="dx-strong">{user?.nombre || 'Mi cuenta'}</p>
            </div>

            <div className="dx-panel">
              <FileText size={24} color="#16713e" />
              <h2>Información limitada por seguridad</h2>
              <p className="dx-muted">
                El endpoint de pacientes no incluye fechas, profesional, estado de emisión ni PDF.
                No se muestran datos inventados para completar esos campos.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
