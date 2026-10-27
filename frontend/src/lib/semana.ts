// Utilidades de calendario para la agenda del médico (complementa a lib/fechas.js)
import { mesMayusculas, separarBloque } from './fechas'
import type { FechaISO, Hora } from '../types/medico'

export const MINUTOS_BLOQUE = 30

const dos = (n: number) => String(n).padStart(2, '0')

/** Date local -> 'YYYY-MM-DD' */
export const aISO = (d: Date): FechaISO => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`

const aDate = (iso: FechaISO) => new Date(`${iso}T00:00:00`)

export const sumarDias = (iso: FechaISO, dias: number): FechaISO => {
  const d = aDate(iso)
  d.setDate(d.getDate() + dias)
  return aISO(d)
}

/** Lunes de la semana que contiene la fecha */
export const lunesDe = (iso: FechaISO): FechaISO => {
  const dia = aDate(iso).getDay() // 0 = domingo
  return sumarDias(iso, dia === 0 ? -6 : 1 - dia)
}

/** De lunes a viernes */
export const diasHabiles = (lunes: FechaISO): FechaISO[] => [0, 1, 2, 3, 4].map((n) => sumarDias(lunes, n))

/** '2026-10-19' -> '19–23 de octubre, 2026' */
export const etiquetaSemana = (lunes: FechaISO): string => {
  const viernes = sumarDias(lunes, 4)
  const mes = (iso: FechaISO) => mesMayusculas(iso).toLowerCase()
  const [anio] = viernes.split('-')
  const inicio = aDate(lunes).getDate()
  const fin = aDate(viernes).getDate()
  const mismoMes = mes(lunes) === mes(viernes)
  return `${inicio}${mismoMes ? '' : ` de ${mes(lunes)}`}–${fin} de ${mes(viernes)}, ${anio}`
}

/** '10:30' + 30 -> '11:00' */
export const sumarMinutos = (hora: Hora, minutos: number): Hora => {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m + minutos
  return `${dos(Math.floor(total / 60))}:${dos(total % 60)}`
}

/** Franjas de 30 min dentro de [desde, hasta): ('09:00','10:00') -> ['09:00','09:30'] */
export const franjas = (desde: Hora, hasta: Hora): Hora[] => {
  const lista: Hora[] = []
  for (let h = desde; h < hasta; h = sumarMinutos(h, MINUTOS_BLOQUE)) lista.push(h)
  return lista
}

/** ¿El inicio del bloque ('10:30–11:00') aún no llega? */
export const esFutura = (fecha: FechaISO, bloque: string, ahora: Date = new Date()): boolean => {
  const { inicio } = separarBloque(bloque)
  return new Date(`${fecha}T${inicio}:00`).getTime() > ahora.getTime()
}

/** Edad en años cumplidos */
export const edadDesde = (nacimiento: FechaISO, hoy: Date = new Date()): number => {
  const n = aDate(nacimiento)
  let edad = hoy.getFullYear() - n.getFullYear()
  const cumplio = hoy.getMonth() > n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() >= n.getDate())
  if (!cumplio) edad -= 1
  return edad
}
