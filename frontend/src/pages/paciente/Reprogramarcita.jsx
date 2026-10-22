import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Info } from 'lucide-react'
import './Reprogramarcita.css'

// TODO: reemplazar por la cita real de la API (GET /citas/:id)
const CITA = {
  fecha: '19 oct 2026', inicio: '10:30 h', fin: '11:00 h',
  estado: 'Aceptada', especialidad: 'Medicina general',
  medico: 'Dra. Elena Torres', iniciales: 'ET',
  paciente: 'Tilin Insano', email: 'correo@ejemplo.com', telefono: '+502 0000 0000',
}

// TODO: los bloques libres deben venir del backend según médico y fecha
const BLOQUES = ['09:00 – 09:30', '10:00 – 10:30', '11:00 – 11:30', '11:30 – 12:00']

const hoy = () => {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export default function ReprogramarCita() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fechaRef = useRef(null)

  const [fecha, setFecha] = useState(hoy())
  const [hora, setHora] = useState(BLOQUES[2])
  const [error, setError] = useState('')

  const puedeCambiar = CITA.estado === 'Aceptada' // TODO: validar también "antes del inicio" en el backend

  const irAlFormulario = () => fechaRef.current?.focus()

  const confirmar = () => {
    if (!fecha) return setError('Selecciona una fecha para la nueva cita.')
    setError('')
    // TODO: conectar con la API (la original queda "Reprogramada" y se crea una nueva "Pendiente" vinculada)
    console.log({ citaOriginal: id, nuevaFecha: fecha, nuevaHora: hora })
    navigate('/paciente')
  }

  const cancelarCita = () => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    // TODO: conectar con la API
    console.log('Cancelar', id)
    navigate('/paciente')
  }

  const filas = [
    ['Especialidad', CITA.especialidad], ['Fecha', CITA.fecha], ['Inicio', CITA.inicio],
    ['Fin', CITA.fin], ['Estado', CITA.estado],
  ]
  const participantes = [
    ['Paciente', CITA.paciente], ['Profesional', CITA.medico],
    ['Contacto', `${CITA.email} · ${CITA.telefono}`],
  ]

  return (
    <>
      <div className="rep-head">
        <div>
          <h1>Mi cita / Reprogramar</h1>
          <p>Cita {id} · Cambia la fecha y hora antes del inicio de la consulta.</p>
        </div>
        <span className="rep-pill">{CITA.estado}</span>
      </div>

      <div className="rep-notice">
        <Info size={16} color="#0e5733" />
        <p>
          Solo puedes reprogramar antes del inicio. La cita original quedará como Reprogramada y se
          creará una nueva solicitud Pendiente vinculada a la anterior.
        </p>
      </div>

      <div className="rep-main">
        <div className="rep-left">
          <section className="rep-card">
            <div className="rep-card__head">
              <div>
                <h2>Cita {id}</h2>
                <p>{CITA.medico} · {CITA.especialidad}</p>
              </div>
              <span className="rep-pill">{CITA.estado}</span>
            </div>

            <dl className="rep-rows">
              {filas.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            <hr />
            <dl className="rep-rows">
              {participantes.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </section>

          <section className="rep-card">
            <h2>Acciones disponibles</h2>
            <button type="button" className="rep-btn rep-btn--primary" onClick={irAlFormulario} disabled={!puedeCambiar}>
              Reprogramar cita
            </button>
            <button type="button" className="rep-btn rep-btn--ghost" onClick={cancelarCita} disabled={!puedeCambiar}>
              Cancelar cita
            </button>
            <p className="rep-small">
              La cita original se conserva y el nuevo horario queda pendiente de aceptación médica.
            </p>
          </section>
        </div>

        <aside className="rep-right">
          <div className="rep-doctor">
            <span className="rep-doctor__avatar">{CITA.iniciales}</span>
            <strong>{CITA.medico}</strong>
            <span>{CITA.especialidad}</span>
          </div>

          <section className="rep-card">
            <h2>Reprogramar cita</h2>

            <label className="rep-field">
              <span>Fecha</span>
              <input ref={fechaRef} type="date" min={hoy()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </label>

            <label className="rep-field">
              <span>Hora</span>
              <select value={hora} onChange={(e) => setHora(e.target.value)}>
                {BLOQUES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>

            <div className="rep-field">
              <span>Duración</span>
              <div className="rep-static">30 min</div>
            </div>

            <div className="rep-field">
              <span>Estado</span>
              <div className="rep-static">Pendiente</div>
            </div>

            {error && <p className="rep-error" role="alert">{error}</p>}

            <button type="button" className="rep-btn rep-btn--primary rep-btn--fit" onClick={confirmar} disabled={!puedeCambiar}>
              Confirmar cambio
            </button>
            <p className="rep-small">
              La cita original quedará como Reprogramada y se creará una nueva solicitud Pendiente
              vinculada a la anterior.
            </p>
          </section>

          <div className="rep-notice rep-notice--side">
            <Info size={16} color="#0e5733" />
            <p>Solo puedes confirmar un cambio antes del inicio de la cita.</p>
          </div>

          <Link to="/paciente" className="rep-back">← Volver al inicio</Link>
        </aside>
      </div>
    </>
  )
}
