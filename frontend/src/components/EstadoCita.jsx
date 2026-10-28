import './EstadoCita.css'

// Estados definidos en el modelo de datos (RN-007)
const ETIQUETAS = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  REPROGRAMADA: 'Reprogramada',
  COMPLETADA: 'Completada',
}

/** Insignia de estado. Acepta 'ACEPTADA' o 'Aceptada'. */
export default function EstadoCita({ estado }) {
  const clave = String(estado).toUpperCase()
  return <span className={`estado estado--${clave.toLowerCase()}`}>{ETIQUETAS[clave] ?? estado}</span>
}
