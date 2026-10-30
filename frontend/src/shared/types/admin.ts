import type { EstadoCita, Modalidad } from './cita'
import type { FechaISO } from './medico'

export type RolUsuario = 'PACIENTE' | 'MEDICO' | 'ADMINISTRADOR'

/** Cuenta de usuario tal como la ve el administrador (solo datos de cuenta, nunca clínicos) */
export interface Usuario {
  id: string
  nombre: string
  apellidos: string
  correo: string
  telefono: string
  rol: RolUsuario
  activo: boolean
  /** Solo médicos */
  especialidadId: string | null
  numeroProfesional: string | null
}

export interface DatosCuenta {
  nombre: string
  apellidos: string
  correo: string
  telefono: string
}

export interface NuevoMedico extends DatosCuenta {
  contrasena: string
  confirmar: string
  numeroProfesional: string
  especialidadId: string
}

export interface EspecialidadAdmin {
  id: string
  nombre: string
  activa: boolean
  medicosActivos: number
  /** Nombres de los médicos activos que la usan */
  medicos: string[]
}

export interface CitaAdmin {
  codigo: string
  fecha: FechaISO
  hora: string // '10:30–11:00'
  estado: EstadoCita
  modalidad: Modalidad
  paciente: string
  medico: string
  especialidad: string
  /** Aún no llega su hora: solo entonces se puede cancelar o reprogramar */
  futura: boolean
}

export interface Hueco {
  fecha: FechaISO
  inicio: string
  fin: string
}

export type PeriodoMetricas = 'TODO' | 'MES_ACTUAL' | 'MES_ANTERIOR'

export interface Metricas {
  totalPacientes: number
  totalMedicos: number
  consultasCompletadas: number
  citasPorEstado: Record<EstadoCita, number>
  totalCitas: number
  /** Texto del rango real de los registros incluidos, p. ej. "septiembre–octubre de 2026" */
  rango: string
}

// ---------------- Perfil del personal ("Mi cuenta") ----------------
export interface PerfilPersonal extends DatosCuenta {
  id: string
  rol: RolUsuario
  especialidad: string | null
  numeroProfesional: string | null
}
