import { apiClient } from '../../../shared/api/client.ts'

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
