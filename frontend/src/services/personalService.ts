import { ApiError } from '../shared/api/client'
import { getUser, updateUser } from '../api/users'
import type { DatosCuenta, PerfilPersonal } from '../shared/types/admin'
import type { SessionUser } from '../shared/types/auth'

// La sesión es real; este servicio solo adapta el perfil administrativo de la cuenta.
type ApiPersonalUser = {
  id: string
  nombre: string
  apellidos?: string
  correo: string
  telefono?: string
  rol: SessionUser['rol']
  especialidad?: { nombre: string } | null
  especialidadId?: string | null
  numeroProfesional?: string | null
}

const aPerfil = (u: ApiPersonalUser): PerfilPersonal => ({
  id: u.id,
  nombre: u.nombre,
  apellidos: u.apellidos ?? '',
  correo: u.correo,
  telefono: u.telefono ?? '',
  rol: u.rol,
  especialidad: u.especialidad?.nombre ?? null,
  numeroProfesional: u.numeroProfesional ?? null,
})

export async function obtenerPerfilPersonal(sesion: SessionUser): Promise<PerfilPersonal> {
  try {
    return aPerfil(await getUser(sesion.id) as ApiPersonalUser)
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

export async function actualizarPerfilPersonal(sesion: SessionUser, datos: Omit<DatosCuenta, 'correo'>): Promise<PerfilPersonal> {
  if (!datos.nombre.trim() || !datos.apellidos.trim() || !datos.telefono.trim()) {
    throw new ApiError('Nombre, apellidos y teléfono son obligatorios.', 400)
  }
  return aPerfil(await updateUser(sesion.id, {
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    telefono: datos.telefono.trim(),
  }) as ApiPersonalUser)
}
