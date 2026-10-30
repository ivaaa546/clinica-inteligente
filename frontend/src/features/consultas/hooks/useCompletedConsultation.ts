import { useEffect, useState } from 'react'
import { obtenerConsulta } from '../../../services/medicoService'
import type { ConsultaGuardada } from '../../../types/medico'

/** Consulta completada autorizada para el médico que la registró. */
export function useCompletedConsultation(consultationId: string) {
  const [consultation, setConsultation] = useState<ConsultaGuardada | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    obtenerConsulta(consultationId)
      .then((value) => active && setConsultation(value))
      .catch((requestError: Error) => active && setError(requestError.message))
    return () => { active = false }
  }, [consultationId])

  return { consultation, error }
}
