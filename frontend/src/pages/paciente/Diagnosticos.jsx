import { useState } from 'react'
import { Info, FileText, Printer, Download } from 'lucide-react'
import './Diagnosticos.css'

// TODO: reemplazar por datos reales de la API (services/consultas.js)
const PACIENTE = {
  id: 'P-0024',
  nombre: 'Tilin Insano',
  email: 'correo@ejemplo.com',
  telefono: '+502 0000 0000',
}

const REGISTROS = [
  {
    id: 'CO-1042', cita: 'C-1042', fecha: '19 oct 2026', hora: '10:30–11:00',
    medico: 'Dra. Elena Torres', especialidad: 'Medicina general', estado: 'Completada',
    diagnostico: 'Cefalea tensional recurrente',
    receta: {
      estado: 'Emitida', medicamento: 'Medicamento A', dosis: '1 unidad', via: 'Oral',
      frecuencia: 'Cada 24 horas', duracion: '3 días', indicaciones: 'Seguir la pauta indicada por el médico',
    },
  },
  {
    id: 'CO-0938', cita: 'C-0938', fecha: '17 sep 2026', hora: '09:00–09:30',
    medico: 'Dra. Elena Torres', especialidad: 'Medicina general', estado: 'Completada',
    diagnostico: 'Revisión general',
    receta: {
      estado: 'Emitida', medicamento: 'Medicamento A', dosis: '1 unidad', via: 'Oral',
      frecuencia: 'Cada 24 horas', duracion: '3 días', indicaciones: 'Seguir la pauta indicada por el médico',
    },
  },
]

const DATOS_RECETA = [
  ['DOSIS', 'dosis'], ['VÍA', 'via'], ['FRECUENCIA', 'frecuencia'],
  ['DURACIÓN', 'duracion'], ['INDICACIONES', 'indicaciones'],
]

function Receta({ receta }) {
  // TODO: conectar abrir / descargar con la API (PDF de la receta)
  const abrir = () => console.log('Abrir receta')
  const descargar = () => console.log('Descargar receta')

  return (
    <div className="dx-receta">
      <div className="dx-receta__head">
        <strong>Receta asociada</strong>
        <span className="dx-pill dx-pill--soft">{receta.estado}</span>
      </div>

      <div className="dx-data">
        <span className="dx-label">MEDICAMENTO</span>
        <p className="dx-strong">{receta.medicamento}</p>
      </div>

      <div className="dx-list-data">
        {DATOS_RECETA.map(([titulo, clave]) => (
          <div className="dx-data" key={clave}>
            <span className="dx-label">{titulo}</span>
            <p>{receta[clave]}</p>
          </div>
        ))}
      </div>

      <div className="dx-actions">
        <button type="button" onClick={abrir}><FileText size={18} /> Abrir receta</button>
        <button type="button" onClick={() => window.print()}><Printer size={18} /> Imprimir</button>
        <button type="button" onClick={descargar}><Download size={18} /> Descargar</button>
      </div>
    </div>
  )
}

export default function Diagnosticos() {
  const [seleccion, setSeleccion] = useState(REGISTROS[0].id)
  const actual = REGISTROS.find((r) => r.id === seleccion)

  return (
    <>
      <div className="dx-head">
        <div>
          <h1>Mis diagnósticos y recetas</h1>
          <p>
            Historial de diagnósticos y recetas emitidas por tus médicos · {PACIENTE.nombre} ·{' '}
            {PACIENTE.email} · {PACIENTE.telefono}
          </p>
        </div>
        <span className="dx-pill">{REGISTROS.length} registros</span>
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
          <h2>Historial de diagnósticos y recetas</h2>

          {REGISTROS.map((r) => (
            <article
              key={r.id}
              className={`dx-registro ${r.id === seleccion ? 'is-selected' : ''}`}
              onClick={() => setSeleccion(r.id)}
            >
              <div className="dx-registro__head">
                <div>
                  <strong>{r.medico}</strong>
                  <small>{r.especialidad}</small>
                </div>
                <span className="dx-pill">{r.estado}</span>
              </div>

              <div className="dx-meta">
                <strong>{r.fecha} · {r.hora}</strong>
                <span>Consulta {r.id} / {r.cita}</span>
              </div>

              <hr />

              <div className="dx-data">
                <span className="dx-label">DIAGNÓSTICO</span>
                <p className="dx-strong">{r.diagnostico}</p>
              </div>

              {r.receta && <Receta receta={r.receta} />}
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
            <p className="dx-strong">{actual.medico}</p>
            <p className="dx-muted">{actual.especialidad}</p>
          </div>

          <div className="dx-panel">
            <FileText size={24} color="#16713e" />
            <h2>Tu receta estará disponible al finalizar</h2>
            <p className="dx-muted">
              Cuando tu médico cierre la consulta, podrás revisar tu receta e indicaciones en tu
              cuenta, en Mis recetas.
            </p>
            <span className="dx-pill dx-pill--soft">Pendiente de finalizar</span>
          </div>
        </aside>
      </div>
    </>
  )
}