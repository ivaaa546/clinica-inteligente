import { apiClient } from '../shared/api/client.ts'

export function createConsultation(payload) {
  return apiClient('/consultations', { method: 'POST', body: payload })
}

export function getConsultation(id) {
  return apiClient(`/consultations/${id}`)
}

export function listOwnClinicalHistory() {
  return apiClient('/consultations/me/history')
}
