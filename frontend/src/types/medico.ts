import type { EstadoCita, Modalidad } from './cita'

/** Fecha en formato 'YYYY-MM-DD' (hora local), igual que en lib/fechas.js */
export type FechaISO = string
/** Hora en formato 'HH:mm' */
export type Hora = string

export interface Medico {
  id: number
  nombre: string
  iniciales: string
  especialidad: string
  numeroProfesional: string
  firma?: string
}

// ---------------------------------------------------------------
//  Pacientes
// ---------------------------------------------------------------
export interface PacienteResumen {
  id: string // 'P-0024'
  nombre: string
  telefono: string
}

export interface Paciente {
  id: string // 'P-0024'
  nombre: string
  apellidos: string
  nacimiento: FechaISO
  sexo: 'M' | 'F'
  telefono: string
  email: string
  direccion: string
  ocupacion: string
  migrante: boolean
  responsable: string | null
}

/** Antecedentes permanentes (texto libre; '' = sin registrar) */
export interface Antecedentes {
  medicos: string
  quirurgicos: string
  familiares: string
  habitos: string
  alergias: string
}

export interface ConsultaPrevia {
  id: string // 'CO-0986'
  fecha: FechaISO
  medico: string
  especialidad: string
  diagnostico: string
}

/** Fila de la pantalla "Mis pacientes" */
export interface PacienteVinculado {
  paciente: Paciente
  ultimaConsulta: { fecha: FechaISO; motivo: string } | null
}

/** Pantalla "Expediente clínico" */
export interface Expediente {
  paciente: Paciente
  antecedentes: Antecedentes
  consultas: ConsultaPrevia[]
  /** Cita aceptada propia desde la que se puede registrar una consulta (si existe) */
  citaAceptada: { codigo: string; fecha: FechaISO; hora: string } | null
}

// ---------------------------------------------------------------
//  Agenda
// ---------------------------------------------------------------
/** Bloque de 30 minutos que el médico ofrece a sus pacientes */
export interface BloqueDisponibilidad {
  id: string
  fecha: FechaISO
  inicio: Hora
  fin: Hora
}

export interface CitaAgenda {
  codigo: string // 'C-1042'
  fecha: FechaISO
  hora: string // '10:30–11:00'
  estado: EstadoCita
  modalidad: Modalidad
  /** ⚠ El endpoint actual de citas del médico no devuelve estos datos: pedir al backend */
  paciente: PacienteResumen
  /** La cita aún no llega a su fecha/hora: solo entonces se puede aceptar, rechazar o cancelar */
  futura: boolean
}

export interface AgendaSemana {
  bloques: BloqueDisponibilidad[]
  citas: CitaAgenda[]
}

export interface NuevoBloque {
  fecha: FechaISO
  desde: Hora
  hasta: Hora
}
