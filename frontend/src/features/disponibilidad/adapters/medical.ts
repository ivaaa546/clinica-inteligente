import { clinicDateKey, formatClinicTime } from '../../../shared/lib/date.js'

export type AppointmentStatus = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'REPROGRAMADA' | 'COMPLETADA'
export type AppointmentModality = 'PRESENCIAL' | 'VIRTUAL'

export type ApiPatientSummary = {
  id: string
  nombre: string
  apellidos: string
  telefono: string | null
}

export type ApiDoctorAppointment = {
  id: string
  disponibilidadId: string
  inicio: string
  fin: string
  estado: AppointmentStatus
  modalidad: AppointmentModality
  paciente: ApiPatientSummary
  consultaId: string | null
}

export type ApiAvailability = {
  id: string
  inicio: string
  fin: string
  activa: boolean
  modalidades: AppointmentModality[]
}

export type MedicalAgendaAppointment = {
  id: string
  disponibilidadId: string
  fecha: string
  inicio: string
  fin: string
  estado: AppointmentStatus
  modalidad: AppointmentModality
  paciente: ApiPatientSummary
  esFutura: boolean
  consultaId: string | null
}

export type MedicalAvailabilityBlock = {
  id: string
  fecha: string
  inicio: string
  fin: string
  modalidades: AppointmentModality[]
}

function requiredClinicValue(value: string | null, field: string) {
  if (!value) throw new Error(`La API devolvió ${field} de cita inválido.`)
  return value
}

/**
 * Adapta una proyección de cita del médico sin conservar los códigos ni banderas
 * derivadas de los datos simulados. El UUID e instantes API siguen siendo la identidad.
 */
export function toMedicalAgendaAppointment(appointment: ApiDoctorAppointment, now = Date.now()): MedicalAgendaAppointment {
  const fecha = requiredClinicValue(clinicDateKey(appointment.inicio), 'una fecha')
  const inicio = requiredClinicValue(formatClinicTime(appointment.inicio), 'una hora de inicio')
  const fin = requiredClinicValue(formatClinicTime(appointment.fin), 'una hora de fin')

  return {
    id: appointment.id,
    disponibilidadId: appointment.disponibilidadId,
    fecha,
    inicio,
    fin,
    estado: appointment.estado,
    modalidad: appointment.modalidad,
    paciente: appointment.paciente,
    esFutura: new Date(appointment.inicio).getTime() > now,
    consultaId: appointment.consultaId,
  }
}

/** Convierte un bloque real a su representación de agenda en la zona de la clínica. */
export function toMedicalAvailabilityBlock(block: ApiAvailability): MedicalAvailabilityBlock | null {
  if (!block.activa) return null

  const fecha = clinicDateKey(block.inicio)
  const inicio = formatClinicTime(block.inicio)
  const fin = formatClinicTime(block.fin)
  if (!fecha || !inicio || !fin) return null

  return {
    id: block.id,
    fecha,
    inicio,
    fin,
    modalidades: block.modalidades,
  }
}

/** Agrupa pacientes vinculados sin convertir la lista de citas en un catálogo ajeno. */
export function uniqueLinkedPatients(appointments: ApiDoctorAppointment[]): ApiPatientSummary[] {
  const patients = new Map<string, ApiPatientSummary>()
  appointments.forEach((appointment) => {
    if (!patients.has(appointment.paciente.id)) patients.set(appointment.paciente.id, appointment.paciente)
  })
  return [...patients.values()]
}
