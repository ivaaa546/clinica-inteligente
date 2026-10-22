import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, FileText } from 'lucide-react'
import { CONSULTAS, PACIENTE } from './datosEjemplo'
import './Diagnosticos.css'

export default function Diagnosticos() {
  const navigate = useNavigate()
  const [seleccion, setSeleccion] = useState(CONSULTAS[0].id)
  const actual = CONSULTAS.find((c) => c.id === seleccion)

  // La receta completa (y su impresión) vive en el módulo de recetas
  const abrirReceta = (e, idReceta) => {
    e.stopPropagation()
    navigate('/paciente/recetas', { state: { abrir: idReceta } })
  }

  return (
    <>
      <div className="dx-head">
        <div>
          <h1>Mi historial</h1>
          <p>
            Diagnósticos y consultas anteriores · {PACIENTE.nombre} · {PACIENTE.email} · {PACIENTE.telefono}
          </p>
        </div>
        <span className="dx-pill">{CONSULTAS.length} registros</span>
      </div>

      <div className="dx-notice">
        <Info size={16} color="#0e5733" />
        <p>
          Receta simple · Sin firma digital ni validez legal. Solo se muestran diagnósticos y
          recetas emitidas para este paciente.
        </p>
      </div>

      <div className="dx-main">
        <section className="dx-panel">
          <h2>Historial de diagnósticos</h2>

          {CONSULTAS.map((c) => (
            <article
              key={c.id}
              className={`dx-registro ${c.id === seleccion ? 'is-selected' : ''}`}
              onClick={() => setSeleccion(c.id)}
            >
              <div className="dx-registro__head">
                <div>
                  <strong>{c.medico.nombre}</strong>
                  <small>{c.medico.especialidad}</small>
                </div>
                <span className="dx-pill">{c.estado}</span>
              </div>

              <div className="dx-meta">
                <strong>{c.fecha} · {c.hora}</strong>
                <span>Consulta {c.id} / {c.cita}</span>
              </div>

              <hr />

              <div className="dx-data">
                <span className="dx-label">DIAGNÓSTICO</span>
                <p className="dx-strong">{c.diagnostico}</p>
              </div>

              {c.receta && (
                <div className="dx-mini">
                  <div>
                    <span className="dx-label">RECETA ASOCIADA</span>
                    <p>{c.receta.medicamento} · {c.receta.dosis} · {c.receta.frecuencia}</p>
                  </div>
                  <button type="button" onClick={(e) => abrirReceta(e, c.receta.id)}>
                    <FileText size={17} /> Abrir receta
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>

        <aside className="dx-side">
          <div className="dx-panel">
            <h2>Datos de la consulta</h2>
            <span className="dx-pill">{actual.estado}</span>
            <p className="dx-strong">{actual.fecha} · {actual.hora}</p>
            <p className="dx-muted">Consulta {actual.id} · Cita {actual.cita}</p>
            <hr />
            <small className="dx-muted">PACIENTE · {PACIENTE.id}</small>
            <p className="dx-strong">{PACIENTE.nombre}</p>
            <small className="dx-muted">PROFESIONAL</small>
            <p className="dx-strong">{actual.medico.nombre}</p>
            <p className="dx-muted">{actual.medico.especialidad}</p>
          </div>
        </aside>
      </div>
    </>
  )
}