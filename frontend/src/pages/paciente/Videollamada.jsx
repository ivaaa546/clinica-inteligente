import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Mic, MicOff, Video, VideoOff, PhoneOff, LogOut, Info } from 'lucide-react'
import { colgarLlamada, obtenerCita, unirseLlamada } from '../../services/citasService'
import { formatearFecha } from '../../lib/fechas'
import './Videollamada.css'

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/**
 * Sala de videollamada del paciente.
 *  - "Salir": abandona la sala pero la llamada sigue abierta; se puede volver a entrar.
 *  - "Colgar": termina la videollamada y ya no se puede volver a entrar.
 * Ya funciona tu cámara y micrófono (vista previa). La conexión con el médico
 * necesita un servicio de video en tiempo real (WebRTC / proveedor) que define el backend.
 */
export default function Videollamada() {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)

  const [cita, setCita] = useState(null)
  const [error, setError] = useState('')
  const [stream, setStream] = useState(null)
  const [errorMedia, setErrorMedia] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [segundos, setSegundos] = useState(0)

  // Carga la cita y entra a la sala
  useEffect(() => {
    let vigente = true
    ;(async () => {
      try {
        let c = await obtenerCita(id)
        if (c.modalidad === 'VIDEOLLAMADA' && c.estado === 'ACEPTADA' && c.llamada !== 'FINALIZADA') {
          c = await unirseLlamada(id)
        }
        if (vigente) setCita(c)
      } catch (e) {
        if (vigente) setError(e.message)
      }
    })()
    return () => { vigente = false }
  }, [id])

  const habilitada = cita?.modalidad === 'VIDEOLLAMADA' && cita?.estado === 'ACEPTADA' && cita?.llamada !== 'FINALIZADA'

  // Enciende cámara y micrófono; al salir los apaga
  useEffect(() => {
    if (!habilitada) return
    let cancelado = false
    let flujo = null

    async function iniciar() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMedia('Tu navegador no permite usar la cámara en esta página.')
        return
      }
      try {
        flujo = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (cancelado) { flujo.getTracks().forEach((t) => t.stop()); return }
        setStream(flujo)
      } catch {
        if (!cancelado) setErrorMedia('No se pudo acceder a la cámara o al micrófono. Revisa los permisos del navegador.')
      }
    }
    iniciar()

    return () => {
      cancelado = true
      flujo?.getTracks().forEach((t) => t.stop())
    }
  }, [habilitada])

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  // Tiempo en la sala
  useEffect(() => {
    if (!habilitada) return
    const t = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [habilitada])

  const alternarMic = () => {
    const siguiente = !micOn
    stream?.getAudioTracks().forEach((t) => { t.enabled = siguiente })
    setMicOn(siguiente)
  }
  const alternarCam = () => {
    const siguiente = !camOn
    stream?.getVideoTracks().forEach((t) => { t.enabled = siguiente })
    setCamOn(siguiente)
  }

  // Salir: la llamada sigue abierta y se puede volver a entrar desde el detalle de la cita
  const salir = () => navigate(`/paciente/citas/${id}`)

  // Colgar: termina la videollamada
  const colgar = async () => {
    if (!window.confirm('¿Quieres colgar? La videollamada terminará y ya no podrás volver a unirte.')) return
    try {
      await colgarLlamada(id)
    } finally {
      navigate(`/paciente/citas/${id}`)
    }
  }

  if (error || (cita && !habilitada)) {
    return (
      <div className="vc vc--center">
        <p>
          {error ||
            (cita.llamada === 'FINALIZADA'
              ? 'Esta videollamada ya finalizó.'
              : 'Esta videollamada no está disponible: la cita debe ser por videollamada y estar Aceptada.')}
        </p>
        <Link to={`/paciente/citas/${id}`} className="vc-link">Volver al detalle de la cita</Link>
      </div>
    )
  }
  if (!cita) return <div className="vc vc--center"><p>Cargando sala...</p></div>

  return (
    <div className="vc">
      <header className="vc-top">
        {/* Sin enlace: así no se sale de la sala por accidente */}
        <div className="vc-brand">
          <span><Plus size={18} color="#fff" /></span> TilinesMédicos
        </div>
        <div className="vc-info">
          <strong>Cita {cita.codigo}</strong>
          <small>{formatearFecha(cita.iso)} · {cita.hora}</small>
        </div>
        <span className="vc-timer">{mmss(segundos)}</span>
      </header>

      <main className="vc-stage">
        <div className="vc-remote">
          <span className="vc-remote__avatar">
            {cita.medico.replace(/^Dra?\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </span>
          <strong>{cita.medico}</strong>
          <p>Esperando a que el profesional se una a la sala...</p>
        </div>

        <div className="vc-self">
          <video ref={videoRef} autoPlay playsInline muted className={camOn && stream ? '' : 'is-off'} />
          {(!stream || !camOn) && (
            <div className="vc-self__off">
              <VideoOff size={22} />
              <small>{errorMedia ? 'Sin cámara' : camOn ? 'Iniciando cámara...' : 'Cámara apagada'}</small>
            </div>
          )}
          <span className="vc-self__tag">Tú</span>
        </div>

        {errorMedia && <p className="vc-alert" role="alert"><Info size={16} /> {errorMedia}</p>}
      </main>

      <footer className="vc-controls">
        <button type="button" className={`vc-btn ${micOn ? '' : 'is-off'}`} onClick={alternarMic} disabled={!stream} aria-label={micOn ? 'Silenciar micrófono' : 'Activar micrófono'}>
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
        <button type="button" className={`vc-btn ${camOn ? '' : 'is-off'}`} onClick={alternarCam} disabled={!stream} aria-label={camOn ? 'Apagar cámara' : 'Encender cámara'}>
          {camOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
        <button type="button" className="vc-btn vc-btn--ghost" onClick={salir} title="Salir de la sala sin terminar la llamada. Podrás volver a entrar.">
          <LogOut size={20} /> Salir
        </button>
        <button type="button" className="vc-btn vc-btn--leave" onClick={colgar} title="Terminar la videollamada">
          <PhoneOff size={22} /> Colgar
        </button>
      </footer>
    </div>
  )
}
