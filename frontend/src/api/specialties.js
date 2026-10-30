import { apiClient } from '../shared/api/client.ts'

export function listSpecialties() {
  return apiClient('/specialties')
}

export function createSpecialty(nombre) {
  return apiClient('/specialties', {
    method: 'POST',
    body: { nombre },
  })
}

export function updateSpecialty(id, nombre) {
  return apiClient(`/specialties/${id}`, {
    method: 'PATCH',
    body: { nombre },
  })
}

export function deactivateSpecialty(id) {
  return apiClient(`/specialties/${id}/deactivate`, {
    method: 'PATCH',
  })
}

export function activateSpecialty(id) {
  return apiClient(`/specialties/${id}/activate`, {
    method: 'PATCH',
  })
}

export function deleteSpecialty(id) {
  return apiClient(`/specialties/${id}`, {
    method: 'DELETE',
  })
}
