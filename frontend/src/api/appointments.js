import { apiClient } from './client.js'

export const APPOINTMENT_STATES = new Set([
  'PENDIENTE',
  'ACEPTADA',
  'RECHAZADA',
  'CANCELADA',
  'REPROGRAMADA',
  'COMPLETADA',
])

export function requestAppointment({ medicoId, disponibilidadId, modalidad }) {
  return apiClient('/appointments', {
    method: 'POST',
    body: { medicoId, disponibilidadId, modalidad },
  })
}

export function listOwnAppointments(estado) {
  const query = APPOINTMENT_STATES.has(estado) ? `?estado=${encodeURIComponent(estado)}` : ''
  return apiClient(`/appointments/me${query}`)
}

/** No debe invocarse desde una vista hasta completar el gate de privacidad T-012. */
export function getAppointment(id) {
  return apiClient(`/appointments/${id}`)
}

export function cancelAppointment(id) {
  return apiClient(`/appointments/${id}/cancel`, { method: 'PATCH' })
}

export function acceptAppointment(id) {
  return apiClient(`/appointments/${id}/accept`, { method: 'PATCH' })
}

export function rejectAppointment(id) {
  return apiClient(`/appointments/${id}/reject`, { method: 'PATCH' })
}

/** La API devuelve la nueva cita PENDIENTE, sin modificar localmente la cita original. */
export function rescheduleAppointment(id, nuevaDisponibilidadId, modalidad) {
  return apiClient(`/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: { nuevaDisponibilidadId, modalidad },
  })
}
