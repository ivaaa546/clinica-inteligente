import { useEffect, useState } from 'react'
import { obtenerExpediente, obtenerMedicoActual } from '../../../services/medicoService'
import type { Expediente, Medico } from '../../../shared/types/medico'

/** Carga únicamente el expediente autorizado por la relación médico-paciente. */
export function useMedicalRecord(patientId: string) {
  const [data, setData] = useState<{ expediente: Expediente; medico: Medico } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([obtenerExpediente(patientId), obtenerMedicoActual()])
      .then(([expediente, medico]) => active && setData({ expediente, medico }))
      .catch((requestError: Error) => active && setError(requestError.message))
    return () => { active = false }
  }, [patientId])

  return { data, error, setData }
}
