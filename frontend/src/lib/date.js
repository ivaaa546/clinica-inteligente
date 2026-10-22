export const CLINIC_TIMEZONE = import.meta.env.VITE_CLINIC_TIMEZONE || 'America/Guatemala'

function toValidDate(value) {
  if (value === null || value === undefined || value === '') return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function clinicFormatter(options) {
  return new Intl.DateTimeFormat('es-GT', { timeZone: CLINIC_TIMEZONE, ...options })
}

/** Presenta un instante ISO usando siempre la zona oficial de la clínica. */
export function formatClinicDateTime(value) {
  const date = toValidDate(value)
  return date ? clinicFormatter({ dateStyle: 'medium', timeStyle: 'short' }).format(date) : null
}

export function formatClinicDate(value) {
  const date = toValidDate(value)
  return date ? clinicFormatter({ dateStyle: 'medium' }).format(date) : null
}

export function formatClinicTime(value) {
  const date = toValidDate(value)
  return date ? clinicFormatter({ timeStyle: 'short' }).format(date) : null
}

/** Devuelve una clave YYYY-MM-DD calculada en la zona de la clínica. */
export function clinicDateKey(value) {
  const date = toValidDate(value)
  if (!date) return null

  const parts = clinicFormatter({ year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]))
  return `${values.year}-${values.month}-${values.day}`
}

/** Agrupa únicamente bloques con un inicio válido por su día de clínica. */
export function groupBlocksByClinicDate(blocks) {
  return blocks.reduce((groups, block) => {
    const key = clinicDateKey(block.inicio)
    if (!key) return groups

    const items = groups.get(key) || []
    items.push(block)
    groups.set(key, items)
    return groups
  }, new Map())
}

/** Las fechas DATE de nacimiento conservan su día calendario, sin convertir zona horaria. */
export function formatBirthDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null

  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'UTC',
    dateStyle: 'medium',
  }).format(date)
}
