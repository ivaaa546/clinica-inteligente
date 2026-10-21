import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ChevronDown, CalendarDays, ArrowRight, Info } from 'lucide-react'
import './SolicitarCita.css'

// TODO: reemplazar por datos reales de la API (services/medicos.js)
const PACIENTE = { nombre: 'Tilin Insano', email: 'correo@ejemplo.com' }

const MEDICOS = [
  { id: 1, nombre: 'Dra. Elena Torres', iniciales: 'ET', especialidad: 'Medicina general' },
  { id: 2, nombre: 'Dr. Pablo Ríos', iniciales: 'PR', especialidad: 'Medicina general' },
]

const BLOQUES = ['09:00–09:30', '10:00–10:30', '10:30–11:00', '11:30–12:00']

const hoy = () => {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

const aFecha = (iso) => new Date(`${iso}T00:00:00`)
const capitalizar = (t) => t.charAt(0).toUpperCase() + t.slice(1)

export default function SolicitarCita() {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [especialidad, setEspecialidad] = useState('Medicina general')
  const [medicoId, setMedicoId] = useState(1)
  const [fecha, setFecha] = useState(hoy())
  const [bloque, setBloque] = useState('')

  const especialidades = useMemo(() => [...new Set(MEDICOS.map((m) => m.especialidad))], [])

  const medicos = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return MEDICOS.filter(
      (m) =>
        (!especialidad || m.especialidad === especialidad) &&
        (!q || `${m.nombre} ${m.especialidad}`.toLowerCase().includes(q)),
    )
  }, [busqueda, especialidad])

  const medico = MEDICOS.find((m) => m.id === medicoId)

  const diaLargo = fecha
    ? capitalizar(aFecha(fecha).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' }))
    : ''
  const diaCorto = fecha
    ? aFecha(fecha).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '')
    : ''

  const completo = Boolean(medico && fecha && bloque)

  const enviar = () => {
    if (!completo) return
    // TODO: conectar con la API (services/citas.js)
    console.log({ medicoId, fecha, bloque })
    navigate('/paciente')
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
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <Search size={18} color="#4f6e5b" />
              </span>
            </label>

            <label className="sol-field">
              <span>Especialidad</span>
              <span className="sol-input">
                <select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
                  <option value="">Todas las especialidades</option>
                  {especialidades.map((e) => <option key={e}>{e}</option>)}
                </select>
                <ChevronDown size={18} color="#4f6e5b" />
              </span>
            </label>
          </div>

          <div className="sol-doctors" role="radiogroup" aria-label="Médico">
            {medicos.length === 0 && <p className="sol-empty">No hay médicos que coincidan con tu búsqueda.</p>}
            {medicos.map((m) => {
              const activo = m.id === medicoId
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  className={`sol-doctor ${activo ? 'is-selected' : ''}`}
                  onClick={() => setMedicoId(m.id)}
                >
                  <span className="sol-doctor__top">
                    <span className="sol-doctor__avatar">{m.iniciales}</span>
                    <span className="sol-radio" />
                  </span>
                  <strong>{m.nombre}</strong>
                  <small>{m.especialidad}</small>
                </button>
              )
            })}
          </div>

          <hr />

          <div className="sol-schedule">
            <div className="sol-date">
              <label className="sol-field">
                <span>Fecha</span>
                <span className="sol-input">
                  <input type="date" min={hoy()} value={fecha} onChange={(e) => { setFecha(e.target.value); setBloque('') }} />
                  <CalendarDays size={18} color="#4f6e5b" />
                </span>
              </label>
              <small>{diaLargo}</small>
            </div>

            <div className="sol-slots">
              <span className="sol-slots__title">Bloques disponibles (30 min)</span>
              <div className="sol-slots__list">
                {BLOQUES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`sol-slot ${bloque === b ? 'is-selected' : ''}`}
                    onClick={() => setBloque(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <small>Solo se muestran bloques libres de 30 min.</small>
            </div>
          </div>

          <hr />
        </section>

        <aside className="sol-side">
          <div className="sol-summary">
            <h2>Tu solicitud</h2>
            <span className="sol-badge">Pendiente de aceptación</span>

            <dl>
              <div><dt>Paciente</dt><dd>{PACIENTE.nombre}</dd></div>
              <div><dt>Profesional</dt><dd>{medico ? medico.nombre : '—'}</dd></div>
              <div><dt>Especialidad</dt><dd>{medico ? medico.especialidad : '—'}</dd></div>
              <div><dt>Fecha y hora</dt><dd>{diaCorto && bloque ? `${diaCorto} · ${bloque}` : 'Selecciona un bloque'}</dd></div>
              <div><dt>Correo electrónico</dt><dd className="is-plain">{PACIENTE.email}</dd></div>
            </dl>

            <hr />
            <button type="button" className="sol-submit" disabled={!completo} onClick={enviar}>
              <ArrowRight size={18} /> Solicitar cita
            </button>
          </div>

          <div className="sol-info">
            <Info size={17} color="#4f6e5b" />
            <p>
              La solicitud queda pendiente hasta que el médico la acepte o rechace. Si el horario
              ya está ocupado, el sistema mostrará una alternativa disponible.
            </p>
          </div>

          <Link to="/paciente" className="sol-back">← Volver a mis solicitudes</Link>
        </aside>
      </div>
    </>
  )
}