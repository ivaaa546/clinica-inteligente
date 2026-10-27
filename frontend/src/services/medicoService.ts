import { ApiError, USAR_MOCK, esperar } from './api'
import {
  ANTECEDENTES, BLOQUES_INICIALES, CITAS_INICIALES, CONSULTAS_PREVIAS, MEDICO_ACTUAL, PACIENTES, ULTIMO_MOTIVO,
  type CitaMock,
} from '../pages/medico/datosEjemplo'
import { diasHabiles, esFutura, franjas, sumarMinutos } from '../lib/semana'
import type {
  AgendaSemana, BloqueDisponibilidad, CitaAgenda, Expediente, FechaISO, Medico, NuevoBloque, PacienteVinculado,
} from '../types/medico'

// ---------- Base de datos falsa en memoria (solo modo mock) ----------
const citasMock: CitaMock[] = CITAS_INICIALES.map((c) => ({ ...c }))
let bloquesMock: BloqueDisponibilidad[] = BLOQUES_INICIALES.map((b) => ({ ...b }))

const ACTIVAS = ['PENDIENTE', 'ACEPTADA']
const inicioDe = (hora: string) => hora.split('–')[0]

const buscarCita = (codigo: string) => {
  const cita = citasMock.find((c) => c.codigo === codigo)
  if (!cita) throw new ApiError('No encontramos esta cita.', 404)
  return cita
}

const paraAgenda = (c: CitaMock): CitaAgenda => {
  const p = PACIENTES.find((x) => x.id === c.pacienteId)
  return {
    codigo: c.codigo, fecha: c.fecha, hora: c.hora, estado: c.estado, modalidad: c.modalidad,
    paciente: { id: c.pacienteId, nombre: p ? `${p.nombre} ${p.apellidos}` : 'Paciente', telefono: p?.telefono ?? '' },
    futura: esFutura(c.fecha, c.hora),
  }
}

/** Una cita solo se puede decidir o cancelar mientras está activa y no ha llegado su hora */
const exigirModificable = (cita: CitaMock, permitidos: string[]) => {
  if (!permitidos.includes(cita.estado)) throw new ApiError(`La cita ya está ${cita.estado.toLowerCase()}.`, 409)
  if (!esFutura(cita.fecha, cita.hora)) throw new ApiError('La cita ya pasó y no se puede modificar.', 409)
}

// ---------- Perfil ----------
/** Médico con sesión iniciada. TODO API: GET /auth/me + GET /doctors/me */
export async function obtenerMedicoActual(): Promise<Medico> {
  if (USAR_MOCK) { await esperar(150); return { ...MEDICO_ACTUAL } }
  throw new ApiError('Pendiente de conectar con la API.', 501)
}

// ---------- Agenda ----------
/**
 * Bloques y citas de lunes a viernes de la semana que empieza en `lunes`.
 * TODO API: GET /appointments/me  +  GET /availability/doctor/:medicoId
 */
export async function listarAgendaSemana(lunes: FechaISO): Promise<AgendaSemana> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(250)
  const dias = diasHabiles(lunes)
  return {
    bloques: bloquesMock.filter((b) => dias.includes(b.fecha)).map((b) => ({ ...b })),
    citas: citasMock.filter((c) => dias.includes(c.fecha)).map(paraAgenda),
  }
}

/** Acepta una solicitud PENDIENTE. TODO API: PATCH /appointments/:id/accept */
export async function aceptarCita(codigo: string): Promise<CitaAgenda> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(300)
  const cita = buscarCita(codigo)
  exigirModificable(cita, ['PENDIENTE'])
  cita.estado = 'ACEPTADA'
  return paraAgenda(cita)
}

/** Rechaza una solicitud PENDIENTE y libera el bloque. TODO API: PATCH /appointments/:id/reject */
export async function rechazarCita(codigo: string): Promise<CitaAgenda> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(300)
  const cita = buscarCita(codigo)
  exigirModificable(cita, ['PENDIENTE'])
  cita.estado = 'RECHAZADA'
  return paraAgenda(cita)
}

/** Cancela una cita PENDIENTE o ACEPTADA y libera el bloque. TODO API: PATCH /appointments/:id/cancel */
export async function cancelarCitaMedico(codigo: string): Promise<CitaAgenda> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(300)
  const cita = buscarCita(codigo)
  exigirModificable(cita, ACTIVAS)
  cita.estado = 'CANCELADA'
  return paraAgenda(cita)
}

/**
 * Publica bloques de 30 min entre `desde` y `hasta` (los ya existentes se omiten).
 * TODO API: POST /availability  (el backend recibe un bloque por llamada: `inicio` en ISO)
 */
export async function publicarBloques({ fecha, desde, hasta }: NuevoBloque): Promise<BloqueDisponibilidad[]> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(300)
  if (!fecha || !desde || !hasta || hasta <= desde) {
    throw new ApiError('Indica una fecha y un rango válido: "Hasta" debe ser posterior a "Desde".', 400)
  }
  if (!esFutura(fecha, `${desde}–${hasta}`)) throw new ApiError('No puedes crear bloques en el pasado.', 400)

  const nuevos: BloqueDisponibilidad[] = []
  for (const inicio of franjas(desde, hasta)) {
    if (bloquesMock.some((b) => b.fecha === fecha && b.inicio === inicio)) continue
    nuevos.push({ id: `B-${fecha}-${inicio}`, fecha, inicio, fin: sumarMinutos(inicio, 30) })
  }
  bloquesMock = [...bloquesMock, ...nuevos]
  return nuevos.map((b) => ({ ...b }))
}

/** Elimina un bloque sin cita activa. TODO API: DELETE /availability/:id */
export async function eliminarBloque(id: string): Promise<void> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(250)
  const bloque = bloquesMock.find((b) => b.id === id)
  if (!bloque) throw new ApiError('No encontramos este bloque.', 404)
  const ocupado = citasMock.some((c) => c.fecha === bloque.fecha && inicioDe(c.hora) === bloque.inicio && ACTIVAS.includes(c.estado))
  if (ocupado) throw new ApiError('Un bloque con una cita activa no se puede eliminar.', 409)
  bloquesMock = bloquesMock.filter((b) => b.id !== id)
}

// ---------- Pacientes ----------
/**
 * Pacientes vinculados al médico, con búsqueda por nombre.
 * ⚠ TODO API: este endpoint NO existe aún (pedir al backend, p. ej. GET /doctors/me/patients?search=...)
 */
export async function listarPacientes(busqueda = ''): Promise<PacienteVinculado[]> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(250)
  const texto = busqueda.trim().toLowerCase()
  return PACIENTES
    .filter((p) => `${p.nombre} ${p.apellidos}`.toLowerCase().includes(texto))
    .map((paciente) => {
      const ultima = CONSULTAS_PREVIAS[paciente.id]?.[0]
      return {
        paciente: { ...paciente },
        ultimaConsulta: ultima ? { fecha: ultima.fecha, motivo: ULTIMO_MOTIVO[paciente.id] ?? ultima.diagnostico } : null,
      }
    })
}

/** Expediente completo de un paciente vinculado. TODO API: GET /patients/:id/record */
export async function obtenerExpediente(pacienteId: string): Promise<Expediente> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(250)
  const paciente = PACIENTES.find((p) => p.id === pacienteId)
  if (!paciente) throw new ApiError('No encontramos este paciente.', 404)
  const aceptada = citasMock
    .filter((c) => c.pacienteId === pacienteId && c.estado === 'ACEPTADA' && esFutura(c.fecha, c.hora))
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))[0]
  return {
    paciente: { ...paciente },
    antecedentes: { ...ANTECEDENTES[pacienteId] },
    consultas: (CONSULTAS_PREVIAS[pacienteId] ?? []).map((c) => ({ ...c })),
    citaAceptada: aceptada ? { codigo: aceptada.codigo, fecha: aceptada.fecha, hora: aceptada.hora } : null,
  }
}
