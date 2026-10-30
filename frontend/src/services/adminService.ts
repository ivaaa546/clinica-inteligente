import { ApiError } from '../shared/api/client'
import { formatearFecha } from '../shared/lib/fechas'
import { esCorreo } from '../shared/lib/texto'
import {
  listUsers as listUsersApi,
  getUser as getUserApi,
  updateUser as updateUserApi,
  deactivateUser as deactivateUserApi,
  activateUser as activateUserApi,
  createDoctor as createDoctorApi,
} from '../api/users'
import {
  listSpecialties,
  createSpecialty as createSpecialtyApi,
  updateSpecialty as updateSpecialtyApi,
  deactivateSpecialty as deactivateSpecialtyApi,
  activateSpecialty as activateSpecialtyApi,
  deleteSpecialty as deleteSpecialtyApi,
} from '../api/specialties'
import { getAdminMetrics, listAdminAppointments, cancelAdminAppointment } from '../api/admin'
import type { EstadoCita, Modalidad } from '../shared/types/cita'
import type { CitaAdmin, DatosCuenta, EspecialidadAdmin, Metricas, NuevoMedico, PeriodoMetricas, Usuario } from '../shared/types/admin'
import type { FechaISO } from '../shared/types/medico'

export const nombreCompleto = (u: Pick<Usuario, 'nombre' | 'apellidos'>) => `${u.nombre} ${u.apellidos}`.trim()

type ApiUser = {
  id: string
  nombre: string
  apellidos?: string
  correo: string
  telefono?: string
  rol: Usuario['rol']
  activo?: boolean
  especialidadId?: string | null
  numeroProfesional?: string | null
}

const toUsuario = (u: ApiUser): Usuario => ({
  id: u.id,
  nombre: u.nombre,
  apellidos: u.apellidos ?? '',
  correo: u.correo,
  telefono: u.telefono ?? '',
  rol: u.rol,
  activo: u.activo ?? true,
  especialidadId: u.especialidadId ?? null,
  numeroProfesional: u.numeroProfesional ?? null,
})

export async function listarUsuarios(): Promise<Usuario[]> {
  const lista = await listUsersApi() as ApiUser[]
  return (lista || []).map(toUsuario)
}

export async function obtenerUsuario(id: string): Promise<Usuario> {
  return toUsuario(await getUserApi(id) as ApiUser)
}

const validarCuenta = (datos: DatosCuenta) => {
  if (!datos.nombre.trim() || !datos.apellidos.trim()) throw new ApiError('Nombre y apellidos son obligatorios.', 400)
  if (!esCorreo(datos.correo)) throw new ApiError('Escribe un correo electrónico válido.', 400)
  if (!datos.telefono.trim()) throw new ApiError('El teléfono es obligatorio.', 400)
}

export async function actualizarUsuario(id: string, datos: DatosCuenta): Promise<Usuario> {
  validarCuenta(datos)
  return toUsuario(await updateUserApi(id, {
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    correo: datos.correo.trim(),
    telefono: datos.telefono.trim(),
  }) as ApiUser)
}

export async function cambiarEstadoUsuario(id: string, activo: boolean, _actorCorreo: string): Promise<Usuario> {
  void _actorCorreo
  return toUsuario(await (activo ? activateUserApi(id) : deactivateUserApi(id)) as ApiUser)
}

export async function enviarRecuperacion(id: string): Promise<string> {
  const usuario = await obtenerUsuario(id)
  if (!usuario.activo) throw new ApiError('La cuenta está inactiva: actívala antes de enviar la recuperación.', 409)
  // El backend conserva la política de privacidad y gestiona el envío; aquí solo devolvemos el correo mostrado.
  return usuario.correo
}

export async function crearMedico(datos: NuevoMedico): Promise<Usuario> {
  validarCuenta(datos)
  if (datos.contrasena.length < 8) throw new ApiError('La contraseña inicial debe tener al menos 8 caracteres.', 400)
  if (datos.contrasena !== datos.confirmar) throw new ApiError('La contraseña y su confirmación no coinciden.', 400)
  if (!datos.numeroProfesional.trim()) throw new ApiError('El número profesional es obligatorio.', 400)
  if (!datos.especialidadId) throw new ApiError('Elige una especialidad activa.', 400)

  return toUsuario(await createDoctorApi({
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    correo: datos.correo.trim(),
    contrasena: datos.contrasena,
    telefono: datos.telefono.trim(),
    numeroProfesional: datos.numeroProfesional.trim(),
    especialidadId: datos.especialidadId,
  }) as ApiUser)
}

export async function listarEspecialidades(): Promise<EspecialidadAdmin[]> {
  const lista = await listSpecialties() as Array<{
    id: string
    nombre: string
    activa?: boolean
    medicosActivos?: number
    medicos?: string[]
  }>
  return (lista || []).map((e) => ({
    id: e.id,
    nombre: e.nombre,
    activa: e.activa ?? true,
    medicosActivos: e.medicosActivos ?? 0,
    medicos: e.medicos ?? [],
  }))
}

export async function crearEspecialidad(nombre: string, activa = true): Promise<EspecialidadAdmin> {
  if (!nombre.trim()) throw new ApiError('El nombre de la especialidad es obligatorio.', 400)
  const res = await createSpecialtyApi(nombre.trim()) as { id: string; nombre: string; activa: boolean }
  if (!activa) await deactivateSpecialtyApi(res.id)
  return { id: res.id, nombre: res.nombre, activa, medicosActivos: 0, medicos: [] }
}

export async function actualizarEspecialidad(id: string, cambios: { nombre: string; activa: boolean }): Promise<EspecialidadAdmin> {
  if (!cambios.nombre.trim()) throw new ApiError('El nombre de la especialidad es obligatorio.', 400)
  const res = await updateSpecialtyApi(id, cambios.nombre.trim()) as { id: string; nombre: string; activa: boolean }
  if (cambios.activa !== res.activa) {
    if (cambios.activa) await activateSpecialtyApi(id)
    else await deactivateSpecialtyApi(id)
  }
  return { id, nombre: cambios.nombre.trim(), activa: cambios.activa, medicosActivos: 0, medicos: [] }
}

export async function eliminarEspecialidad(id: string): Promise<void> {
  await deleteSpecialtyApi(id)
}

type ApiAdminAppointment = {
  id: string
  inicio: string
  fin: string
  estado: EstadoCita
  modalidad: Modalidad
  paciente?: string
  medico?: string
  especialidad?: string
}

const toCitaAdmin = (c: ApiAdminAppointment): CitaAdmin => {
  const inicio = new Date(c.inicio)
  const fin = new Date(c.fin)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    codigo: c.id.slice(0, 8),
    fecha: c.inicio.slice(0, 10),
    hora: `${pad(inicio.getHours())}:${pad(inicio.getMinutes())}–${pad(fin.getHours())}:${pad(fin.getMinutes())}`,
    estado: c.estado,
    modalidad: c.modalidad,
    paciente: c.paciente || 'Paciente',
    medico: c.medico || 'Médico',
    especialidad: c.especialidad || 'General',
    futura: fin.getTime() > Date.now(),
  }
}

export async function listarCitasAdmin(): Promise<CitaAdmin[]> {
  const lista = await listAdminAppointments() as ApiAdminAppointment[]
  return (lista || []).map(toCitaAdmin).sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`))
}

export async function cancelarCitaAdmin(codigo: string): Promise<CitaAdmin> {
  return toCitaAdmin(await cancelAdminAppointment(codigo) as ApiAdminAppointment)
}

export async function obtenerMetricas(_periodo: PeriodoMetricas): Promise<Metricas> {
  void _periodo
  const m = await getAdminMetrics() as {
    patients: number
    doctors: number
    completedConsultations: number
    appointmentsByState?: Array<{ estado: string; _count?: { _all?: number } | number }>
  }
  const porEstado: Record<EstadoCita, number> = { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0, CANCELADA: 0, REPROGRAMADA: 0, COMPLETADA: 0 }
  let totalCitas = 0
  for (const item of m.appointmentsByState || []) {
    if (item.estado in porEstado) {
      const cantidad = (typeof item._count === 'object' ? item._count?._all : item._count) ?? 0
      porEstado[item.estado as EstadoCita] = cantidad
      totalCitas += cantidad
    }
  }
  return {
    totalPacientes: m.patients,
    totalMedicos: m.doctors,
    consultasCompletadas: m.completedConsultations,
    citasPorEstado: porEstado,
    totalCitas,
    rango: 'Total acumulado',
  }
}

export const fechaCita = (iso: FechaISO) => formatearFecha(iso)
