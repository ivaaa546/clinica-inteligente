import { useEffect, useState } from 'react'
import { listarAgendaSemana } from '../../../services/medicoService'
import type { AgendaSemana, FechaISO } from '../../../types/medico'

/** Carga la agenda propia del médico y permite invalidarla tras una mutación. */
export function useMedicalAgenda(lunes: FechaISO) {
  const [datos, setDatos] = useState<(AgendaSemana & { lunes: FechaISO }) | null>(null)
  const [version, setVersion] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listarAgendaSemana(lunes)
      .then((agenda) => {
        if (active) {
          setDatos({ lunes, ...agenda })
          setError('')
        }
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message)
      })
    return () => { active = false }
  }, [lunes, version])

  return {
    datos,
    error,
    setError,
    cargando: datos?.lunes !== lunes && !error,
    recargar: () => setVersion((current) => current + 1),
  }
}
