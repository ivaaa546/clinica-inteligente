import { useEffect, useRef, useState } from 'react'
import { Info, LogOut, Mic, MicOff, Plus, Video, VideoOff } from 'lucide-react'
import { requestVideoAccess } from '../api/videoCalls.js'
import '../pages/paciente/Videollamada.css'

const formatDuration = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

function toWebSocketUrl(value) {
  const url = new URL(value)
  if (url.protocol === 'https:') url.protocol = 'wss:'
  if (url.protocol === 'http:') url.protocol = 'ws:'
  return url.toString()
}

export default function VideoCallRoom({ appointmentId, backLabel, onLeave }) {
  const localVideoRef = useRef(null)
  const remoteMediaRef = useRef(null)
  const roomRef = useRef(null)
  const [status, setStatus] = useState('Conectando a la sala…')
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!connected) return undefined
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [connected])

  useEffect(() => {
    let cancelled = false
    let room
    let RoomEvent

    const detachTrack = (track) => {
      for (const element of track.detach()) element.remove()
    }
    const attachTrack = (track) => {
      const element = track.attach()
      if (track.kind === 'video') {
        element.autoplay = true
        element.playsInline = true
        remoteMediaRef.current?.append(element)
        setHasRemoteVideo(true)
      } else {
        element.autoplay = true
        remoteMediaRef.current?.append(element)
      }
    }

    const onTrackUnsubscribed = (track) => {
      detachTrack(track)
      if (track.kind === 'video') setHasRemoteVideo(false)
    }
    const onDisconnected = () => {
      if (!cancelled) {
        setConnected(false)
        setStatus('La conexión con la sala finalizó.')
      }
    }

    const connect = async () => {
      try {
        const access = await requestVideoAccess(appointmentId)
        if (cancelled) return
        const sdk = await import('livekit-client')
        if (cancelled) return
        RoomEvent = sdk.RoomEvent
        room = new sdk.Room({ adaptiveStream: true, dynacast: true })
        roomRef.current = room
        room.on(RoomEvent.TrackSubscribed, attachTrack)
        room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
        room.on(RoomEvent.Disconnected, onDisconnected)
        await room.connect(toWebSocketUrl(access.url), access.token)
        if (cancelled) return

        await room.localParticipant.setCameraEnabled(true)
        await room.localParticipant.setMicrophoneEnabled(true)
        const camera = room.localParticipant.getTrackPublication('camera')?.track
        if (camera && localVideoRef.current) {
          localVideoRef.current.srcObject = new MediaStream([camera.mediaStreamTrack])
        }
        setCameraEnabled(true)
        setMicrophoneEnabled(true)
        setConnected(true)
        setStatus('Conectado. Esperando al otro participante.')
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'No fue posible entrar a la videollamada.')
          setStatus('No se pudo conectar a la sala.')
        }
      }
    }

    void connect()
    return () => {
      cancelled = true
      room?.off(RoomEvent?.TrackSubscribed, attachTrack)
      room?.off(RoomEvent?.TrackUnsubscribed, onTrackUnsubscribed)
      room?.off(RoomEvent?.Disconnected, onDisconnected)
      room?.disconnect()
      roomRef.current = null
    }
  }, [appointmentId])

  const toggleCamera = async () => {
    const room = roomRef.current
    if (!room) return
    try {
      const next = !cameraEnabled
      await room.localParticipant.setCameraEnabled(next)
      const camera = room.localParticipant.getTrackPublication('camera')?.track
      if (next && camera && localVideoRef.current) {
        localVideoRef.current.srcObject = new MediaStream([camera.mediaStreamTrack])
      }
      setCameraEnabled(next)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible cambiar la cámara.')
    }
  }

  const toggleMicrophone = async () => {
    const room = roomRef.current
    if (!room) return
    try {
      const next = !microphoneEnabled
      await room.localParticipant.setMicrophoneEnabled(next)
      setMicrophoneEnabled(next)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible cambiar el micrófono.')
    }
  }

  return (
    <div className="vc">
      <header className="vc-top">
        <div className="vc-brand"><span><Plus size={18} color="#fff" /></span> TilinesMédicos</div>
        <div className="vc-info"><strong>Videollamada</strong><small>Cita {appointmentId}</small></div>
        <span className="vc-timer">{formatDuration(seconds)}</span>
      </header>

      <main className="vc-stage">
        <div className="vc-remote">
          <div ref={remoteMediaRef} className="vc-remote__media" aria-label="Video remoto" />
          {!hasRemoteVideo && <><span className="vc-remote__avatar">?</span><strong>Participante</strong><p>{status}</p></>}
        </div>
        <div className="vc-self">
          <video ref={localVideoRef} autoPlay playsInline muted className={cameraEnabled ? '' : 'is-off'} />
          {!cameraEnabled && <div className="vc-self__off"><VideoOff size={22} /><small>Cámara apagada</small></div>}
          <span className="vc-self__tag">Tú</span>
        </div>
        {error && <p className="vc-alert" role="alert"><Info size={16} /> {error}</p>}
      </main>

      <footer className="vc-controls">
        <button type="button" className={`vc-btn ${microphoneEnabled ? '' : 'is-off'}`} onClick={toggleMicrophone} disabled={!connected} aria-label={microphoneEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}>
          {microphoneEnabled ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
        <button type="button" className={`vc-btn ${cameraEnabled ? '' : 'is-off'}`} onClick={toggleCamera} disabled={!connected} aria-label={cameraEnabled ? 'Apagar cámara' : 'Activar cámara'}>
          {cameraEnabled ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
        <button type="button" className="vc-btn vc-btn--leave" onClick={onLeave}>
          <LogOut size={20} /> {backLabel}
        </button>
      </footer>
    </div>
  )
}
