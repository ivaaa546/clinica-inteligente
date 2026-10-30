import { useEffect, useState } from 'react'
import { listOwnPrescriptions } from '../api/prescriptions.js'

/** Solo solicita la proyección de recetas propias autorizada para pacientes. */
export function useOwnPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    listOwnPrescriptions()
      .then((items) => active && setPrescriptions(Array.isArray(items) ? items : []))
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  return { prescriptions, loading, error }
}
