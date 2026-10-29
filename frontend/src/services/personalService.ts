import { ApiError, USAR_MOCK, esperar } from './api'
import { buscarPorCorreoMock, crearUsuarioTemporalMock, nombreEspecialidadMock } from './adminService'
import { getUser, updateUser } from '../api/users'
import type { DatosCuenta, PerfilPersonal } from '../types/admin'
import type { SessionUser } from '../types/auth'

// La sesión (quién inició sesión) es la real: `useSesion()`. Aquí solo está el perfil de "Mi cuenta".

const aPerfil = (u: ReturnType<typeof crearUsuarioTemporalMock>): PerfilPersonal => ({
  id: u.id, nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, telefono: u.telefono, rol: u.rol,
  especialidad: u.especialidadId ? nombreEspecialidadMock(u.especialidadId) : null, numeroProfesional: u.numeroProfesional,
})

/**
 * Datos de la cuenta con sesión iniciada (médico o administrador).
 */
export async function obtenerPerfilPersonal(sesion: SessionUser): Promise<PerfilPersonal> {
  if (USAR_MOCK) {
    await esperar(200)
    return aPerfil(buscarPorCorreoMock(sesion.correo) ?? crearUsuarioTemporalMock(sesion))
  }
  try {
    const u = await getUser(sesion.id) as {
      id: string
      nombre: string
      apellidos?: string
      correo: string
      telefono?: string
      rol: SessionUser['rol']
      especialidadId?: string | null
      numeroProfesional?: string | null
    }
    return {
      id: u.id,
      nombre: u.nombre,
      apellidos: u.apellidos ?? '',
      correo: u.correo,
      telefono: u.telefono ?? '',
      rol: u.rol,
      especialidad: null,
      numeroProfesional: u.numeroProfesional ?? null,
    }
  } catch {
    const [nombre, ...resto] = (sesion.nombre || '').trim().split(/\s+/)
    return {
      id: sesion.id,
      nombre: nombre || sesion.nombre,
      apellidos: resto.join(' '),
      correo: sesion.correo,
      telefono: '',
      rol: sesion.rol,
      especialidad: null,
      numeroProfesional: null,
    }
  }
}

/** Solo nombre, apellidos y teléfono; el correo no cambia. */
export async function actualizarPerfilPersonal(sesion: SessionUser, datos: Omit<DatosCuenta, 'correo'>): Promise<PerfilPersonal> {
  if (USAR_MOCK) {
    await esperar(300)
    if (!datos.nombre.trim() || !datos.apellidos.trim() || !datos.telefono.trim()) {
      throw new ApiError('Nombre, apellidos y teléfono son obligatorios.', 400)
    }
    const u = buscarPorCorreoMock(sesion.correo) ?? crearUsuarioTemporalMock(sesion)
    Object.assign(u, { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), telefono: datos.telefono.trim() })
    return aPerfil(u)
  }
  if (!datos.nombre.trim() || !datos.apellidos.trim() || !datos.telefono.trim()) {
    throw new ApiError('Nombre, apellidos y teléfono son obligatorios.', 400)
  }
  const u = await updateUser(sesion.id, {
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    telefono: datos.telefono.trim(),
  }) as {
    id: string
    nombre: string
    apellidos?: string
    correo: string
    telefono?: string
    rol: SessionUser['rol']
    numeroProfesional?: string | null
  }
  return {
    id: u.id,
    nombre: u.nombre,
    apellidos: u.apellidos ?? datos.apellidos.trim(),
    correo: u.correo,
    telefono: u.telefono ?? datos.telefono.trim(),
    rol: u.rol,
    especialidad: null,
    numeroProfesional: u.numeroProfesional ?? null,
  }
}
