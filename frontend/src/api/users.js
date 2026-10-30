import { apiClient } from '../shared/api/client.ts'

export function listUsers() {
  return apiClient('/users')
}

export function getUser(id) {
  return apiClient(`/users/${id}`)
}

export function updateUser(id, payload) {
  return apiClient(`/users/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deactivateUser(id) {
  return apiClient(`/users/${id}/deactivate`, {
    method: 'PATCH',
  })
}

export function activateUser(id) {
  return apiClient(`/users/${id}/activate`, {
    method: 'PATCH',
  })
}

export function createDoctor(payload) {
  return apiClient('/users/doctors', {
    method: 'POST',
    body: payload,
  })
}
