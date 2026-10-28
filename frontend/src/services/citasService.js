import { ApiError, USAR_MOCK, esperar, request } from './api'
import { CITAS, MEDICOS } from '../pages/paciente/datosEjemplo'

const ACTIVAS = ['PENDIENTE', 'ACEPTADA']
const BLOQUES_BASE = ['09:00–09:30', '10:00–10:30', '10:30–11:00', '11:30–12:00']

// ---------- Base de datos falsa en memoria (solo modo mock) ----------
let citasMock = CITAS.map((c) => ({ ...c }))
let contador = 1100

const libres = (medicoId, fecha) => {
  const dia = new Date(`${fecha}T00:00:00`).getDay()
  if (dia === 0 || dia === 6) return [] // sin atención fines de semana (solo ejemplo)
  const ocupados = citasMock
    .filter((c) => c.medicoId === medicoId && c.iso === fecha && ACTIVAS.includes(c.estado))
    .map((c) => c.hora)
  return BLOQUES_BASE.filter((b) => !ocupados.includes(b))
}

const buscar = (codigo) => {
  const c = citasMock.find((x) => x.codigo === codigo)
  if (!c) throw new ApiError('No encontramos esta cita.', 404)
  return c
}

// ---------- Médicos y disponibilidad (CU-001) ----------
/** Médicos activos. TODO API: GET /doctors?specialty=... */
export async function listarMedicos() {
  if (USAR_MOCK) { await esperar(150); return MEDICOS.map((m) => ({ ...m })) }
  return request('/doctors')
}

/** Bloques libres de 30 min de un médico en una fecha. TODO API: GET /doctors/:id/availability?date=... */
export async function bloquesLibres(medicoId, fecha) {
  if (USAR_MOCK) { await esperar(150); return libres(medicoId, fecha) }
  return request(`/doctors/${medicoId}/availability?date=${fecha}`)
}

// ---------- Citas del paciente (CU-002) ----------
/** TODO API: GET /appointments */
export async function listarCitas() {
  if (USAR_MOCK) { await esperar(); return citasMock.map((c) => ({ ...c })) }
  return request('/appointments')
}

/** TODO API: GET /appointments/:id */
export async function obtenerCita(codigo) {
  if (USAR_MOCK) { await esperar(200); return { ...buscar(codigo) } }
  return request(`/appointments/${codigo}`)
}

/**
 * Crea una cita PENDIENTE (CA-003). `modalidad`: 'PRESENCIAL' | 'VIDEOLLAMADA'.
 * TODO API: POST /appointments  (el backend valida doble reserva -> 409)
 */
export async function solicitarCita({ medicoId, fecha, bloque, modalidad }) {
  if (USAR_MOCK) {
    await esperar(400)
    if (!medicoId || !fecha || !bloque) throw new ApiError('Completa médico, fecha y horario.', 400)
    if (!libres(medicoId, fecha).includes(bloque)) throw new ApiError('Ese horario ya no está disponible. Elige otro.', 409)
    const m = MEDICOS.find((x) => x.id === medicoId)
    const nueva = {
      codigo: `C-${++contador}`, iso: fecha, hora: bloque, estado: 'PENDIENTE', futura: true,
      modalidad, medicoId, medico: m.nombre, especialidad: m.especialidad, citaOrigen: null, llamada: 'SIN_INICIAR',
    }
    citasMock = [nueva, ...citasMock]
    return { ...nueva }
  }
  return request('/appointments', { method: 'POST', body: { medicoId, fecha, bloque, modalidad } })
}

/** TODO API: PATCH /appointments/:id/status  { estado: 'CANCELADA' } */
export async function cancelarCita(codigo) {
  if (USAR_MOCK) {
    await esperar(300)
    const c = buscar(codigo)
    if (!c.futura || !ACTIVAS.includes(c.estado)) throw new ApiError('Esta cita ya no se puede cancelar.', 409)
    c.estado = 'CANCELADA'
    c.futura = false
    return { ...c }
  }
  return request(`/appointments/${codigo}/status`, { method: 'PATCH', body: { estado: 'CANCELADA' } })
}

/**
 * Reprogramar (RN-009): la original queda REPROGRAMADA y se crea una nueva PENDIENTE
 * vinculada con `citaOrigen`. TODO API: POST /appointments/:id/reschedule
 */
export async function reprogramarCita(codigo, { fecha, bloque }) {
  if (USAR_MOCK) {
    await esperar(400)
    const original = buscar(codigo)
    if (!original.futura || !ACTIVAS.includes(original.estado)) throw new ApiError('Esta cita ya no se puede reprogramar.', 409)
    if (!libres(original.medicoId, fecha).includes(bloque)) throw new ApiError('Ese horario ya no está disponible. Elige otro.', 409)
    original.estado = 'REPROGRAMADA'
    original.futura = false
    const nueva = { ...original, codigo: `C-${++contador}`, iso: fecha, hora: bloque, estado: 'PENDIENTE', futura: true, citaOrigen: original.codigo, llamada: 'SIN_INICIAR' }
    citasMock = [nueva, ...citasMock]
    return { ...nueva }
  }
  return request(`/appointments/${codigo}/reschedule`, { method: 'POST', body: { fecha, bloque } })
}

// ---------- Videollamada ----------
/**
 * Entrar (o volver a entrar) a la sala. Se puede repetir las veces que haga falta
 * hasta que la persona cuelgue. TODO API: POST /appointments/:id/call/join
 */
export async function unirseLlamada(codigo) {
  if (USAR_MOCK) {
    await esperar(150)
    const c = buscar(codigo)
    if (c.modalidad !== 'VIDEOLLAMADA' || c.estado !== 'ACEPTADA') throw new ApiError('Esta videollamada no está disponible.', 409)
    if (c.llamada === 'FINALIZADA') throw new ApiError('Esta videollamada ya finalizó.', 409)
    c.llamada = 'EN_CURSO'
    return { ...c }
  }
  return request(`/appointments/${codigo}/call/join`, { method: 'POST' })
}

/** Colgar termina la videollamada. TODO API: POST /appointments/:id/call/end */
export async function colgarLlamada(codigo) {
  if (USAR_MOCK) {
    await esperar(150)
    const c = buscar(codigo)
    c.llamada = 'FINALIZADA'
    return { ...c }
  }
  return request(`/appointments/${codigo}/call/end`, { method: 'POST' })
}
