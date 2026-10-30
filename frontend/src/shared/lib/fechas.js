// Utilidades de fecha en español, sin depender del idioma del navegador
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** '2026-10-19' -> Date local (sin desfase de zona horaria) */
export const aFecha = (iso) => new Date(`${iso}T00:00:00`)

/** Fecha de hoy en formato 'YYYY-MM-DD' (hora local) */
export const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** '2026-10-19' -> '19 oct 2026' */
export const formatearFecha = (iso) => {
  const d = aFecha(iso)
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/** '2026-10-19' -> 'Lunes' */
export const diaSemana = (iso) => DIAS[aFecha(iso).getDay()]

/** '2026-10-19' -> 'Lunes, 19 de octubre' */
export const diaLargo = (iso) => {
  const d = aFecha(iso)
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES_LARGOS[d.getMonth()]}`
}

/** '2026-10-19' -> 'OCTUBRE' */
export const mesMayusculas = (iso) => MESES_LARGOS[aFecha(iso).getMonth()].toUpperCase()

/** '10:30–11:00' -> { inicio: '10:30', fin: '11:00' } */
export const separarBloque = (bloque = '') => {
  const [inicio = '', fin = ''] = bloque.split('–')
  return { inicio, fin }
}

/** Hoy, o el lunes siguiente si hoy es sábado o domingo (formato 'YYYY-MM-DD') */
export const proximoDiaHabil = () => {
  const d = new Date()
  if (d.getDay() === 6) d.setDate(d.getDate() + 2)
  else if (d.getDay() === 0) d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
