// Reglas de la ficha de consulta compartidas por la pantalla y el servicio (así no se duplican)
import { aFecha } from './fechas'
import type { DisponibilidadFicha, FechaISO, FormularioConsulta, Medicamento, Paciente, TipoFicha } from '../types/medico'

export const VIAS = ['Oral', 'Intravenosa', 'Intramuscular', 'Subcutánea', 'Tópica', 'Inhalatoria', 'Oftálmica', 'Rectal'] as const

export const TIPOS_FICHA: { valor: TipoFicha; etiqueta: string }[] = [
  { valor: 'ADULTO', etiqueta: 'Adulto' },
  { valor: 'PRENATAL', etiqueta: 'Prenatal' },
  { valor: 'NEONATO', etiqueta: 'Neonato' },
]

export const MEDICAMENTO_VACIO: Medicamento = { medicamento: '', dosis: '', via: '', frecuencia: '', duracion: '', indicaciones: '' }

export const formularioVacio = (tipoFicha: TipoFicha): FormularioConsulta => ({
  tipoFicha, motivo: '', historiaActual: '', evaluacion: '', problemas: '', examenFisico: '', signosPeligro: '',
  diagnostico: '', observaciones: '',
  signos: { peso: '', talla: '', temperatura: '', presion: '', fc: '', fr: '' },
  receta: [],
})

// ---------------- Edad y fichas disponibles ----------------
const MS_DIA = 24 * 60 * 60 * 1000

/** Días de vida en la fecha de referencia (normalmente, la fecha de la cita) */
export const edadEnDias = (nacimiento: FechaISO, referencia: FechaISO): number =>
  Math.floor((aFecha(referencia).getTime() - aFecha(nacimiento).getTime()) / MS_DIA)

export const edadEnAnios = (nacimiento: FechaISO, referencia: FechaISO): number => {
  const n = aFecha(nacimiento)
  const r = aFecha(referencia)
  let edad = r.getFullYear() - n.getFullYear()
  if (r.getMonth() < n.getMonth() || (r.getMonth() === n.getMonth() && r.getDate() < n.getDate())) edad -= 1
  return edad
}

/** '14 días' si es menor de 28 días; si no, años cumplidos ('29 años') */
export const edadTexto = (nacimiento: FechaISO, referencia: FechaISO): string => {
  const dias = edadEnDias(nacimiento, referencia)
  if (dias < 28) return `${dias} ${dias === 1 ? 'día' : 'días'}`
  const anios = edadEnAnios(nacimiento, referencia)
  return `${anios} ${anios === 1 ? 'año' : 'años'}`
}

/** Neonato: menor de 28 días. Prenatal: solo sexo F entre 10 y 55 años. Adulto: siempre. */
export const fichasDisponibles = (paciente: Paciente, referencia: FechaISO): Record<TipoFicha, DisponibilidadFicha> => {
  const dias = edadEnDias(paciente.nacimiento, referencia)
  const anios = edadEnAnios(paciente.nacimiento, referencia)
  return {
    ADULTO: { disponible: true },
    PRENATAL: paciente.sexo === 'F' && anios >= 10 && anios <= 55
      ? { disponible: true }
      : { disponible: false, motivo: 'Prenatal no disponible por sexo y edad del paciente.' },
    NEONATO: dias < 28
      ? { disponible: true }
      : { disponible: false, motivo: 'Neonato solo está disponible para menores de 28 días.' },
  }
}

export const fichaSugerida = (fichas: Record<TipoFicha, DisponibilidadFicha>): TipoFicha => (fichas.NEONATO.disponible ? 'NEONATO' : 'ADULTO')

// ---------------- Validación ----------------
export const aNumero = (texto: string): number => Number(texto.trim().replace(',', '.'))

const entre = (texto: string, min: number, max: number) => {
  const n = aNumero(texto)
  return texto.trim() !== '' && Number.isFinite(n) && n >= min && n <= max
}

export type CampoConsulta = 'motivo' | 'diagnostico' | 'peso' | 'talla' | 'temperatura' | 'presion' | 'fc' | 'fr'

/** Campos obligatorios (RN: fecha, tipo de ficha, motivo, signos vitales y diagnóstico) con su mensaje */
export const erroresConsulta = (f: FormularioConsulta): Partial<Record<CampoConsulta, string>> => {
  const errores: Partial<Record<CampoConsulta, string>> = {}
  if (!f.motivo.trim()) errores.motivo = 'El motivo de consulta es obligatorio.'
  if (!f.diagnostico.trim()) errores.diagnostico = 'El diagnóstico es obligatorio para completar la consulta.'
  if (!entre(f.signos.peso, 0.1, 1000)) errores.peso = 'Indica el peso en libras.'
  if (!entre(f.signos.talla, 1, 300)) errores.talla = 'Indica la talla en centímetros.'
  if (!entre(f.signos.temperatura, 30, 45)) errores.temperatura = 'Indica una temperatura entre 30 y 45 °C.'
  if (!/^\d{2,3}\s*\/\s*\d{2,3}$/.test(f.signos.presion.trim())) errores.presion = 'Usa el formato 120/80.'
  if (!entre(f.signos.fc, 1, 300) || !Number.isInteger(aNumero(f.signos.fc))) errores.fc = 'Indica la frecuencia cardíaca.'
  if (!entre(f.signos.fr, 1, 150) || !Number.isInteger(aNumero(f.signos.fr))) errores.fr = 'Indica la frecuencia respiratoria.'
  return errores
}

export const NOMBRE_CAMPO: Record<CampoConsulta, string> = {
  motivo: 'motivo de consulta', diagnostico: 'diagnóstico', peso: 'peso', talla: 'talla', temperatura: 'temperatura',
  presion: 'presión arterial', fc: 'frecuencia cardíaca', fr: 'frecuencia respiratoria',
}

/** Resumen para la barra inferior: "Falta el diagnóstico..." / "Faltan: peso, talla" */
export const resumenFaltantes = (errores: Partial<Record<CampoConsulta, string>>, consultaId: string): string => {
  const campos = (Object.keys(errores) as CampoConsulta[]).map((c) => NOMBRE_CAMPO[c])
  if (campos.length === 0) return ''
  if (campos.length === 1) return `Falta el campo requerido (${campos[0]}) para completar ${consultaId}.`
  return `Faltan campos requeridos (${campos.join(', ')}) para completar ${consultaId}.`
}

// ---------------- Receta ----------------
const CAMPOS_RECETA: (keyof Medicamento)[] = ['medicamento', 'dosis', 'via', 'frecuencia', 'duracion', 'indicaciones']

export const filaRecetaVacia = (m: Medicamento) => CAMPOS_RECETA.every((c) => !m[c].trim())
export const filaRecetaCompleta = (m: Medicamento) => CAMPOS_RECETA.every((c) => m[c].trim())

/** Si se añade una receta, los seis campos de cada fila son obligatorios. Las filas totalmente vacías se ignoran. */
export const recetaValida = (receta: Medicamento[]): boolean => receta.every((m) => filaRecetaVacia(m) || filaRecetaCompleta(m))
export const recetaFinal = (receta: Medicamento[]): Medicamento[] => receta.filter((m) => !filaRecetaVacia(m))

/** 'C-1042' -> 'CO-1042' */
export const codigoConsulta = (citaCodigo: string): string => citaCodigo.replace(/^C-/, 'CO-')
