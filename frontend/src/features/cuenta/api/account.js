import { request } from '../../../shared/api/client.ts'

export function changePassword({ actual, nueva }) {
  return request('/auth/change-password', { method: 'POST', body: { actual, nueva } })
}
