// TODO: todo esto es SOLO para maquetar. Con USAR_MOCK = false ya no se usa.
// Las fechas de la agenda se calculan respecto a la semana actual para que siempre haya datos que mostrar.
import { MEDICOS } from '../paciente/datosEjemplo'
import { proximoDiaHabil } from '../../lib/fechas'
import { diasHabiles, franjas, lunesDe, sumarMinutos } from '../../lib/semana'
import type { Antecedentes, ConsultaPrevia, Medico, Paciente } from '../../types/medico'
import type { EstadoCita, Modalidad } from '../../types/cita'

/** Médico que ha iniciado sesión (Dra. Elena Torres, igual que en el Figma) */
export const MEDICO_ACTUAL: Medico = MEDICOS[0]

export const PACIENTES: Paciente[] = [
  {
    id: 'P-0024', nombre: 'Tilin', apellidos: 'Insano', nacimiento: '1992-03-14', sexo: 'M',
    telefono: '+502 5423 4156', email: 'tilininsano@gmail.com', direccion: 'Calle principal 12-45, zona 1',
    ocupacion: 'Ingeniero', migrante: false, responsable: null,
  },
  {
    id: 'P-0031', nombre: 'Bruno', apellidos: 'Díaz López', nacimiento: '1984-06-02', sexo: 'M',
    telefono: '+502 5511 2034', email: 'bruno.diaz@gmail.com', direccion: '3a avenida 8-10, zona 2',
    ocupacion: 'Contador', migrante: false, responsable: null,
  },
  {
    id: 'P-0046', nombre: 'Lucía', apellidos: 'Pérez Soto', nacimiento: '1997-01-20', sexo: 'F',
    telefono: '+502 4120 7788', email: 'lucia.perez@gmail.com', direccion: 'Barrio El Calvario, San Juan Chamelco',
    ocupacion: 'Docente', migrante: false, responsable: null,
  },
  {
    id: 'P-0052', nombre: 'Marco', apellidos: 'Alvarado Cú', nacimiento: '1975-11-09', sexo: 'M',
    telefono: '+502 3098 4412', email: 'marco.alvarado@gmail.com', direccion: 'Aldea Chamelco, casa 5',
    ocupacion: 'Agricultor', migrante: false, responsable: null,
  },
]

const SIN_ANTECEDENTES: Antecedentes = { medicos: '', quirurgicos: '', familiares: '', habitos: '', alergias: 'Sin alergias conocidas' }

export const ANTECEDENTES: Record<string, Antecedentes> = {
  'P-0024': { ...SIN_ANTECEDENTES },
  'P-0031': { ...SIN_ANTECEDENTES, medicos: 'Hipertensión arterial controlada', habitos: 'Sedentario' },
  'P-0046': { ...SIN_ANTECEDENTES },
  'P-0052': { ...SIN_ANTECEDENTES, familiares: 'Diabetes (padre)' },
}

const consulta = (id: string, fecha: string, diagnostico: string): ConsultaPrevia => ({
  id, fecha, diagnostico, medico: MEDICO_ACTUAL.nombre, especialidad: MEDICO_ACTUAL.especialidad,
})

export const CONSULTAS_PREVIAS: Record<string, ConsultaPrevia[]> = {
  'P-0024': [consulta('CO-0986', '2026-09-17', 'Revisión general'), consulta('CO-0910', '2026-08-21', 'Evaluación inicial')],
  'P-0031': [consulta('CO-0990', '2026-10-05', 'Consulta general')],
  'P-0046': [consulta('CO-0975', '2026-09-22', 'Revisión de seguimiento')],
  'P-0052': [],
}

/** Motivo de la última consulta, para la tabla "Mis pacientes" */
export const ULTIMO_MOTIVO: Record<string, string> = {
  'P-0024': 'Revisión general', 'P-0031': 'Consulta general', 'P-0046': 'Revisión de seguimiento',
}

// ---------------- Agenda (semana actual) ----------------
export const LUNES_BASE = lunesDe(proximoDiaHabil())
const DIAS = diasHabiles(LUNES_BASE)

/** Bloques de 09:00 a 12:00 de lunes a viernes */
export const BLOQUES_INICIALES = DIAS.flatMap((fecha) =>
  franjas('09:00', '12:00').map((inicio) => ({ id: `B-${fecha}-${inicio}`, fecha, inicio, fin: sumarMinutos(inicio, 30) })),
)

export interface CitaMock {
  codigo: string
  fecha: string
  hora: string
  estado: EstadoCita
  modalidad: Modalidad
  pacienteId: string
}

export const CITAS_INICIALES: CitaMock[] = [
  { codigo: 'C-1042', fecha: DIAS[0], hora: '10:30–11:00', estado: 'ACEPTADA', modalidad: 'VIDEOLLAMADA', pacienteId: 'P-0024' },
  { codigo: 'C-1045', fecha: DIAS[0], hora: '11:00–11:30', estado: 'ACEPTADA', modalidad: 'PRESENCIAL', pacienteId: 'P-0031' },
  { codigo: 'C-1043', fecha: DIAS[1], hora: '09:00–09:30', estado: 'PENDIENTE', modalidad: 'PRESENCIAL', pacienteId: 'P-0046' },
  { codigo: 'C-1050', fecha: DIAS[3], hora: '10:00–10:30', estado: 'PENDIENTE', modalidad: 'VIDEOLLAMADA', pacienteId: 'P-0052' },
  { codigo: 'C-1052', fecha: DIAS[4], hora: '09:30–10:00', estado: 'ACEPTADA', modalidad: 'PRESENCIAL', pacienteId: 'P-0046' },
]
