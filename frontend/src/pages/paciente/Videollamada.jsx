import { useNavigate, useParams } from 'react-router-dom'
import VideoCallRoom from '../../components/VideoCallRoom.jsx'

export default function Videollamada() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  return <VideoCallRoom appointmentId={id} backLabel="Volver a mis citas" onLeave={() => navigate('/paciente/citas')} />
}
