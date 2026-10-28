import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Mic, MicOff, Video, VideoOff, PhoneOff, LogOut, Info } from 'lucide-react'
import { colgarLlamadaMedico, obtenerCitaMedico, unirseLlamadaMedico } from '../../services/medicoService'
import { formatearFecha } from '../../lib/fechas'
import type { CitaAgenda } from '../../types/medico'
// Misma sala que ve el paciente: se reutilizan sus estilos (clases `vc-*`)
import '../paciente/Videollamada.css'

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/**
 * Sala de videollamada del médico (cita por videollamada ya aceptada).
 *  - "Salir": abandona la sala pero la llamada sigue abierta; se puede volver a entrar desde la agenda.
 *  - "Colgar": termina la videollamada y lleva a registrar la consulta.
 * Ya funciona tu cámara y micrófono (vista previa). La conexión con el paciente necesita un servicio de
 * video en tiempo real (WebRTC / proveedor) que define el backend.
 */
export default function Videollamada() {
  const { codigo = '' } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [cita, setCita] = useState<CitaAgenda | null>(null)
  const [error, setError] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [errorMedia, setErrorMedia] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [segundos, setSegundos] = useState(0)

  // Carga la cita y entra a la sala
  useEffect(() => {
    let vigente = true
    ;(async () => {
      try {
        let c = await obtenerCitaMedico(codigo)
        if (c.modalidad === 'VIDEOLLAMADA' && c.estado === 'ACEPTADA' && c.llamada !== 'FINALIZADA') {
          c = await unirseLlamadaMedico(codigo)
        }
        if (vigente) setCita(c)
      } catch (e) {
        if (vigente) setError((e as Error).message)
      }
    })()
    return () => { vigente = false }
  }, [codigo])

  const habilitada = cita?.modalidad === 'VIDEOLLAMADA' && cita?.estado === 'ACEPTADA' && cita?.llamada !== 'FINALIZADA'

  // Enciende cámara y micrófono; al salir los apaga
  useEffect(() => {
    if (!habilitada) return
    let cancelado = false
    let flujo: MediaStream | null = null

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

  // Salir: la llamada sigue abierta y se puede volver a entrar desde la agenda
  const salir = () => navigate('/medico/agenda')

  // Colgar: termina la videollamada y pasa a registrar la consulta (si corresponde)
  const colgar = async () => {
    if (!window.confirm('¿Quieres colgar? La videollamada terminará y ya no podrán volver a unirse.')) return
    const registrar = cita?.puedeConsultar
    try {
      await colgarLlamadaMedico(codigo)
    } finally {
      navigate(registrar ? `/medico/consulta/${codigo}` : '/medico/agenda')
    }
  }

  if (error || (cita && !habilitada)) {
    return (
      <div className="vc vc--center">
        <p>
          {error ||
            (cita?.llamada === 'FINALIZADA'
              ? 'Esta videollamada ya finalizó.'
              : 'Esta videollamada no está disponible: la cita debe ser por videollamada y estar Aceptada.')}
        </p>
        <Link to="/medico/agenda" className="vc-link">Volver a la agenda</Link>
      </div>
    )
  }
  if (!cita) return <div className="vc vc--center"><p>Cargando sala...</p></div>

  const iniciales = cita.paciente.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')

  return (
    <div className="vc">
      <header className="vc-top">
        {/* Sin enlace: así no se sale de la sala por accidente */}
        <div className="vc-brand">
          <span><Plus size={18} color="#fff" /></span> TilinesMédicos
        </div>
        <div className="vc-info">
          <strong>Cita {cita.codigo} · {cita.paciente.nombre}</strong>
          <small>{formatearFecha(cita.fecha)} · {cita.hora}</small>
        </div>
        <span className="vc-timer">{mmss(segundos)}</span>
      </header>

      <main className="vc-stage">
        <div className="vc-remote">
          <span className="vc-remote__avatar">{iniciales}</span>
          <strong>{cita.paciente.nombre}</strong>
          <p>Esperando a que el paciente se una a la sala...</p>
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
