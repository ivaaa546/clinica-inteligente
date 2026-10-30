import { ApiError } from '../shared/api/client'
import { acceptAppointment, cancelAppointment, getAppointment, listOwnAppointments, rejectAppointment, rescheduleAppointment } from '../features/citas/api/appointments'
import { listOwnAvailability, publishAvailability, removeAvailability } from '../features/disponibilidad/api/availability'
import { getOwnDoctor } from '../api/doctors'
import { getPatientRecord, updateBackground } from '../features/expedientes/api/expedientes'
import { createConsultation, getConsultation } from '../features/consultas/api/consultations'
import { diasHabiles, sumarMinutos } from '../shared/lib/semana'
import {
  aNumero, edadTexto, erroresConsulta, fichaSugerida, fichasDisponibles, formularioVacio, recetaFinal, recetaValida,
} from '../shared/lib/consulta'
import type {
  AgendaSemana, Antecedentes, AntecedentesGineco, BloqueDisponibilidad, CitaAgenda, ConsultaGuardada, ConsultaPrevia,
  ContextoConsulta, Expediente, FechaISO, FormularioConsulta, Medico, NuevoBloque, Paciente, PacienteVinculado, PreconsultaPaciente,
} from '../shared/types/medico'
import { CLINIC_TIMEZONE, clinicDateKey } from '../shared/lib/date'


// ---------- Perfil ----------
type ApiDoctor = {
  id: string
  nombre: string
  apellidos: string
  numeroProfesional: string
  especialidad: { nombre: string }
}

type ApiAvailability = {
  id: string
  inicio: string
  fin: string
  activa: boolean
}

type ApiDoctorAppointment = {
  id: string
  disponibilidadId: string
  inicio: string
  fin: string
  estado: CitaAgenda['estado']
  modalidad: 'PRESENCIAL' | 'VIRTUAL'
  paciente: { id: string; nombre: string; apellidos: string; telefono: string }
  consultaId: string | null
}

const agendaTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]))
  return `${values.hour}:${values.minute}`
}

const agendaDateTime = (fecha: string, hora: string) => {
  // Guatemala is the only approved clinic timezone for this MVP and has a fixed UTC-06:00 offset.
  return new Date(`${fecha}T${hora}:00-06:00`).toISOString()
}

const toAgendaAppointment = (appointment: ApiDoctorAppointment): CitaAgenda => {
  const fecha = clinicDateKey(appointment.inicio)
  const inicio = agendaTime(appointment.inicio)
  const fin = agendaTime(appointment.fin)
  if (!fecha || !inicio || !fin) throw new Error('La API devolvió una cita con horario inválido.')

  return {
    codigo: appointment.id,
    fecha,
    hora: `${inicio}–${fin}`,
    estado: appointment.estado,
    modalidad: appointment.modalidad === 'VIRTUAL' ? 'VIDEOLLAMADA' : 'PRESENCIAL',
    paciente: {
      id: appointment.paciente.id,
      nombre: `${appointment.paciente.nombre} ${appointment.paciente.apellidos}`,
      telefono: appointment.paciente.telefono,
    },
    futura: new Date(appointment.inicio).getTime() > Date.now(),
    llamada: 'SIN_INICIAR',
    puedeConsultar: appointment.estado === 'ACEPTADA' && appointment.consultaId === null,
    consultaId: appointment.consultaId,
  }
}

/** Médico autenticado, obtenido exclusivamente de su perfil propio. */
export async function obtenerMedicoActual(): Promise<Medico> {
  const doctor = await getOwnDoctor() as ApiDoctor
  return {
    id: doctor.id,
    nombre: `${doctor.nombre} ${doctor.apellidos}`,
    iniciales: `${doctor.nombre[0] ?? ''}${doctor.apellidos[0] ?? ''}`.toUpperCase(),
    especialidad: doctor.especialidad.nombre,
    numeroProfesional: doctor.numeroProfesional,
  }
}

// ---------- Agenda ----------
/**
 * Bloques y citas propias del médico, proyectados en la zona oficial de la clínica.
 */
export async function listarAgendaSemana(lunes: FechaISO): Promise<AgendaSemana> {
  const dias = diasHabiles(lunes)
  const [availability, appointments] = await Promise.all([
    listOwnAvailability() as Promise<ApiAvailability[]>,
    listOwnAppointments() as Promise<ApiDoctorAppointment[]>,
  ])

  return {
    bloques: availability.flatMap((block) => {
      const fecha = clinicDateKey(block.inicio)
      const inicio = agendaTime(block.inicio)
      const fin = agendaTime(block.fin)
      return block.activa && fecha && inicio && fin && dias.includes(fecha)
        ? [{ id: block.id, fecha, inicio, fin }]
        : []
    }),
    citas: appointments
      .map(toAgendaAppointment)
      .filter((appointment) => dias.includes(appointment.fecha)),
  }
}

/** Una cita del médico por id (la usa la sala de videollamada y el expediente). */
export async function obtenerCitaMedico(codigo: string): Promise<CitaAgenda> {
  return toAgendaAppointment(await getAppointment(codigo) as ApiDoctorAppointment)
}

/** Acepta una solicitud PENDIENTE. TODO API: PATCH /appointments/:id/accept */
export async function aceptarCita(codigo: string): Promise<CitaAgenda> {
  return toAgendaAppointment(await acceptAppointment(codigo) as ApiDoctorAppointment)
}

/** Rechaza una solicitud PENDIENTE y libera el bloque. TODO API: PATCH /appointments/:id/reject */
export async function rechazarCita(codigo: string): Promise<CitaAgenda> {
  return toAgendaAppointment(await rejectAppointment(codigo) as ApiDoctorAppointment)
}

/** Cancela una cita PENDIENTE o ACEPTADA y libera el bloque. TODO API: PATCH /appointments/:id/cancel */
export async function cancelarCitaMedico(codigo: string): Promise<CitaAgenda> {
  return toAgendaAppointment(await cancelAppointment(codigo) as ApiDoctorAppointment)
}

/**
 * Reprograma una cita a otro bloque libre: la original pasa a REPROGRAMADA y se crea una nueva PENDIENTE
 * enlazada a la original (igual que el backend). TODO API: POST /appointments/:id/reschedule { nuevaDisponibilidadId }
 */
export async function reprogramarCitaMedico(codigo: string, disponibilidadId: string, modalidad: CitaAgenda['modalidad']): Promise<CitaAgenda> {
  const replacement = await rescheduleAppointment(codigo, disponibilidadId, modalidad === 'VIDEOLLAMADA' ? 'VIRTUAL' : 'PRESENCIAL') as ApiDoctorAppointment
  const appointments = await listOwnAppointments() as ApiDoctorAppointment[]
  const created = appointments.find((appointment) => appointment.id === replacement.id)
  if (!created) throw new Error('La cita reprogramada no está disponible en la agenda.')
  return toAgendaAppointment(created)
}

/**
 * Publica bloques de 30 min entre `desde` y `hasta` (los ya existentes se omiten).
 * TODO API: POST /availability  (el backend recibe un bloque por llamada: `inicio` en ISO)
 */
export async function publicarBloques({ fecha, desde, hasta, modalidades }: NuevoBloque): Promise<BloqueDisponibilidad[]> {
  if (!fecha || !desde || hasta !== sumarMinutos(desde, 30)) {
    throw new ApiError('La disponibilidad debe publicarse en un único bloque de 30 minutos.', 400)
  }

  const selection = modalidades && modalidades.length > 0 ? modalidades : ['PRESENCIAL', 'VIRTUAL']
  const created = await publishAvailability({
    inicio: agendaDateTime(fecha, desde),
    modalidades: selection,
  }) as ApiAvailability
  return [{
    id: created.id,
    fecha: clinicDateKey(created.inicio) ?? fecha,
    inicio: agendaTime(created.inicio),
    fin: agendaTime(created.fin),
  }]
}

/** Elimina un bloque sin cita activa. TODO API: DELETE /availability/:id */
export async function eliminarBloque(id: string): Promise<void> {
  await removeAvailability(id)
}

// ---------- Pacientes ----------
/**
 * Pacientes vinculados al médico, con búsqueda por nombre.
 * ⚠ TODO API: este endpoint NO existe aún (pedir al backend, p. ej. GET /doctors/me/patients?search=...)
 */
export async function listarPacientes(busqueda = ''): Promise<PacienteVinculado[]> {
  const appointments = await listOwnAppointments() as ApiDoctorAppointment[]
  const texto = busqueda.trim().toLowerCase()
  const unique = new Map<string, ApiDoctorAppointment>()
  appointments.forEach((appointment) => {
    if (!unique.has(appointment.paciente.id)) unique.set(appointment.paciente.id, appointment)
  })

  return [...unique.values()]
    .map((appointment) => ({
      paciente: {
        id: appointment.paciente.id,
        nombre: appointment.paciente.nombre,
        apellidos: appointment.paciente.apellidos,
        nacimiento: '',
        sexo: 'NO_ESPECIFICADO' as const,
        telefono: appointment.paciente.telefono ?? '',
        email: 'No disponible',
        direccion: '',
        ocupacion: '',
        migrante: false,
        responsable: null,
      },
      ultimaConsulta: null,
    }))
    .filter(({ paciente }) => `${paciente.nombre} ${paciente.apellidos}`.toLowerCase().includes(texto))
}

/** Expediente completo de un paciente vinculado. TODO API: GET /patients/:id/record */
type ApiPatientRecord = {
  id: string
  fechaNacimiento: string
  sexo: Paciente['sexo']
  direccion: string | null
  ocupacion: string | null
  poblacionMigrante: boolean
  nombreResponsable: string | null
  antecedentesGenerales: Partial<Antecedentes> | null
  antecedentesGineco: Partial<AntecedentesGineco> | null
  citas: Array<{
    id: string
    inicio: string
    consulta: { id: string; diagnostico: string } | null
    medico?: { usuario?: { nombre: string; apellidos: string }; especialidad?: { nombre: string } }
  }>
}

export async function obtenerExpediente(pacienteId: string): Promise<Expediente> {
  const [record, appointments] = await Promise.all([
    getPatientRecord(pacienteId) as Promise<ApiPatientRecord>,
    listOwnAppointments() as Promise<ApiDoctorAppointment[]>,
  ])
  if (!record) throw new ApiError('No encontramos el expediente solicitado.', 404)

  const linked = appointments.find((appointment) => appointment.paciente.id === pacienteId)
  if (!linked) throw new ApiError('El paciente no está vinculado a tus citas.', 403)
  const paciente = {
    id: record.id,
    nombre: linked.paciente.nombre,
    apellidos: linked.paciente.apellidos,
    nacimiento: String(record.fechaNacimiento || '').slice(0, 10),
    sexo: record.sexo,
    telefono: linked.paciente.telefono ?? '',
    email: 'No disponible',
    direccion: record.direccion ?? '',
    ocupacion: record.ocupacion ?? '',
    migrante: Boolean(record.poblacionMigrante),
    responsable: record.nombreResponsable ?? null,
  } as Paciente
  const consultas: ConsultaPrevia[] = (record.citas || [])
    .filter((cita): cita is ApiPatientRecord['citas'][number] & { consulta: { id: string; diagnostico: string } } => cita.consulta !== null)
    .map((cita) => ({
      id: cita.consulta.id,
      fecha: clinicDateKey(cita.inicio) ?? '',
      // Admite temporalmente respuestas de servidores aún no reiniciados tras ampliar la proyección.
      medico: cita.medico?.usuario ? `${cita.medico.usuario.nombre} ${cita.medico.usuario.apellidos}` : 'Médico no disponible',
      especialidad: cita.medico?.especialidad?.nombre ?? 'Especialidad no disponible',
      diagnostico: cita.consulta.diagnostico,
    }))
  const aceptada = appointments.find((appointment) => appointment.paciente.id === pacienteId && appointment.estado === 'ACEPTADA' && !appointment.consultaId)

  return {
    paciente,
    antecedentes: {
      medicos: record.antecedentesGenerales?.medicos || '',
      quirurgicos: record.antecedentesGenerales?.quirurgicos || '',
      familiares: record.antecedentesGenerales?.familiares || '',
      habitos: record.antecedentesGenerales?.habitos || '',
      alergias: record.antecedentesGenerales?.alergias || 'Sin alergias conocidas',
    },
    gineco: record.antecedentesGineco ? {
      fur: String(record.antecedentesGineco.fur || '').slice(0, 10),
      gestas: record.antecedentesGineco.gestas ?? 0,
      partos: record.antecedentesGineco.partos ?? 0,
      cesareas: record.antecedentesGineco.cesareas ?? 0,
      abortos: record.antecedentesGineco.abortos ?? 0,
      hijosVivos: record.antecedentesGineco.hijosVivos ?? 0,
      planificacion: record.antecedentesGineco.planificacion ?? '',
    } : null,
    consultas,
    citaAceptada: aceptada ? {
      codigo: aceptada.id,
      fecha: clinicDateKey(aceptada.inicio) ?? '',
      hora: `${agendaTime(aceptada.inicio)}–${agendaTime(aceptada.fin)}`,
    } : null,
  }
}

/** Edita los antecedentes permanentes sin crear una consulta. Confirma desde el servidor. */
export async function guardarAntecedentes(pacienteId: string, datos: Antecedentes): Promise<Antecedentes> {
  if (!datos.alergias.trim()) throw new ApiError('Las alergias son obligatorias: escribe "Sin alergias conocidas" si no hay.', 400)
  const antecedentesGenerales = {
    medicos: datos.medicos.trim(),
    quirurgicos: datos.quirurgicos.trim(),
    familiares: datos.familiares.trim(),
    habitos: datos.habitos.trim(),
    alergias: datos.alergias.trim(),
  }
  const res = await updateBackground(pacienteId, { antecedentesGenerales }) as {
    antecedentesGenerales: Partial<Antecedentes> | null
  }
  const ag = res?.antecedentesGenerales ?? {}
  return {
    medicos: String(ag.medicos ?? ''),
    quirurgicos: String(ag.quirurgicos ?? ''),
    familiares: String(ag.familiares ?? ''),
    habitos: String(ag.habitos ?? ''),
    alergias: String(ag.alergias ?? datos.alergias),
  }
}

/** Edita los antecedentes gineco-obstétricos (solo sexo F). Confirma desde el servidor. */
export async function guardarGineco(pacienteId: string, datos: AntecedentesGineco): Promise<AntecedentesGineco> {
  const conteos = [datos.gestas, datos.partos, datos.cesareas, datos.abortos, datos.hijosVivos]
  if (conteos.some((n) => !Number.isInteger(n) || n < 0)) throw new ApiError('Los conteos deben ser números enteros, 0 o más.', 400)
  if (datos.fur && datos.fur > new Date().toISOString().slice(0, 10)) throw new ApiError('La FUR no puede ser una fecha futura.', 400)
  const antecedentesGineco = {
    fur: datos.fur || undefined,
    gestas: datos.gestas,
    partos: datos.partos,
    cesareas: datos.cesareas,
    abortos: datos.abortos,
    hijosVivos: datos.hijosVivos,
    planificacion: datos.planificacion.trim() || undefined,
  }
  const res = await updateBackground(pacienteId, { antecedentesGenerales: null as unknown as object, antecedentesGineco }) as {
    antecedentesGineco: Partial<AntecedentesGineco> | null
  }
  const gi = res?.antecedentesGineco ?? {}
  return {
    fur: String(gi.fur ?? datos.fur ?? '').slice(0, 10),
    gestas: gi.gestas ?? datos.gestas,
    partos: gi.partos ?? datos.partos,
    cesareas: gi.cesareas ?? datos.cesareas,
    abortos: gi.abortos ?? datos.abortos,
    hijosVivos: gi.hijosVivos ?? datos.hijosVivos,
    planificacion: String(gi.planificacion ?? datos.planificacion),
  }
}

// ---------- Consulta ----------
type ApiPatient = {
  id: string
  fechaNacimiento: string
  sexo: Paciente['sexo']
  direccion: string | null
  ocupacion: string | null
  poblacionMigrante: boolean
  nombreResponsable: string | null
  usuario: { nombre: string; apellidos: string; correo: string; telefono: string }
}

type ApiConsultation = {
  id: string
  citaId: string
  tipoFicha: FormularioConsulta['tipoFicha']
  motivoConsulta: string
  historiaActual: string | null
  diagnostico: string
  observaciones: string | null
  cita: {
    inicio: string
    fin: string
    paciente: ApiPatient
    medico: { id: string; numeroProfesional: string; usuario: { nombre: string; apellidos: string }; especialidad: { nombre: string } }
  }
  signosVitales: {
    pesoLb: string | number | null; pesoLbEstado: 'MEDIDO' | 'AUTORREPORTADO' | 'NO_MEDIDO'
    tallaCm: string | number | null; tallaCmEstado: 'MEDIDO' | 'AUTORREPORTADO' | 'NO_MEDIDO'
    temperatura: string | number | null; temperaturaEstado: 'MEDIDO' | 'AUTORREPORTADO' | 'NO_MEDIDO'
    presionArterial: string | null; presionArterialEstado: 'MEDIDO' | 'AUTORREPORTADO' | 'NO_MEDIDO'
    frecCardiaca: number | null; frecCardiacaEstado: 'MEDIDO' | 'AUTORREPORTADO' | 'NO_MEDIDO'
    frecRespiratoria: number | null; frecRespiratoriaEstado: 'MEDIDO' | 'AUTORREPORTADO' | 'NO_MEDIDO'
  } | null
  recetas: FormularioConsulta['receta']
}

type ApiClinicalAppointment = Omit<ApiDoctorAppointment, 'paciente' | 'consultaId'> & {
  paciente: ApiPatient
  consulta: { id: string } | null
  preconsulta: PreconsultaPaciente | null
}

const toPatient = (patient: ApiPatient): Paciente => ({
  id: patient.id,
  nombre: patient.usuario.nombre,
  apellidos: patient.usuario.apellidos,
  nacimiento: patient.fechaNacimiento.slice(0, 10),
  sexo: patient.sexo,
  telefono: patient.usuario.telefono,
  email: patient.usuario.correo,
  direccion: patient.direccion ?? '',
  ocupacion: patient.ocupacion ?? '',
  migrante: patient.poblacionMigrante,
  responsable: patient.nombreResponsable,
})

const toMedicalAppointment = (appointment: ApiClinicalAppointment): CitaAgenda => toAgendaAppointment({
  ...appointment,
  paciente: {
    id: appointment.paciente.id,
    nombre: appointment.paciente.usuario.nombre,
    apellidos: appointment.paciente.usuario.apellidos,
    telefono: appointment.paciente.usuario.telefono,
  },
  consultaId: appointment.consulta?.id ?? null,
})

const toConsultation = (consultation: ApiConsultation): ConsultaGuardada => {
  const fecha = clinicDateKey(consultation.cita.inicio)
  const inicio = agendaTime(consultation.cita.inicio)
  const fin = agendaTime(consultation.cita.fin)
  if (!fecha || !inicio || !fin) throw new Error('La API devolvió una consulta con horario inválido.')

  const form = formularioVacio(consultation.tipoFicha)
  return {
    id: consultation.id,
    citaCodigo: consultation.citaId,
    fecha,
    hora: `${inicio}–${fin}`,
    paciente: toPatient(consultation.cita.paciente),
    medico: {
      id: consultation.cita.medico.id,
      nombre: `${consultation.cita.medico.usuario.nombre} ${consultation.cita.medico.usuario.apellidos}`,
      iniciales: `${consultation.cita.medico.usuario.nombre[0] ?? ''}${consultation.cita.medico.usuario.apellidos[0] ?? ''}`.toUpperCase(),
      especialidad: consultation.cita.medico.especialidad.nombre,
      numeroProfesional: consultation.cita.medico.numeroProfesional,
    },
    formulario: {
      ...form,
      motivo: consultation.motivoConsulta,
      historiaActual: consultation.historiaActual ?? '',
      diagnostico: consultation.diagnostico,
      observaciones: consultation.observaciones ?? '',
      signos: {
        peso: consultation.signosVitales?.pesoLb?.toString() ?? '',
        talla: consultation.signosVitales?.tallaCm?.toString() ?? '',
        temperatura: consultation.signosVitales?.temperatura?.toString() ?? '',
        presion: consultation.signosVitales?.presionArterial ?? '',
        fc: consultation.signosVitales?.frecCardiaca?.toString() ?? '',
        fr: consultation.signosVitales?.frecRespiratoria?.toString() ?? '',
      },
      signosEstado: {
        peso: consultation.signosVitales?.pesoLbEstado ?? 'NO_MEDIDO', talla: consultation.signosVitales?.tallaCmEstado ?? 'NO_MEDIDO',
        temperatura: consultation.signosVitales?.temperaturaEstado ?? 'NO_MEDIDO', presion: consultation.signosVitales?.presionArterialEstado ?? 'NO_MEDIDO',
        fc: consultation.signosVitales?.frecCardiacaEstado ?? 'NO_MEDIDO', fr: consultation.signosVitales?.frecRespiratoriaEstado ?? 'NO_MEDIDO',
      },
      receta: consultation.recetas,
    },
  }
}

/** Todo lo necesario para abrir la ficha de una cita aceptada propia. */
export async function obtenerContextoConsulta(citaId: string): Promise<ContextoConsulta> {
  const [appointment, doctor] = await Promise.all([
    getAppointment(citaId) as Promise<ApiClinicalAppointment>,
    obtenerMedicoActual(),
  ])
  if (appointment.estado !== 'ACEPTADA' || appointment.consulta) {
    throw new ApiError('La consulta solo puede registrarse una vez para una cita aceptada.', 409)
  }

  const cita = toMedicalAppointment(appointment)
  const paciente = toPatient(appointment.paciente)
  const fichas = fichasDisponibles(paciente, cita.fecha)
  const preconsulta = appointment.preconsulta ?? null
  const borrador = (() => {
    if (!preconsulta) return null
    const form = { ...formularioVacio(fichaSugerida(fichas)), motivo: preconsulta.motivoConsulta }
    const source = preconsulta.signosVitales ?? {}
    const fields = [
      ['peso', 'pesoLb'], ['talla', 'tallaCm'], ['temperatura', 'temperatura'],
      ['presion', 'presionArterial'], ['fc', 'frecCardiaca'], ['fr', 'frecRespiratoria'],
    ] as const
    fields.forEach(([field, sourceField]) => {
      const value = source[sourceField]
      if (value !== undefined && value !== null && value !== '') {
        form.signos[field] = String(value)
        form.signosEstado[field] = 'AUTORREPORTADO'
      }
    })
    return form
  })()
  return {
    cita,
    paciente,
    medico: doctor,
    gineco: null,
    edadTexto: edadTexto(paciente.nacimiento, cita.fecha),
    fichas,
    sugerida: fichaSugerida(fichas),
    consultaId: null,
    preconsulta,
    borrador,
  }
}

/** Completa consulta, diagnóstico, signos vitales y recetas en una sola transacción. */
export async function registrarConsulta(citaId: string, formulario: FormularioConsulta): Promise<ConsultaGuardada> {
  const errores = Object.values(erroresConsulta(formulario))
  if (errores.length > 0) throw new ApiError(errores[0], 400)
  if (!recetaValida(formulario.receta)) {
    throw new ApiError('Si añades una receta, completa los seis campos de cada medicamento.', 400)
  }

  const signo = (campo: keyof FormularioConsulta['signos'], valor: string | number) => {
    const estado = formulario.signosEstado[campo]
    return estado === 'NO_MEDIDO' ? { estado } : { estado, valor }
  }
  const signosVitales = {
    pesoLb: signo('peso', aNumero(formulario.signos.peso)),
    tallaCm: signo('talla', aNumero(formulario.signos.talla)),
    temperatura: signo('temperatura', aNumero(formulario.signos.temperatura)),
    presionArterial: signo('presion', formulario.signos.presion.trim().replace(/\s/g, '')),
    frecCardiaca: signo('fc', aNumero(formulario.signos.fc)),
    frecRespiratoria: signo('fr', aNumero(formulario.signos.fr)),
  }
  const payload = {
    citaId,
    tipoFicha: formulario.tipoFicha,
    motivoConsulta: formulario.motivo.trim(),
    historiaActual: formulario.historiaActual.trim() || undefined,
    diagnostico: formulario.diagnostico.trim(),
    observaciones: formulario.observaciones.trim() || undefined,
    signosVitales,
    recetas: recetaFinal(formulario.receta).map((receta) => ({
      medicamento: receta.medicamento.trim(),
      dosis: receta.dosis.trim(),
      via: receta.via.trim(),
      frecuencia: receta.frecuencia.trim(),
      duracion: receta.duracion.trim(),
      indicaciones: receta.indicaciones.trim(),
    })),
  }
  return toConsultation(await createConsultation(payload) as ApiConsultation)
}

/** Consulta registrada y sus recetas, autorizada para el médico propietario. */
export async function obtenerConsulta(consultaId: string): Promise<ConsultaGuardada> {
  return toConsultation(await getConsultation(consultaId) as ApiConsultation)
}
