import { useEffect, useState } from 'react'
import { listOwnAppointments } from '../api/appointments.js'
import { getDoctor } from '../../../api/doctors.js'

/** Carga citas propias y las proyecciones públicas de sus médicos relacionados. */
export function usePatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    listOwnAppointments()
      .then(async (items) => {
        if (!active) return
        const values = Array.isArray(items) ? items : []
        setAppointments(values)
        const doctorIds = [...new Set(values.map((appointment) => appointment.medicoId).filter(Boolean))]
        const results = await Promise.allSettled(doctorIds.map(async (id) => [id, await getDoctor(id)]))
        if (!active) return
        setDoctors(Object.fromEntries(results
          .filter((result) => result.status === 'fulfilled' && result.value[1])
          .map((result) => result.value)))
      })
      .catch((requestError) => active && setError(requestError))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [])

  return { appointments, doctors, loading, error }
}
