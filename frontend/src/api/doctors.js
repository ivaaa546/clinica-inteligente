import { apiClient } from './client.js'

export function listDoctors(especialidadId) {
  const search = new URLSearchParams({ especialidadId })
  return apiClient(`/doctors?${search}`)
}

/** Devuelve el perfil público o null cuando el médico ya no está disponible. */
export function getDoctor(id) {
  return apiClient(`/doctors/${id}`)
}
