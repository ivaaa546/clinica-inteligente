import { ApiError, USAR_MOCK, esperar, request } from '../shared/api/client'
import { PERFIL } from '../pages/paciente/datosEjemplo'

let perfilMock = { ...PERFIL }

/** TODO API: GET /patients/me */
export async function obtenerPerfil() {
  if (USAR_MOCK) { await esperar(200); return { ...perfilMock } }
  return request('/patients/me')
}

/** Actualiza solo datos personales; el correo no cambia. TODO API: PATCH /patients/me */
export async function actualizarPerfil(datos) {
  if (USAR_MOCK) {
    await esperar(400)
    perfilMock = { ...perfilMock, ...datos, email: perfilMock.email }
    return { ...perfilMock }
  }
  return request('/patients/me', {
    method: 'PATCH',
    body: {
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      telefono: datos.telefono,
      fecha_nacimiento: datos.nacimiento,
      sexo: datos.sexo === 'Masculino' ? 'M' : 'F',
      direccion: datos.direccion,
      ocupacion: datos.ocupacion,
      poblacion_migrante: datos.migrante === 'Sí',
      nombre_responsable: datos.responsable || null,
    },
  })
}

/** TODO API: POST /auth/change-password */
export async function cambiarPassword({ actual, nueva }) {
  if (USAR_MOCK) {
    await esperar(400)
    if (actual === nueva) throw new ApiError('La nueva contraseña debe ser distinta a la actual.', 400)
    return { ok: true }
  }
  return request('/auth/change-password', { method: 'POST', body: { actual, nueva } })
}
