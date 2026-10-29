import { useNavigate, useParams } from 'react-router-dom'
import VideoCallRoom from '../../components/VideoCallRoom.jsx'

export default function Videollamada() {
  const { codigo = '' } = useParams()
  const navigate = useNavigate()

  return <VideoCallRoom appointmentId={codigo} backLabel="Volver a la agenda" onLeave={() => navigate('/medico/agenda')} />
}
