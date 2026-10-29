import { apiClient } from './client.js'

/** El backend autoriza la cita y emite un JWT temporal; no se persiste en navegador. */
export function requestVideoAccess(appointmentId) {
  return apiClient(`/video-calls/appointments/${appointmentId}/access`, { method: 'POST' })
}
