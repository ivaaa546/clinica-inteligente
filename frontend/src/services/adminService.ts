import { ApiError, USAR_MOCK, esperar } from './api'
import { formatearFecha, hoyISO, proximoDiaHabil } from '../lib/fechas'
import { diasHabiles, esFutura, franjas, lunesDe, sumarDias, sumarMinutos } from '../lib/semana'
import { esCorreo, normalizar } from '../lib/texto'
import type { EstadoCita, Modalidad } from '../types/cita'
import type {
  CitaAdmin, DatosCuenta, EspecialidadAdmin, Hueco, Metricas, NuevoMedico, PeriodoMetricas, Usuario,
} from '../types/admin'
import type { FechaISO } from '../types/medico'

// =====================================================================
//  Base de datos falsa en memoria (solo modo mock). Con USAR_MOCK = false ya no se usa.
// =====================================================================
const usuariosMock: Usuario[] = [
  { id: 'U-001', nombre: 'Tilin', apellidos: 'Insano', correo: 'tilininsano@gmail.com', telefono: '+502 5423 4156', rol: 'PACIENTE', activo: true, especialidadId: null, numeroProfesional: null },
  { id: 'U-002', nombre: 'Elena', apellidos: 'Torres Vega', correo: 'elena.torres@gmail.com', telefono: '+502 2345 6789', rol: 'MEDICO', activo: true, especialidadId: 'E-1', numeroProfesional: 'CM-20481' },
  { id: 'U-003', nombre: 'Lucía', apellidos: 'Soto', correo: 'lucia.soto@gmail.com', telefono: '+502 3456 7890', rol: 'ADMINISTRADOR', activo: true, especialidadId: null, numeroProfesional: null },
  { id: 'U-004', nombre: 'Bruno', apellidos: 'Díaz López', correo: 'bruno.diaz@gmail.com', telefono: '+502 4567 8901', rol: 'PACIENTE', activo: false, especialidadId: null, numeroProfesional: null },
  { id: 'U-005', nombre: 'Lucía', apellidos: 'Pérez Soto', correo: 'lucia.perez@gmail.com', telefono: '+502 4120 7788', rol: 'PACIENTE', activo: true, especialidadId: null, numeroProfesional: null },
  { id: 'U-006', nombre: 'Mateo', apellidos: 'Gómez', correo: 'elisa.gomez@gmail.com', telefono: '+502 4777 1002', rol: 'PACIENTE', activo: true, especialidadId: null, numeroProfesional: null },
  { id: 'U-007', nombre: 'Pablo', apellidos: 'Ríos', correo: 'pablo.rios@gmail.com', telefono: '+502 2222 3333', rol: 'MEDICO', activo: true, especialidadId: 'E-1', numeroProfesional: 'CM-20990' },
]

const especialidadesMock = [
  { id: 'E-1', nombre: 'Medicina general', activa: true },
  { id: 'E-2', nombre: 'Pediatría', activa: true },
  { id: 'E-3', nombre: 'Ginecología', activa: true },
  { id: 'E-4', nombre: 'Cardiología', activa: false },
]

interface CitaMockAdmin {
  codigo: string
  fecha: FechaISO
  hora: string
  estado: EstadoCita
  modalidad: Modalidad
  pacienteId: string
  medicoId: string
}

// Las citas activas quedan SIEMPRE en el futuro (semana próxima) para poder probar cancelar y reprogramar
const PROXIMA_SEMANA = sumarDias(lunesDe(proximoDiaHabil()), 7)
const citasMock: CitaMockAdmin[] = [
  { codigo: 'C-1042', fecha: PROXIMA_SEMANA, hora: '10:30–11:00', estado: 'ACEPTADA', modalidad: 'PRESENCIAL', pacienteId: 'U-001', medicoId: 'U-002' },
  { codigo: 'C-1043', fecha: sumarDias(PROXIMA_SEMANA, 1), hora: '09:00–09:30', estado: 'PENDIENTE', modalidad: 'VIDEOLLAMADA', pacienteId: 'U-005', medicoId: 'U-002' },
  { codigo: 'C-1044', fecha: '2026-10-12', hora: '09:30–10:00', estado: 'CANCELADA', modalidad: 'PRESENCIAL', pacienteId: 'U-004', medicoId: 'U-007' },
  { codigo: 'C-1045', fecha: '2026-10-13', hora: '11:00–11:30', estado: 'REPROGRAMADA', modalidad: 'PRESENCIAL', pacienteId: 'U-006', medicoId: 'U-002' },
  { codigo: 'C-0986', fecha: '2026-09-17', hora: '09:00–09:30', estado: 'COMPLETADA', modalidad: 'PRESENCIAL', pacienteId: 'U-001', medicoId: 'U-002' },
  { codigo: 'C-0990', fecha: '2026-10-05', hora: '09:00–09:30', estado: 'COMPLETADA', modalidad: 'VIDEOLLAMADA', pacienteId: 'U-004', medicoId: 'U-007' },
]
let contadorCita = 2000
let contadorUsuario = 7
let contadorEspecialidad = 4

const ACTIVAS: EstadoCita[] = ['PENDIENTE', 'ACEPTADA']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const exigirMock = () => {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
}

export const nombreCompleto = (u: Pick<Usuario, 'nombre' | 'apellidos'>) => `${u.nombre} ${u.apellidos}`

const buscarUsuario = (id: string) => {
  const usuario = usuariosMock.find((u) => u.id === id)
  if (!usuario) throw new ApiError('No encontramos esta cuenta.', 404)
  return usuario
}
const nombreEspecialidad = (id: string | null) => especialidadesMock.find((e) => e.id === id)?.nombre ?? ''
const copia = (u: Usuario): Usuario => ({ ...u })

// ---------------------------------------------------------------------
//  Funciones que usa el inicio de sesión y "Mi cuenta" del personal (personalService)
// ---------------------------------------------------------------------
export const buscarPorCorreoMock = (correo: string) => usuariosMock.find((u) => normalizar(u.correo) === normalizar(correo))
export const nombreEspecialidadMock = nombreEspecialidad

/** Cuenta de la sesión real que no existe en los datos de ejemplo: se agrega para poder mostrar y editar "Mi cuenta" */
export const crearUsuarioTemporalMock = (sesion: { id: string; nombre: string; correo: string; rol: Usuario['rol'] }): Usuario => {
  const [nombre, ...resto] = sesion.nombre.trim().split(/\s+/)
  const nuevo: Usuario = {
    id: sesion.id, nombre: nombre ?? sesion.nombre, apellidos: resto.join(' '), correo: sesion.correo, telefono: '',
    rol: sesion.rol, activo: true, especialidadId: null, numeroProfesional: null,
  }
  usuariosMock.push(nuevo)
  return nuevo
}

// =====================================================================
//  Usuarios
// =====================================================================
/** Todas las cuentas. Los filtros (rol, estado, búsqueda) se aplican en pantalla. TODO API: GET /users?rol=&activo= */
export async function listarUsuarios(): Promise<Usuario[]> {
  exigirMock()
  await esperar(250)
  return usuariosMock.map(copia)
}

/** TODO API: GET /users (el backend aún no tiene "obtener por id": se filtra la lista) */
export async function obtenerUsuario(id: string): Promise<Usuario> {
  exigirMock()
  await esperar(200)
  return copia(buscarUsuario(id))
}

const validarCuenta = (datos: DatosCuenta, idActual?: string) => {
  if (!datos.nombre.trim() || !datos.apellidos.trim()) throw new ApiError('Nombre y apellidos son obligatorios.', 400)
  if (!esCorreo(datos.correo)) throw new ApiError('Escribe un correo electrónico válido.', 400)
  if (!datos.telefono.trim()) throw new ApiError('El teléfono es obligatorio.', 400)
  const repetido = usuariosMock.some((u) => u.id !== idActual && normalizar(u.correo) === normalizar(datos.correo))
  if (repetido) throw new ApiError('Ya existe una cuenta con este correo.', 409)
}

/** Solo datos de cuenta (nunca clínicos ni el rol). TODO API: PATCH /users/:id */
export async function actualizarUsuario(id: string, datos: DatosCuenta): Promise<Usuario> {
  exigirMock()
  await esperar(300)
  const usuario = buscarUsuario(id)
  validarCuenta(datos, id)
  Object.assign(usuario, {
    nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), correo: datos.correo.trim(), telefono: datos.telefono.trim(),
  })
  return copia(usuario)
}

/**
 * Activa o desactiva una cuenta; el historial siempre se conserva.
 * ⚠ TODO API: el backend solo tiene PATCH /users/:id/deactivate (falta "activar").
 */
export async function cambiarEstadoUsuario(id: string, activo: boolean, actorCorreo: string): Promise<Usuario> {
  exigirMock()
  await esperar(250)
  const usuario = buscarUsuario(id)
  if (!activo) {
    if (normalizar(usuario.correo) === normalizar(actorCorreo)) throw new ApiError('No puedes desactivar tu propia cuenta.', 409)
    const otrosAdmins = usuariosMock.filter((u) => u.rol === 'ADMINISTRADOR' && u.activo && u.id !== id)
    if (usuario.rol === 'ADMINISTRADOR' && otrosAdmins.length === 0) throw new ApiError('Debe quedar al menos un administrador activo.', 409)
  }
  usuario.activo = activo
  return copia(usuario)
}

/** Envía el enlace de recuperación al correo de la cuenta. TODO API: POST /auth/forgot-password { correo } */
export async function enviarRecuperacion(id: string): Promise<string> {
  exigirMock()
  await esperar(300)
  const usuario = buscarUsuario(id)
  if (!usuario.activo) throw new ApiError('La cuenta está inactiva: actívala antes de enviar la recuperación.', 409)
  return usuario.correo
}

/** Alta manual de un médico (no se envía invitación por correo). TODO API: POST /users/doctors */
export async function crearMedico(datos: NuevoMedico): Promise<Usuario> {
  exigirMock()
  await esperar(400)
  validarCuenta(datos)
  if (datos.contrasena.length < 8) throw new ApiError('La contraseña inicial debe tener al menos 8 caracteres.', 400)
  if (datos.contrasena !== datos.confirmar) throw new ApiError('La contraseña y su confirmación no coinciden.', 400)
  if (!datos.numeroProfesional.trim()) throw new ApiError('El número profesional es obligatorio.', 400)
  if (usuariosMock.some((u) => u.numeroProfesional && normalizar(u.numeroProfesional) === normalizar(datos.numeroProfesional))) {
    throw new ApiError('Ya existe un médico con este número profesional.', 409)
  }
  const especialidad = especialidadesMock.find((e) => e.id === datos.especialidadId)
  if (!especialidad || !especialidad.activa) throw new ApiError('Elige una especialidad activa.', 400)

  const nuevo: Usuario = {
    id: `U-${String(++contadorUsuario).padStart(3, '0')}`, nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(),
    correo: datos.correo.trim(), telefono: datos.telefono.trim(), rol: 'MEDICO', activo: true,
    especialidadId: especialidad.id, numeroProfesional: datos.numeroProfesional.trim(),
  }
  usuariosMock.push(nuevo)
  return copia(nuevo)
}

// =====================================================================
//  Especialidades
// =====================================================================
const paraAdmin = (e: { id: string; nombre: string; activa: boolean }): EspecialidadAdmin => {
  const medicos = usuariosMock.filter((u) => u.rol === 'MEDICO' && u.activo && u.especialidadId === e.id).map(nombreCompleto)
  return { ...e, medicosActivos: medicos.length, medicos }
}

/** Catálogo completo con cuántos médicos activos usan cada una. TODO API: GET /specialties (hoy solo lista las activas) */
export async function listarEspecialidades(): Promise<EspecialidadAdmin[]> {
  exigirMock()
  await esperar(250)
  return especialidadesMock.map(paraAdmin)
}

const validarNombreEspecialidad = (nombre: string, idActual?: string) => {
  if (!nombre.trim()) throw new ApiError('El nombre de la especialidad es obligatorio.', 400)
  if (especialidadesMock.some((e) => e.id !== idActual && normalizar(e.nombre) === normalizar(nombre))) {
    throw new ApiError('Ya existe una especialidad con ese nombre.', 409)
  }
}

/** TODO API: POST /specialties { nombre } */
export async function crearEspecialidad(nombre: string, activa = true): Promise<EspecialidadAdmin> {
  exigirMock()
  await esperar(300)
  validarNombreEspecialidad(nombre)
  const nueva = { id: `E-${++contadorEspecialidad}`, nombre: nombre.trim(), activa }
  especialidadesMock.push(nueva)
  return paraAdmin(nueva)
}

/**
 * Cambia nombre y/o estado. TODO API: PATCH /specialties/:id (nombre) y PATCH /specialties/:id/deactivate.
 * ⚠ El backend rechaza desactivar una especialidad con médicos activos y no tiene "activar"; el Figma sí lo permite.
 */
export async function actualizarEspecialidad(id: string, cambios: { nombre: string; activa: boolean }): Promise<EspecialidadAdmin> {
  exigirMock()
  await esperar(300)
  const especialidad = especialidadesMock.find((e) => e.id === id)
  if (!especialidad) throw new ApiError('No encontramos esta especialidad.', 404)
  validarNombreEspecialidad(cambios.nombre, id)
  especialidad.nombre = cambios.nombre.trim()
  especialidad.activa = cambios.activa
  return paraAdmin(especialidad)
}

/** Solo si ningún médico la usa. ⚠ TODO API: el backend no tiene eliminar especialidades. */
export async function eliminarEspecialidad(id: string): Promise<void> {
  exigirMock()
  await esperar(250)
  const especialidad = especialidadesMock.find((e) => e.id === id)
  if (!especialidad) throw new ApiError('No encontramos esta especialidad.', 404)
  if (usuariosMock.some((u) => u.rol === 'MEDICO' && u.especialidadId === id)) {
    throw new ApiError('No se puede eliminar una especialidad en uso: desactívala como alternativa.', 409)
  }
  especialidadesMock.splice(especialidadesMock.indexOf(especialidad), 1)
}

// =====================================================================
//  Citas (el administrador solo cancela o reprograma citas futuras)
// =====================================================================
const paraCitaAdmin = (c: CitaMockAdmin): CitaAdmin => {
  const paciente = buscarUsuario(c.pacienteId)
  const medico = buscarUsuario(c.medicoId)
  return {
    codigo: c.codigo, fecha: c.fecha, hora: c.hora, estado: c.estado, modalidad: c.modalidad,
    paciente: nombreCompleto(paciente), medico: nombreCompleto(medico), especialidad: nombreEspecialidad(medico.especialidadId),
    futura: esFutura(c.fecha, c.hora),
  }
}

const buscarCita = (codigo: string) => {
  const cita = citasMock.find((c) => c.codigo === codigo)
  if (!cita) throw new ApiError('No encontramos esta cita.', 404)
  return cita
}

const exigirModificable = (cita: CitaMockAdmin) => {
  if (!ACTIVAS.includes(cita.estado)) throw new ApiError(`La cita ya está ${cita.estado.toLowerCase()}.`, 409)
  if (!esFutura(cita.fecha, cita.hora)) throw new ApiError('La cita ya inició o pasó: no se puede modificar.', 409)
}

/** Más recientes primero. TODO API: GET /admin/appointments */
export async function listarCitasAdmin(): Promise<CitaAdmin[]> {
  exigirMock()
  await esperar(250)
  return [...citasMock]
    .sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`))
    .map(paraCitaAdmin)
}

/** TODO API: PATCH /admin/appointments/:id/cancel */
export async function cancelarCitaAdmin(codigo: string): Promise<CitaAdmin> {
  exigirMock()
  await esperar(300)
  const cita = buscarCita(codigo)
  exigirModificable(cita)
  cita.estado = 'CANCELADA'
  return paraCitaAdmin(cita)
}

/** Horarios futuros libres del médico de la cita (próximos 10 días hábiles, de 09:00 a 12:00). TODO API: GET /availability/doctor/:medicoId */
export async function listarHuecosCita(codigo: string): Promise<Hueco[]> {
  exigirMock()
  await esperar(200)
  const cita = buscarCita(codigo)
  const base = lunesDe(hoyISO())
  const dias = [...diasHabiles(base), ...diasHabiles(sumarDias(base, 7))]
  const huecos: Hueco[] = []
  for (const fecha of dias) {
    for (const inicio of franjas('09:00', '12:00')) {
      const fin = sumarMinutos(inicio, 30)
      const ocupado = citasMock.some((c) => c.medicoId === cita.medicoId && c.fecha === fecha && c.hora.startsWith(inicio) && ACTIVAS.includes(c.estado))
      if (!ocupado && esFutura(fecha, `${inicio}–${fin}`)) huecos.push({ fecha, inicio, fin })
    }
  }
  return huecos
}

/** La original pasa a REPROGRAMADA y se crea una nueva PENDIENTE. TODO API: PATCH /admin/appointments/:id/reschedule { nuevaDisponibilidadId } */
export async function reprogramarCitaAdmin(codigo: string, fecha: FechaISO, inicio: string): Promise<CitaAdmin> {
  exigirMock()
  await esperar(300)
  const original = buscarCita(codigo)
  exigirModificable(original)
  const hueco = (await listarHuecosCita(codigo)).find((h) => h.fecha === fecha && h.inicio === inicio)
  if (!hueco) throw new ApiError('El horario elegido ya no está disponible.', 409)

  original.estado = 'REPROGRAMADA'
  const nueva: CitaMockAdmin = {
    codigo: `C-${++contadorCita}`, fecha, hora: `${inicio}–${hueco.fin}`, estado: 'PENDIENTE', modalidad: original.modalidad,
    pacienteId: original.pacienteId, medicoId: original.medicoId,
  }
  citasMock.push(nueva)
  return paraCitaAdmin(nueva)
}

// =====================================================================
//  Métricas (datos agregados: sin nombres de pacientes, diagnósticos ni recetas)
// =====================================================================
const mesDe = (iso: FechaISO) => iso.slice(0, 7)
const mesAnterior = (iso: FechaISO) => {
  const [anio, mes] = iso.split('-').map(Number)
  return mes === 1 ? `${anio - 1}-12` : `${anio}-${String(mes - 1).padStart(2, '0')}`
}

/** "septiembre–octubre de 2026" / "octubre de 2026" según las fechas incluidas */
const rangoTexto = (fechas: FechaISO[]): string => {
  if (fechas.length === 0) return 'Sin registros en el período'
  const ordenadas = [...fechas].sort()
  const [a, b] = [ordenadas[0], ordenadas[ordenadas.length - 1]]
  const mes = (iso: FechaISO) => MESES[Number(iso.slice(5, 7)) - 1]
  if (mesDe(a) === mesDe(b)) return `${mes(a)} de ${a.slice(0, 4)}`
  return a.slice(0, 4) === b.slice(0, 4) ? `${mes(a)}–${mes(b)} de ${a.slice(0, 4)}` : `${mes(a)} de ${a.slice(0, 4)}–${mes(b)} de ${b.slice(0, 4)}`
}

/**
 * Resumen operativo. ⚠ TODO API: GET /admin/metrics hoy no recibe período (pedir filtro `desde` / `hasta`).
 */
export async function obtenerMetricas(periodo: PeriodoMetricas): Promise<Metricas> {
  exigirMock()
  await esperar(300)
  const hoy = hoyISO()
  const incluida = (fecha: FechaISO) =>
    periodo === 'TODO' || (periodo === 'MES_ACTUAL' && mesDe(fecha) === mesDe(hoy)) || (periodo === 'MES_ANTERIOR' && mesDe(fecha) === mesAnterior(hoy))
  const citas = citasMock.filter((c) => incluida(c.fecha))
  const porEstado: Record<EstadoCita, number> = { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0, CANCELADA: 0, REPROGRAMADA: 0, COMPLETADA: 0 }
  for (const c of citas) porEstado[c.estado] += 1

  return {
    totalPacientes: usuariosMock.filter((u) => u.rol === 'PACIENTE').length,
    totalMedicos: usuariosMock.filter((u) => u.rol === 'MEDICO').length,
    consultasCompletadas: porEstado.COMPLETADA,
    citasPorEstado: porEstado,
    totalCitas: citas.length,
    rango: rangoTexto(citas.map((c) => c.fecha)),
  }
}

/** Texto corto de una fecha de cita para las tablas ("19 oct 2026") */
export const fechaCita = (iso: FechaISO) => formatearFecha(iso)
