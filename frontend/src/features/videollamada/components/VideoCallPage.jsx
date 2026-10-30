import { useNavigate, useParams } from 'react-router-dom'
import VideoCallRoom from './VideoCallRoom.jsx'

const PORTAL_CONFIG = {
  paciente: { param: 'id', backLabel: 'Volver a mis citas', backTo: '/paciente/citas' },
  medico: { param: 'codigo', backLabel: 'Volver a la agenda', backTo: '/medico/agenda' },
}

/** Entrada única de videollamada reutilizada por los portales paciente y médico. */
export default function VideoCallPage({ portal }) {
  const navigate = useNavigate()
  const params = useParams()
  const config = PORTAL_CONFIG[portal]
  const appointmentId = params[config.param] || ''

  return (
    <VideoCallRoom
      appointmentId={appointmentId}
      backLabel={config.backLabel}
      onLeave={() => navigate(config.backTo)}
    />
  )
}
