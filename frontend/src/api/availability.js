import { apiClient } from './client.js'

/**
 * Conserva los UUID e instantes ISO devueltos por la API.
 * Un bloque activo no confirma que siga disponible al momento de reservar.
 */
export function listDoctorAvailability(doctorId) {
  return apiClient(`/availability/doctor/${doctorId}`)
}

export function listOwnAvailability() {
  return apiClient('/availability/me')
}

export function publishAvailability({ inicio, modalidades }) {
  return apiClient('/availability', {
    method: 'POST',
    body: { inicio, modalidades },
  })
}

export function removeAvailability(id) {
  return apiClient(`/availability/${id}`, { method: 'DELETE' })
}
