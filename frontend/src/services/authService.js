import { ApiError, USAR_MOCK, esperar, request } from './api'

/** TODO API: POST /auth/login. La respuesta trae el rol para redirigir (PACIENTE / MEDICO / ADMINISTRADOR). */
export async function iniciarSesion({ email, password }) {
  if (USAR_MOCK) {
    await esperar(400)
    if (!email || !password) throw new ApiError('Ingresa tu correo y tu contraseña.', 400)
    return { rol: 'PACIENTE', nombre: 'Tilin Insano' }
  }
  return request('/auth/login', { method: 'POST', body: { correo: email, contrasena: password } })
}

/** Registro público: solo crea pacientes (DR-001). TODO API: POST /auth/register */
export async function registrar(datos) {
  if (USAR_MOCK) { await esperar(500); return { ok: true } }
  return request('/auth/register', {
    method: 'POST',
    body: {
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      correo: datos.email,
      contrasena: datos.password,
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

/** Siempre responde igual exista o no el correo. TODO API: POST /auth/forgot-password */
export async function recuperarPassword(email) {
  if (USAR_MOCK) { await esperar(500); return { ok: true } }
  return request('/auth/forgot-password', { method: 'POST', body: { correo: email } })
}

/** TODO API: POST /auth/logout (el backend borra la cookie de sesión) */
export async function cerrarSesion() {
  if (USAR_MOCK) { await esperar(150); return { ok: true } }
  return request('/auth/logout', { method: 'POST' })
}
