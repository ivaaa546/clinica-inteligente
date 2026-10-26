import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ChevronDown, CalendarDays, ArrowRight, Info, MapPin, Video } from 'lucide-react'
import ModalidadTag from '../../components/ModalidadTag'
import { PACIENTE } from './datosEjemplo'
import { bloquesLibres, listarMedicos, solicitarCita } from '../../services/citasService'
import { diaLargo, formatearFecha, hoyISO, proximoDiaHabil } from '../../lib/fechas'
import './SolicitarCita.css'

const MODALIDADES = [
  { id: 'PRESENCIAL', titulo: 'Presencial', texto: 'Acudes a la clínica a la hora de tu cita.', icon: MapPin },
  { id: 'VIDEOLLAMADA', titulo: 'Videollamada', texto: 'Te atienden por video desde donde estés.', icon: Video },
]

export default function SolicitarCita() {
  const navigate = useNavigate()
  const [medicos, setMedicos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [medicoId, setMedicoId] = useState(null)
  const [fecha, setFecha] = useState(proximoDiaHabil())
  const [bloques, setBloques] = useState([])
  const [bloque, setBloque] = useState('')
  const [cargandoBloques, setCargandoBloques] = useState(false)
  const [modalidad, setModalidad] = useState('PRESENCIAL')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // Médicos activos
  useEffect(() => {
    listarMedicos()
      .then((lista) => { setMedicos(lista); setMedicoId(lista[0]?.id ?? null) })
      .catch((e) => setError(e.message))
  }, [])

  // Bloques libres del médico en la fecha elegida
  useEffect(() => {
    if (!medicoId || !fecha) return
    let vigente = true
    setCargandoBloques(true)
    setBloque('')
    bloquesLibres(medicoId, fecha)
      .then((b) => vigente && setBloques(b))
      .catch((e) => vigente && setError(e.message))
      .finally(() => vigente && setCargandoBloques(false))
    return () => { vigente = false }
  }, [medicoId, fecha])

  const especialidades = useMemo(() => [...new Set(medicos.map((m) => m.especialidad))], [medicos])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return medicos.filter(
      (m) => (!especialidad || m.especialidad === especialidad) && (!q || `${m.nombre} ${m.especialidad}`.toLowerCase().includes(q)),
    )
  }, [medicos, busqueda, especialidad])

  const medico = medicos.find((m) => m.id === medicoId)
  const completo = Boolean(medico && fecha && bloque)

  const enviar = async () => {
    if (!completo || enviando) return
    setEnviando(true)
    setError('')
    try {
      const nueva = await solicitarCita({ medicoId, fecha, bloque, modalidad })
      navigate(`/paciente/citas/${nueva.codigo}`)
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="sol-head">
        <h1>Solicitar cita</h1>
        <p>
          Elige médico, modalidad, día y bloque disponible de 30 min. La solicitud queda pendiente
          hasta que el médico la acepte o rechace.
        </p>
      </div>

      {error && <p className="sol-error" role="alert">{error}</p>}

      <div className="sol-grid">
        <section className="sol-panel">
          <h2>Médico y horario</h2>

          <div className="sol-row">
            <label className="sol-field">
              <span>Buscar médico activo</span>
              <span className="sol-input">
                <input type="text" placeholder="Buscar por nombre o especialidad" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
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
            {filtrados.length === 0 && <p className="sol-empty">No hay médicos que coincidan con tu búsqueda.</p>}
            {filtrados.map((m) => {
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

          <div className="sol-modes-wrap">
            <span className="sol-slots__title">¿Cómo quieres tu cita?</span>
            <div className="sol-modes" role="radiogroup" aria-label="Modalidad de la cita">
              {MODALIDADES.map(({ id, titulo, texto, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={modalidad === id}
                  className={`sol-mode ${modalidad === id ? 'is-selected' : ''}`}
                  onClick={() => setModalidad(id)}
                >
                  <Icon size={22} color="#16713e" />
                  <span><strong>{titulo}</strong><small>{texto}</small></span>
                  <span className="sol-radio" />
                </button>
              ))}
            </div>
          </div>

          <hr />

          <div className="sol-schedule">
            <div className="sol-date">
              <label className="sol-field">
                <span>Fecha</span>
                <span className="sol-input">
                  <input type="date" min={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                  <CalendarDays size={18} color="#4f6e5b" />
                </span>
              </label>
              <small>{fecha ? diaLargo(fecha) : ''}</small>
            </div>

            <div className="sol-slots">
              <span className="sol-slots__title">Bloques disponibles (30 min)</span>
              <div className="sol-slots__list">
                {cargandoBloques && <small>Buscando horarios...</small>}
                {!cargandoBloques && bloques.length === 0 && <small>No hay bloques libres ese día. Prueba con otra fecha.</small>}
                {bloques.map((b) => (
                  <button key={b} type="button" className={`sol-slot ${bloque === b ? 'is-selected' : ''}`} onClick={() => setBloque(b)}>
                    {b}
                  </button>
                ))}
              </div>
              <small>Solo se muestran bloques libres de 30 min.</small>
            </div>
          </div>
        </section>

        <aside className="sol-side">
          <div className="sol-summary">
            <h2>Tu solicitud</h2>
            <span className="sol-badge">Pendiente de aceptación</span>

            <dl>
              <div><dt>Paciente</dt><dd>{PACIENTE.nombre}</dd></div>
              <div><dt>Profesional</dt><dd>{medico ? medico.nombre : '—'}</dd></div>
              <div><dt>Especialidad</dt><dd>{medico ? medico.especialidad : '—'}</dd></div>
              <div><dt>Modalidad</dt><dd><ModalidadTag modalidad={modalidad} /></dd></div>
              <div><dt>Fecha y hora</dt><dd>{fecha && bloque ? `${formatearFecha(fecha)} · ${bloque}` : 'Selecciona un bloque'}</dd></div>
              <div><dt>Correo electrónico</dt><dd className="is-plain">{PACIENTE.email}</dd></div>
            </dl>

            <hr />
            <button type="button" className="sol-submit" disabled={!completo || enviando} onClick={enviar}>
              <ArrowRight size={18} /> {enviando ? 'Enviando...' : 'Solicitar cita'}
            </button>
          </div>

          <div className="sol-info">
            <Info size={17} color="#4f6e5b" />
            <p>
              La solicitud queda pendiente hasta que el médico la acepte o rechace.
              {modalidad === 'VIDEOLLAMADA' && ' Si es por videollamada, podrás entrar a la sala desde el detalle de la cita una vez aceptada.'}
            </p>
          </div>

          <Link to="/paciente/citas" className="sol-back">← Volver a mis citas</Link>
        </aside>
      </div>
    </>
  )
}
