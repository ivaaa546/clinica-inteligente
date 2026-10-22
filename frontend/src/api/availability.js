import { apiClient } from './client.js'

/**
 * Conserva los UUID e instantes ISO devueltos por la API.
 * Un bloque activo no confirma que siga disponible al momento de reservar.
 */
export function listDoctorAvailability(doctorId) {
  return apiClient(`/availability/doctor/${doctorId}`)
}
