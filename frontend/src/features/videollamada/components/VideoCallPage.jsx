import { useNavigate, useParams } from 'react-router-dom'
import RegistrarConsulta from '../../../pages/medico/RegistrarConsulta.tsx'
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

  const room = (
    <VideoCallRoom
      appointmentId={appointmentId}
      backLabel={config.backLabel}
      onLeave={() => navigate(config.backTo)}
      embedded={portal === 'medico'}
    />
  )

  if (portal !== 'medico') return room

  return (
    <div className="vc-doctor-workspace">
      <div className="vc-doctor-video">{room}</div>
      <aside className="vc-doctor-form" aria-label="Formulario de consulta">
        <RegistrarConsulta citaCodigoProp={appointmentId} embedded />
      </aside>
    </div>
  )
}
