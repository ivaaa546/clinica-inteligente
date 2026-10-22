import { apiClient } from './client.js'

export function listSpecialties() {
  return apiClient('/specialties')
}
