import { apiClient } from './client.js'

export function createPreconsultation({ citaId, motivoConsulta, antecedentesIniciales }) {
  return apiClient('/preconsultations', {
    method: 'POST',
    body: { citaId, motivoConsulta, antecedentesIniciales },
  })
}

/** motivoConsulta sigue siendo obligatorio también al actualizar. */
export function updatePreconsultation(id, { motivoConsulta, antecedentesIniciales }) {
  return apiClient(`/preconsultations/${id}`, {
    method: 'PATCH',
    body: { motivoConsulta, antecedentesIniciales },
  })
}
