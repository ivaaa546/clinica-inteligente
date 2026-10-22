import { apiClient } from './client.js'

/**
 * La proyección paciente incluye receta y diagnóstico. No incorpora fecha, estado,
 * médico, PDF ni agrupaciones que el contrato actual no devuelve.
 */
export function listOwnPrescriptions() {
  return apiClient('/prescriptions/me')
}
