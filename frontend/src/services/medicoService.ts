import { ApiError, USAR_MOCK, esperar } from './api'
import {
  ANTECEDENTES, BLOQUES_INICIALES, CITAS_INICIALES, CONSULTAS_INICIALES, GINECO, GINECO_VACIO, MEDICO_ACTUAL, PACIENTES,
  type CitaMock,
} from '../pages/medico/datosEjemplo'
import { diasHabiles, esFutura, franjas, sumarMinutos, MINUTOS_BLOQUE } from '../lib/semana'
import {
  codigoConsulta, edadTexto, erroresConsulta, fichaSugerida, fichasDisponibles, recetaFinal, recetaValida,
} from '../lib/consulta'
import type {
  AgendaSemana, Antecedentes, AntecedentesGineco, BloqueDisponibilidad, CitaAgenda, ConsultaGuardada, ConsultaPrevia,
  ContextoConsulta, Expediente, FechaISO, FormularioConsulta, Medico, NuevoBloque, Paciente, PacienteVinculado,
} from '../types/medico'

// ---------- Base de datos falsa en memoria (solo modo mock) ----------
const citasMock: CitaMock[] = CITAS_INICIALES.map((c) => ({ ...c }))
let bloquesMock: BloqueDisponibilidad[] = BLOQUES_INICIALES.map((b) => ({ ...b }))
const consultasMock: ConsultaGuardada[] = structuredClone(CONSULTAS_INICIALES)
const antecedentesMock: Record<string, Antecedentes> = structuredClone(ANTECEDENTES)
const ginecoMock: Record<string, AntecedentesGineco> = structuredClone(GINECO)
const borradoresMock = new Map<string, FormularioConsulta>()
let contadorCita = 1100

const ACTIVAS = ['PENDIENTE', 'ACEPTADA']
const inicioDe = (hora: string) => hora.split('–')[0]

/** Todas las funciones usan datos de ejemplo hasta que el backend esté conectado */
const exigirMock = () => {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
}

const buscarCita = (codigo: string) => {
  const cita = citasMock.find((c) => c.codigo === codigo)
  if (!cita) throw new ApiError('No encontramos esta cita.', 404)
  return cita
}

const buscarPaciente = (id: string): Paciente => {
  const paciente = PACIENTES.find((p) => p.id === id)
  if (!paciente) throw new ApiError('No encontramos este paciente.', 404)
  return paciente
}

const consultaDeCita = (codigo: string) => consultasMock.find((c) => c.citaCodigo === codigo)

const paraAgenda = (c: CitaMock): CitaAgenda => {
  const p = PACIENTES.find((x) => x.id === c.pacienteId)
  const consulta = consultaDeCita(c.codigo)
  return {
    codigo: c.codigo, fecha: c.fecha, hora: c.hora, estado: c.estado, modalidad: c.modalidad,
    paciente: { id: c.pacienteId, nombre: p ? `${p.nombre} ${p.apellidos}` : 'Paciente', telefono: p?.telefono ?? '' },
    futura: esFutura(c.fecha, c.hora),
    llamada: c.llamada,
    puedeConsultar: c.estado === 'ACEPTADA' && !consulta,
    consultaId: consulta?.id ?? null,
  }
}

/** Una cita solo se puede decidir o cancelar mientras está activa y no ha llegado su hora */
const exigirModificable = (cita: CitaMock, permitidos: string[]) => {
  if (!permitidos.includes(cita.estado)) throw new ApiError(`La cita ya está ${cita.estado.toLowerCase()}.`, 409)
  if (!esFutura(cita.fecha, cita.hora)) throw new ApiError('La cita ya pasó y no se puede modificar.', 409)
}

/** Consultas del paciente, de la más reciente a la más antigua */
const historialDe = (pacienteId: string) =>
  consultasMock.filter((c) => c.paciente.id === pacienteId).sort((a, b) => b.fecha.localeCompare(a.fecha))

// ---------- Perfil ----------
/** Médico con sesión iniciada. TODO API: GET /auth/me + GET /doctors/me */
export async function obtenerMedicoActual(): Promise<Medico> {
  exigirMock()
  await esperar(150)
  return { ...MEDICO_ACTUAL }
}

// ---------- Agenda ----------
/**
 * Bloques y citas de lunes a viernes de la semana que empieza en `lunes`.
 * TODO API: GET /appointments/me  +  GET /availability/doctor/:medicoId
 */
export async function listarAgendaSemana(lunes: FechaISO): Promise<AgendaSemana> {
  exigirMock()
  await esperar(250)
  const dias = diasHabiles(lunes)
  return {
    bloques: bloquesMock.filter((b) => dias.includes(b.fecha)).map((b) => ({ ...b })),
    citas: citasMock.filter((c) => dias.includes(c.fecha)).map(paraAgenda),
  }
}

/** Una cita del médico (la usa la sala de videollamada). TODO API: GET /appointments/:id */
export async function obtenerCitaMedico(codigo: string): Promise<CitaAgenda> {
  exigirMock()
  await esperar(150)
  return paraAgenda(buscarCita(codigo))
}

/** Acepta una solicitud PENDIENTE. TODO API: PATCH /appointments/:id/accept */
export async function aceptarCita(codigo: string): Promise<CitaAgenda> {
  exigirMock()
  await esperar(300)
  const cita = buscarCita(codigo)
  exigirModificable(cita, ['PENDIENTE'])
  cita.estado = 'ACEPTADA'
  return paraAgenda(cita)
}

/** Rechaza una solicitud PENDIENTE y libera el bloque. TODO API: PATCH /appointments/:id/reject */
export async function rechazarCita(codigo: string): Promise<CitaAgenda> {
  exigirMock()
  await esperar(300)
  const cita = buscarCita(codigo)
  exigirModificable(cita, ['PENDIENTE'])
  cita.estado = 'RECHAZADA'
  return paraAgenda(cita)
}

/** Cancela una cita PENDIENTE o ACEPTADA y libera el bloque. TODO API: PATCH /appointments/:id/cancel */
export async function cancelarCitaMedico(codigo: string): Promise<CitaAgenda> {
  exigirMock()
  await esperar(300)
  const cita = buscarCita(codigo)
  exigirModificable(cita, ACTIVAS)
  cita.estado = 'CANCELADA'
  return paraAgenda(cita)
}

/**
 * Reprograma una cita a otro bloque libre: la original pasa a REPROGRAMADA y se crea una nueva PENDIENTE
 * enlazada a la original (igual que el backend). TODO API: POST /appointments/:id/reschedule { nuevaDisponibilidadId }
 */
export async function reprogramarCitaMedico(codigo: string, fecha: FechaISO, inicio: string): Promise<CitaAgenda> {
  exigirMock()
  await esperar(300)
  const original = buscarCita(codigo)
  exigirModificable(original, ACTIVAS)

  const bloque = bloquesMock.find((b) => b.fecha === fecha && b.inicio === inicio)
  if (!bloque) throw new ApiError('El nuevo bloque no está disponible.', 409)
  if (!esFutura(fecha, `${inicio}–${bloque.fin}`)) throw new ApiError('El nuevo bloque debe ser futuro.', 409)
  const ocupado = citasMock.some((c) => c.fecha === fecha && inicioDe(c.hora) === inicio && ACTIVAS.includes(c.estado))
  if (ocupado) throw new ApiError('El nuevo bloque ya está reservado.', 409)

  original.estado = 'REPROGRAMADA'
  const nueva: CitaMock = {
    codigo: `C-${++contadorCita}`, fecha, hora: `${inicio}–${bloque.fin}`, estado: 'PENDIENTE',
    modalidad: original.modalidad, pacienteId: original.pacienteId, llamada: 'SIN_INICIAR',
  }
  citasMock.push(nueva)
  return paraAgenda(nueva)
}

/**
 * Publica bloques de 30 min entre `desde` y `hasta` (los ya existentes se omiten).
 * TODO API: POST /availability  (el backend recibe un bloque por llamada: `inicio` en ISO)
 */
export async function publicarBloques({ fecha, desde, hasta }: NuevoBloque): Promise<BloqueDisponibilidad[]> {
  exigirMock()
  await esperar(300)
  if (!fecha || !desde || !hasta || hasta <= desde) {
    throw new ApiError('Indica una fecha y un rango válido: "Hasta" debe ser posterior a "Desde".', 400)
  }
  if (!esFutura(fecha, `${desde}–${hasta}`)) throw new ApiError('No puedes crear bloques en el pasado.', 400)

  const nuevos: BloqueDisponibilidad[] = []
  for (const inicio of franjas(desde, hasta)) {
    if (bloquesMock.some((b) => b.fecha === fecha && b.inicio === inicio)) continue
    nuevos.push({ id: `B-${fecha}-${inicio}`, fecha, inicio, fin: sumarMinutos(inicio, MINUTOS_BLOQUE) })
  }
  bloquesMock = [...bloquesMock, ...nuevos]
  return nuevos.map((b) => ({ ...b }))
}

/** Elimina un bloque sin cita activa. TODO API: DELETE /availability/:id */
export async function eliminarBloque(id: string): Promise<void> {
  exigirMock()
  await esperar(250)
  const bloque = bloquesMock.find((b) => b.id === id)
  if (!bloque) throw new ApiError('No encontramos este bloque.', 404)
  const ocupado = citasMock.some((c) => c.fecha === bloque.fecha && inicioDe(c.hora) === bloque.inicio && ACTIVAS.includes(c.estado))
  if (ocupado) throw new ApiError('Un bloque con una cita activa no se puede eliminar.', 409)
  bloquesMock = bloquesMock.filter((b) => b.id !== id)
}

// ---------- Videollamada (sala del médico) ----------
/** Entrar (o volver a entrar) a la sala. TODO API: POST /appointments/:id/call/join */
export async function unirseLlamadaMedico(codigo: string): Promise<CitaAgenda> {
  exigirMock()
  await esperar(150)
  const cita = buscarCita(codigo)
  if (cita.modalidad !== 'VIDEOLLAMADA' || cita.estado !== 'ACEPTADA') throw new ApiError('Esta videollamada no está disponible.', 409)
  if (cita.llamada === 'FINALIZADA') throw new ApiError('Esta videollamada ya finalizó.', 409)
  cita.llamada = 'EN_CURSO'
  return paraAgenda(cita)
}

/** Colgar termina la videollamada para ambas personas. TODO API: POST /appointments/:id/call/end */
export async function colgarLlamadaMedico(codigo: string): Promise<CitaAgenda> {
  exigirMock()
  await esperar(150)
  const cita = buscarCita(codigo)
  cita.llamada = 'FINALIZADA'
  return paraAgenda(cita)
}

// ---------- Pacientes ----------
/**
 * Pacientes vinculados al médico, con búsqueda por nombre.
 * ⚠ TODO API: este endpoint NO existe aún (pedir al backend, p. ej. GET /doctors/me/patients?search=...)
 */
export async function listarPacientes(busqueda = ''): Promise<PacienteVinculado[]> {
  exigirMock()
  await esperar(250)
  const texto = busqueda.trim().toLowerCase()
  return PACIENTES
    .filter((p) => `${p.nombre} ${p.apellidos}`.toLowerCase().includes(texto))
    .map((paciente) => {
      const ultima = historialDe(paciente.id)[0]
      return {
        paciente: { ...paciente },
        ultimaConsulta: ultima ? { fecha: ultima.fecha, motivo: ultima.formulario.motivo } : null,
      }
    })
}

/** Expediente completo de un paciente vinculado. TODO API: GET /patients/:id/record */
export async function obtenerExpediente(pacienteId: string): Promise<Expediente> {
  exigirMock()
  await esperar(250)
  const paciente = buscarPaciente(pacienteId)
  const aceptada = citasMock
    .filter((c) => c.pacienteId === pacienteId && c.estado === 'ACEPTADA' && !consultaDeCita(c.codigo))
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))[0]
  const consultas: ConsultaPrevia[] = historialDe(pacienteId).map((c) => ({
    id: c.id, fecha: c.fecha, medico: c.medico.nombre, especialidad: c.medico.especialidad, diagnostico: c.formulario.diagnostico,
  }))
  return {
    paciente: { ...paciente },
    antecedentes: { ...antecedentesMock[pacienteId] },
    gineco: paciente.sexo === 'F' ? { ...(ginecoMock[pacienteId] ?? GINECO_VACIO) } : null,
    consultas,
    citaAceptada: aceptada ? { codigo: aceptada.codigo, fecha: aceptada.fecha, hora: aceptada.hora } : null,
  }
}

/** Edita los antecedentes permanentes sin crear una consulta. TODO API: PUT /patients/:id/background */
export async function guardarAntecedentes(pacienteId: string, datos: Antecedentes): Promise<Antecedentes> {
  exigirMock()
  await esperar(250)
  buscarPaciente(pacienteId)
  if (!datos.alergias.trim()) throw new ApiError('Las alergias son obligatorias: escribe "Sin alergias conocidas" si no hay.', 400)
  const limpio: Antecedentes = {
    medicos: datos.medicos.trim(), quirurgicos: datos.quirurgicos.trim(), familiares: datos.familiares.trim(),
    habitos: datos.habitos.trim(), alergias: datos.alergias.trim(),
  }
  antecedentesMock[pacienteId] = limpio
  return { ...limpio }
}

/** Edita los antecedentes gineco-obstétricos (solo sexo F). TODO API: PUT /patients/:id/background (campo gineco) */
export async function guardarGineco(pacienteId: string, datos: AntecedentesGineco): Promise<AntecedentesGineco> {
  exigirMock()
  await esperar(250)
  const paciente = buscarPaciente(pacienteId)
  if (paciente.sexo !== 'F') throw new ApiError('Este formulario solo aplica a pacientes de sexo F.', 400)
  const conteos = [datos.gestas, datos.partos, datos.cesareas, datos.abortos, datos.hijosVivos]
  if (conteos.some((n) => !Number.isInteger(n) || n < 0)) throw new ApiError('Los conteos deben ser números enteros, 0 o más.', 400)
  if (datos.fur && datos.fur > new Date().toISOString().slice(0, 10)) throw new ApiError('La FUR no puede ser una fecha futura.', 400)
  ginecoMock[pacienteId] = { ...datos, planificacion: datos.planificacion.trim() }
  return { ...ginecoMock[pacienteId] }
}

// ---------- Consulta ----------
/**
 * Todo lo necesario para abrir la ficha de una cita aceptada.
 * TODO API: GET /appointments/:id + GET /patients/:id/record (la cita debe ser propia y estar ACEPTADA)
 */
export async function obtenerContextoConsulta(citaCodigo: string): Promise<ContextoConsulta> {
  exigirMock()
  await esperar(250)
  const cita = buscarCita(citaCodigo)
  if (consultaDeCita(citaCodigo)) throw new ApiError('Esta cita ya tiene una consulta registrada.', 409)
  if (cita.estado !== 'ACEPTADA') throw new ApiError('La consulta solo puede registrarse para una cita aceptada.', 409)

  const paciente = buscarPaciente(cita.pacienteId)
  const fichas = fichasDisponibles(paciente, cita.fecha)
  const borrador = borradoresMock.get(citaCodigo)
  return {
    cita: paraAgenda(cita),
    paciente: { ...paciente },
    medico: { ...MEDICO_ACTUAL },
    gineco: paciente.sexo === 'F' ? { ...(ginecoMock[paciente.id] ?? GINECO_VACIO) } : null,
    edadTexto: edadTexto(paciente.nacimiento, cita.fecha),
    fichas,
    sugerida: fichaSugerida(fichas),
    consultaId: codigoConsulta(citaCodigo),
    borrador: borrador ? structuredClone(borrador) : null,
  }
}

/**
 * "Guardar evolución": guarda lo escrito sin completar la consulta.
 * ⚠ TODO API: el backend no tiene borradores (pedirlos, o guardarlos solo en el navegador).
 */
export async function guardarBorradorConsulta(citaCodigo: string, formulario: FormularioConsulta): Promise<void> {
  exigirMock()
  await esperar(250)
  const cita = buscarCita(citaCodigo)
  if (cita.estado !== 'ACEPTADA') throw new ApiError('La consulta solo puede registrarse para una cita aceptada.', 409)
  borradoresMock.set(citaCodigo, structuredClone(formulario))
}

/**
 * Completa la consulta: la cita pasa a COMPLETADA y las filas de receta quedan asociadas.
 * TODO API: POST /consultations  +  POST /prescriptions (una llamada por medicamento)
 * ⚠ El backend pide `evaluacionClinica` con campos distintos según la ficha (ver docs); aquí se guardan como en el Figma.
 */
export async function registrarConsulta(citaCodigo: string, formulario: FormularioConsulta): Promise<ConsultaGuardada> {
  exigirMock()
  await esperar(400)
  const cita = buscarCita(citaCodigo)
  if (consultaDeCita(citaCodigo)) throw new ApiError('Esta cita ya tiene una consulta registrada.', 409)
  if (cita.estado !== 'ACEPTADA') throw new ApiError('La consulta solo puede registrarse para una cita aceptada.', 409)

  const paciente = buscarPaciente(cita.pacienteId)
  if (!fichasDisponibles(paciente, cita.fecha)[formulario.tipoFicha].disponible) {
    throw new ApiError('La ficha seleccionada no está disponible para este paciente.', 400)
  }
  const errores = Object.values(erroresConsulta(formulario))
  if (errores.length > 0) throw new ApiError(errores[0], 400)
  if (!recetaValida(formulario.receta)) {
    throw new ApiError('Si añades una receta, completa los seis campos de cada medicamento.', 400)
  }

  const consulta: ConsultaGuardada = {
    id: codigoConsulta(citaCodigo), citaCodigo, fecha: cita.fecha, hora: cita.hora,
    paciente: { ...paciente }, medico: { ...MEDICO_ACTUAL },
    formulario: structuredClone({ ...formulario, receta: recetaFinal(formulario.receta) }),
  }
  consultasMock.push(consulta)
  cita.estado = 'COMPLETADA'
  borradoresMock.delete(citaCodigo)
  return structuredClone(consulta)
}

/** Consulta registrada (resumen y receta). TODO API: GET /consultations/:id */
export async function obtenerConsulta(consultaId: string): Promise<ConsultaGuardada> {
  exigirMock()
  await esperar(250)
  const consulta = consultasMock.find((c) => c.id === consultaId)
  if (!consulta) throw new ApiError('No encontramos esta consulta.', 404)
  return structuredClone({ ...consulta, paciente: buscarPaciente(consulta.paciente.id) })
}
