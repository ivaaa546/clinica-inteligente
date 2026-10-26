import { Video, MapPin } from 'lucide-react'
import './ModalidadTag.css'

/** Muestra si la cita es por videollamada o presencial. */
export default function ModalidadTag({ modalidad }) {
  const virtual = modalidad === 'VIDEOLLAMADA'
  return (
    <span className={`modalidad ${virtual ? 'modalidad--virtual' : ''}`}>
      {virtual ? <Video size={15} /> : <MapPin size={15} />}
      {virtual ? 'Videollamada' : 'Presencial'}
    </span>
  )
}
