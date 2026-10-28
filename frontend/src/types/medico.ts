import type { EstadoCita, Modalidad } from './cita'

export type TipoFicha = 'ADULTO' | 'PRENATAL' | 'NEONATO'
export type EstadoLlamada = 'SIN_INICIAR' | 'EN_CURSO' | 'FINALIZADA'

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

/** Antecedentes gineco-obstétricos (solo pacientes de sexo F) */
export interface AntecedentesGineco {
  fur: FechaISO | '' // fecha de última regla (opcional)
  gestas: number
  partos: number
  cesareas: number
  abortos: number
  hijosVivos: number
  planificacion: string // opcional
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
  /** null cuando el formulario no aplica (paciente de sexo M) */
  gineco: AntecedentesGineco | null
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
  /** Solo aplica a citas por videollamada */
  llamada: EstadoLlamada
  /** Cita ACEPTADA sin consulta registrada: se puede abrir la ficha */
  puedeConsultar: boolean
  /** Código de la consulta (CO-xxxx) cuando la cita ya fue completada */
  consultaId: string | null
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

// ---------------------------------------------------------------
//  Consulta (fichas Adulto / Prenatal / Neonato)
// ---------------------------------------------------------------
/** Se guardan como texto tal como se escriben (ej. presión "118/76"); la validación numérica está en lib/consulta.ts */
export interface SignosVitales {
  peso: string // lb
  talla: string // cm
  temperatura: string // °C
  presion: string // mmHg, "sistólica/diastólica"
  fc: string // latidos por minuto
  fr: string // respiraciones por minuto
}

/** Una fila de receta = UN medicamento (una consulta puede tener varios) */
export interface Medicamento {
  medicamento: string
  dosis: string
  via: string
  frecuencia: string
  duracion: string
  indicaciones: string
}

export interface FormularioConsulta {
  tipoFicha: TipoFicha
  motivo: string
  historiaActual: string
  evaluacion: string // evaluación clínica estructurada
  problemas: string // problemas identificados / a investigar
  examenFisico: string
  signosPeligro: string
  diagnostico: string
  observaciones: string
  signos: SignosVitales
  receta: Medicamento[]
}

export interface DisponibilidadFicha {
  disponible: boolean
  /** Por qué no está disponible (se muestra como ayuda) */
  motivo?: string
}

/** Todo lo que necesita la pantalla "Registrar consulta" */
export interface ContextoConsulta {
  cita: CitaAgenda
  paciente: Paciente
  medico: Medico
  gineco: AntecedentesGineco | null
  edadTexto: string // '29 años' | '14 días'
  fichas: Record<TipoFicha, DisponibilidadFicha>
  sugerida: TipoFicha
  consultaId: string // 'CO-1042' (se asigna al completar)
  borrador: FormularioConsulta | null
}

/** Consulta ya registrada (alimenta "Consulta completada / Receta" y el historial) */
export interface ConsultaGuardada {
  id: string // 'CO-1042'
  citaCodigo: string // 'C-1042'
  fecha: FechaISO
  hora: string // '10:30–11:00'
  paciente: Paciente
  medico: Medico
  formulario: FormularioConsulta
}
