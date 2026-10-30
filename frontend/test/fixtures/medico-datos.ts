// Fixture de pruebas para adaptadores y componentes clínicos.
// Las fechas se calculan respecto a la semana actual para mantener escenarios estables.
import { MEDICOS } from './paciente-datos.js'
import { proximoDiaHabil } from '../../src/shared/lib/fechas'
import { diasHabiles, franjas, lunesDe, sumarDias, sumarMinutos } from '../../src/shared/lib/semana'
import { formularioVacio } from '../../src/shared/lib/consulta'
import type { EstadoCita, Modalidad } from '../../src/shared/types/cita'
import type {
  Antecedentes, AntecedentesGineco, ConsultaGuardada, EstadoLlamada, Medicamento, Medico, Paciente,
} from '../../src/shared/types/medico'

/** Médico que ha iniciado sesión (Dra. Elena Torres, igual que en el Figma) */
export const MEDICO_ACTUAL: Medico = MEDICOS[0]

export const LUNES_BASE = lunesDe(proximoDiaHabil())
const DIAS = diasHabiles(LUNES_BASE)

// ---------------- Pacientes ----------------
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
    id: 'P-0046', nombre: 'Lucía', apellidos: 'Pérez Soto', nacimiento: '1997-09-22', sexo: 'F',
    telefono: '+502 4120 7788', email: 'lucia.perez@gmail.com', direccion: 'Barrio El Calvario, San Juan Chamelco',
    ocupacion: 'Docente', migrante: false, responsable: null,
  },
  {
    // Recién nacido: siempre tiene 14 días el lunes de la semana de ejemplo (así la ficha Neonato siempre está disponible)
    id: 'P-0060', nombre: 'Mateo', apellidos: 'Gómez', nacimiento: sumarDias(DIAS[0], -14), sexo: 'M',
    telefono: '+502 4777 1002', email: 'elisa.gomez@gmail.com', direccion: 'Barrio El Calvario, San Juan Chamelco',
    ocupacion: '—', migrante: false, responsable: 'Elisa Gómez',
  },
]

const SIN_ANTECEDENTES: Antecedentes = { medicos: '', quirurgicos: '', familiares: '', habitos: '', alergias: 'Sin alergias conocidas' }

export const ANTECEDENTES: Record<string, Antecedentes> = {
  'P-0024': { ...SIN_ANTECEDENTES },
  'P-0031': { ...SIN_ANTECEDENTES, medicos: 'Hipertensión arterial controlada', habitos: 'Sedentario' },
  'P-0046': { ...SIN_ANTECEDENTES },
  'P-0060': { ...SIN_ANTECEDENTES },
}

export const GINECO_VACIO: AntecedentesGineco = { fur: '', gestas: 0, partos: 0, cesareas: 0, abortos: 0, hijosVivos: 0, planificacion: '' }

export const GINECO: Record<string, AntecedentesGineco> = {
  'P-0046': { fur: '2026-08-15', gestas: 2, partos: 1, cesareas: 0, abortos: 0, hijosVivos: 1, planificacion: '' },
}

// ---------------- Consultas previas (historial) ----------------
const previa = (id: string, paciente: Paciente, fecha: string, motivo: string, diagnostico: string, receta: Medicamento[] = []): ConsultaGuardada => ({
  id, citaCodigo: id.replace('CO-', 'C-'), fecha, hora: '09:00–09:30', paciente, medico: MEDICO_ACTUAL,
  formulario: {
    ...formularioVacio('ADULTO'), motivo, diagnostico, historiaActual: 'Consulta registrada en el sistema.',
    signos: { peso: '150', talla: '170', temperatura: '36.6', presion: '118/76', fc: '74', fr: '16' }, receta,
  },
})

const paracetamol: Medicamento = {
  medicamento: 'Paracetamol 500 mg', dosis: '1 tableta', via: 'Oral', frecuencia: 'Cada 8 horas', duracion: '3 días',
  indicaciones: 'Tomar después de los alimentos',
}

export const CONSULTAS_INICIALES: ConsultaGuardada[] = [
  previa('CO-0986', PACIENTES[0], '2026-09-17', 'Revisión general', 'Revisión general', [paracetamol]),
  previa('CO-0910', PACIENTES[0], '2026-08-21', 'Evaluación inicial', 'Evaluación inicial'),
  previa('CO-0990', PACIENTES[1], '2026-10-05', 'Consulta general', 'Consulta general'),
  previa('CO-0975', PACIENTES[2], '2026-09-22', 'Revisión de seguimiento', 'Revisión de seguimiento', [paracetamol]),
]

// ---------------- Agenda (semana actual) ----------------
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
  llamada: EstadoLlamada
}

const cita = (codigo: string, dia: number, hora: string, estado: EstadoCita, modalidad: Modalidad, pacienteId: string): CitaMock => (
  { codigo, fecha: DIAS[dia], hora, estado, modalidad, pacienteId, llamada: 'SIN_INICIAR' }
)

export const CITAS_INICIALES: CitaMock[] = [
  cita('C-1042', 0, '10:30–11:00', 'ACEPTADA', 'VIDEOLLAMADA', 'P-0024'), // ficha Adulto
  cita('C-1045', 0, '11:00–11:30', 'ACEPTADA', 'PRESENCIAL', 'P-0046'), // ficha Prenatal
  cita('C-1046', 0, '11:30–12:00', 'ACEPTADA', 'PRESENCIAL', 'P-0060'), // ficha Neonato
  cita('C-1043', 1, '09:00–09:30', 'PENDIENTE', 'PRESENCIAL', 'P-0031'),
  cita('C-1050', 3, '10:00–10:30', 'PENDIENTE', 'VIDEOLLAMADA', 'P-0046'),
  cita('C-1052', 4, '09:30–10:00', 'ACEPTADA', 'VIDEOLLAMADA', 'P-0031'),
]
