import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Video, MapPin } from 'lucide-react'
import EstadoCita from '../../components/EstadoCita'
import ModalidadTag from '../../components/ModalidadTag'
import { PACIENTE } from './datosEjemplo'
import { bloquesLibres, cancelarCita, obtenerCita, reprogramarCita } from '../../services/citasService'
import { diaLargo, formatearFecha, hoyISO, proximoDiaHabil, separarBloque } from '../../shared/lib/fechas'
import './DetalleCita.css'

const ACTIVAS = ['PENDIENTE', 'ACEPTADA']

const iniciales = (nombre) =>
  nombre.replace(/^Dra?\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')

/**
 * Detalle de una cita (solo lectura).
 * Arriba se destaca la modalidad: si es videollamada, el botón para entrar a la sala.
 * Si la cita se puede cambiar, aparece "¿Quieres reprogramar tu cita?"; solo al
 * responder "Sí" se habilitan los campos.
 * La ruta /citas/:id/reprogramar abre esta misma pantalla con "Sí" ya marcado.
 */
export default function DetalleCita() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [cita, setCita] = useState(null)
  const [error, setError] = useState('')
  const [quiere, setQuiere] = useState(pathname.endsWith('/reprogramar'))
  const [fecha, setFecha] = useState(proximoDiaHabil())
  const [bloques, setBloques] = useState([])
  const [bloque, setBloque] = useState('')
  const [cargandoBloques, setCargandoBloques] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let vigente = true
    obtenerCita(id).then((c) => vigente && setCita(c)).catch((e) => vigente && setError(e.message))
    return () => { vigente = false }
  }, [id])

  // Si el usuario quiere reprogramar, carga los bloques libres de ese médico en la fecha elegida
  useEffect(() => {
    if (!cita || !quiere) return
    let vigente = true
    void Promise.resolve().then(() => {
      if (!vigente) return []
      setCargandoBloques(true)
      setBloque('')
      return bloquesLibres(cita.medicoId, fecha)
    })
      .then((b) => { if (vigente) { setBloques(b); setBloque(b[0] ?? '') } })
      .catch((e) => vigente && setAviso(e.message))
      .finally(() => vigente && setCargandoBloques(false))
    return () => { vigente = false }
  }, [cita, quiere, fecha])

  if (error) return <p className="dc-state">{error} <Link to="/paciente/citas">Volver a mis citas</Link></p>
  if (!cita) return <p className="dc-state">Cargando cita...</p>

  const activa = ACTIVAS.includes(cita.estado)
  const puedeCambiar = cita.futura && activa
  const virtual = cita.modalidad === 'VIDEOLLAMADA'
  const { inicio, fin } = separarBloque(cita.hora)

  // Estado del botón de la videollamada
  const llamadaFinalizada = cita.llamada === 'FINALIZADA'
  const puedeUnirse = virtual && cita.estado === 'ACEPTADA' && !llamadaFinalizada
  const etiquetaUnirse = cita.llamada === 'EN_CURSO' ? 'Volver a la videollamada' : 'Unirse a la videollamada'

  const cancelar = async () => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    setEnviando(true)
    setAviso('')
    try {
      setCita(await cancelarCita(cita.codigo))
      setQuiere(false)
    } catch (e) {
      setAviso(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const confirmar = async () => {
    setEnviando(true)
    setAviso('')
    try {
      await reprogramarCita(cita.codigo, { fecha, bloque })
      navigate('/paciente/citas')
    } catch (e) {
      setAviso(e.message)
      setEnviando(false)
    }
  }

  const datos = [
    ['Especialidad', cita.especialidad],
    ['Fecha', formatearFecha(cita.iso)],
    ['Hora', `${inicio} – ${fin} h`],
    ['Modalidad', <ModalidadTag key="m" modalidad={cita.modalidad} />],
    ['Profesional', cita.medico],
    ['Paciente', PACIENTE.nombre],
    ['Contacto', `${PACIENTE.email} · ${PACIENTE.telefono}`, true],
  ]

  return (
    <>
      <div className="dc-head">
        <div>
          <h1>Detalle de la cita</h1>
          <p>
            Cita {cita.codigo}
            {cita.citaOrigen && ` · Reprogramada desde ${cita.citaOrigen}`}
          </p>
        </div>
        <EstadoCita estado={cita.estado} />
      </div>

      {aviso && <p className="dc-error" role="alert">{aviso}</p>}

      {/* Modalidad destacada */}
      <section className={`dc-hero ${virtual ? 'dc-hero--virtual' : 'dc-hero--presencial'}`}>
        <span className="dc-hero__icon">
          {virtual ? <Video size={26} color="#fff" /> : <MapPin size={26} color="#16713e" />}
        </span>

        <div className="dc-hero__text">
          <strong>{virtual ? 'Cita por videollamada' : 'Cita presencial'}</strong>
          <span>
            {diaLargo(cita.iso)} · {inicio} – {fin} h · {cita.medico}
          </span>
          {virtual && cita.estado === 'PENDIENTE' && (
            <small>Podrás entrar a la sala cuando el médico acepte la cita.</small>
          )}
          {virtual && llamadaFinalizada && <small>La videollamada ya finalizó.</small>}
          {!virtual && activa && <small>Acude a la clínica a la hora indicada.</small>}
        </div>

        <div className="dc-hero__actions">
          {virtual && activa && (
            puedeUnirse ? (
              <Link to={`/paciente/citas/${cita.codigo}/llamada`} className="dc-join">
                <Video size={18} /> {etiquetaUnirse}
              </Link>
            ) : (
              <button type="button" className="dc-join" disabled>
                <Video size={18} /> {llamadaFinalizada ? 'Videollamada finalizada' : 'Unirse a la videollamada'}
              </button>
            )
          )}
          {puedeCambiar && (
            <button type="button" className="dc-cancel" onClick={cancelar} disabled={enviando}>
              Cancelar cita
            </button>
          )}
        </div>
      </section>

      <div className="dc-main">
        <section className="dc-card">
          <div className="dc-who">
            <span className="dc-who__avatar">{iniciales(cita.medico)}</span>
            <div>
              <strong>{cita.medico}</strong>
              <small>{cita.especialidad}</small>
            </div>
          </div>

          <dl className="dc-data">
            {datos.map(([k, v, ancho]) => (
              <div key={k} className={ancho ? 'is-wide' : ''}><dt>{k}</dt><dd>{v}</dd></div>
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
                  <label className="dc-field">
                    <span>Nueva fecha</span>
                    <input type="date" min={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                  </label>

                  <label className="dc-field">
                    <span>Nueva hora</span>
                    <select value={bloque} onChange={(e) => setBloque(e.target.value)} disabled={bloques.length === 0}>
                      {bloques.length === 0 && <option value="">{cargandoBloques ? 'Buscando horarios...' : 'Sin horarios'}</option>}
                      {bloques.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>
                </div>
              </fieldset>

              {quiere && !cargandoBloques && bloques.length === 0 && (
                <p className="dc-hint">No hay bloques libres ese día. Prueba con otra fecha.</p>
              )}

              <button
                type="button"
                className="dc-btn dc-btn--primary"
                onClick={confirmar}
                disabled={!quiere || !bloque || enviando}
              >
                {enviando ? 'Guardando...' : 'Confirmar cambio'}
              </button>
            </>
          ) : (
            <p className="dc-hint">Solo se pueden reprogramar citas Pendientes o Aceptadas antes de su fecha y hora.</p>
          )}

          <Link to="/paciente/citas" className="dc-back">← Volver a mis citas</Link>
        </aside>
      </div>
    </>
  )
}
