import { ApiError, USAR_MOCK, esperar } from './api'
import { buscarPorCorreoMock, crearUsuarioTemporalMock, nombreEspecialidadMock } from './adminService'
import type { DatosCuenta, PerfilPersonal } from '../types/admin'
import type { SessionUser } from '../types/auth'

// La sesión (quién inició sesión) es la real: `useSesion()`. Aquí solo está el perfil de "Mi cuenta".

const aPerfil = (u: ReturnType<typeof crearUsuarioTemporalMock>): PerfilPersonal => ({
  id: u.id, nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, telefono: u.telefono, rol: u.rol,
  especialidad: u.especialidadId ? nombreEspecialidadMock(u.especialidadId) : null, numeroProfesional: u.numeroProfesional,
})

/**
 * Datos de la cuenta con sesión iniciada (médico o administrador).
 * Mock: se busca por correo en los datos de ejemplo; si no está, se arma con lo que trae la sesión.
 * TODO API: GET /auth/me (+ GET /doctors/me para especialidad y N.º profesional)
 */
export async function obtenerPerfilPersonal(sesion: SessionUser): Promise<PerfilPersonal> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(200)
  return aPerfil(buscarPorCorreoMock(sesion.correo) ?? crearUsuarioTemporalMock(sesion))
}

/** Solo nombre, apellidos y teléfono; el correo no cambia. TODO API: PATCH /users/:id (o PATCH /doctors/me) */
export async function actualizarPerfilPersonal(sesion: SessionUser, datos: Omit<DatosCuenta, 'correo'>): Promise<PerfilPersonal> {
  if (!USAR_MOCK) throw new ApiError('Pendiente de conectar con la API.', 501)
  await esperar(300)
  if (!datos.nombre.trim() || !datos.apellidos.trim() || !datos.telefono.trim()) {
    throw new ApiError('Nombre, apellidos y teléfono son obligatorios.', 400)
  }
  const u = buscarPorCorreoMock(sesion.correo) ?? crearUsuarioTemporalMock(sesion)
  Object.assign(u, { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), telefono: datos.telefono.trim() })
  return aPerfil(u)
}
