import { apiClient } from './client.js'

export function createConsultation(payload) {
  return apiClient('/consultations', { method: 'POST', body: payload })
}

export function getConsultation(id) {
  return apiClient(`/consultations/${id}`)
}
