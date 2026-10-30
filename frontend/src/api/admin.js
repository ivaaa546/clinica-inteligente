import { apiClient } from '../shared/api/client.ts'

export function getAdminMetrics() {
  return apiClient('/admin/metrics')
}

export function listAdminAppointments() {
  return apiClient('/admin/appointments')
}

export function cancelAdminAppointment(id) {
  return apiClient(`/admin/appointments/${id}/cancel`, {
    method: 'PATCH',
  })
}

export function rescheduleAdminAppointment(id, payload) {
  return apiClient(`/admin/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: payload,
  })
}
