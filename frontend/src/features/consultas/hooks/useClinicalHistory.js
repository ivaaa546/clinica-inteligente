import { useEffect, useState } from 'react'
import { listOwnClinicalHistory } from '../api/consultations.js'

/** Proyección clínica propia del paciente; no expone expedientes ni notas médicas. */
export function useClinicalHistory() {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    listOwnClinicalHistory()
      .then((items) => active && setConsultations(Array.isArray(items) ? items : []))
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  return { consultations, loading, error }
}
