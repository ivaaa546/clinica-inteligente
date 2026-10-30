import { apiClient } from '../../../shared/api/client.ts'

/** El servidor valida la relación médico-paciente antes de proyectar el expediente. */
export function getPatientRecord(id) {
  return apiClient(`/patients/${id}/record`)
}

/** El servidor valida la relación y registra la auditoría de los antecedentes. */
export function updateBackground(id, payload) {
  return apiClient(`/patients/${id}/background`, {
    method: 'PATCH',
    body: payload,
  })
}
