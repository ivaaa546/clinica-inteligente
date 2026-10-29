import { apiClient } from './client.js'

export function getOwnPatientProfile() {
  return apiClient('/patients/me')
}

/** El contrato solo permite modificar estos tres campos del perfil propio. */
export function updateOwnPatientProfile({ direccion, ocupacion, nombreResponsable }) {
  return apiClient('/patients/me', {
    method: 'PATCH',
    body: { direccion, ocupacion, nombreResponsable },
  })
}

/** El servidor valida la relación médico-paciente antes de proyectar el expediente. */
export function getPatientRecord(id) {
  return apiClient(`/patients/${id}/record`)
}

/**
 * Guarda antecedentes generales y, opcionalmente, gineco-obstétricos.
 * El servidor valida la relación médico-paciente y la transacción de auditoría.
 * @param {string} id - id UUID del Paciente
 * @param {{ antecedentesGenerales: object, antecedentesGineco?: object }} payload
 */
export function updateBackground(id, payload) {
  return apiClient(`/patients/${id}/background`, {
    method: 'PATCH',
    body: payload,
  })
}
