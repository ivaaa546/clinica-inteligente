import { apiClient } from '../../../shared/api/client.ts'

const SEX_BY_LABEL = {
  Masculino: 'M',
  Femenino: 'F',
  'No especificado': 'NO_ESPECIFICADO',
  M: 'M',
  F: 'F',
  NO_ESPECIFICADO: 'NO_ESPECIFICADO',
}

function toBoolean(value) {
  return value === true || value === 'Sí' || value === 'Si' || value === 'true'
}

/** Adapta los nombres del formulario de registro al contrato estricto de la API. */
export function toRegistrationPayload(values) {
  return {
    nombre: values.nombre,
    apellidos: values.apellidos,
    correo: values.correo ?? values.email,
    contrasena: values.contrasena ?? values.password,
    telefono: values.telefono,
    fechaNacimiento: values.fechaNacimiento ?? values.nacimiento,
    sexo: SEX_BY_LABEL[values.sexo],
    direccion: values.direccion,
    ocupacion: values.ocupacion,
    poblacionMigrante: toBoolean(values.poblacionMigrante ?? values.migrante),
  }
}

export function registerPatient(values) {
  return apiClient('/auth/register', {
    method: 'POST',
    body: toRegistrationPayload(values),
  })
}

export function login({ correo, contrasena, email, password }) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: {
      correo: correo ?? email,
      contrasena: contrasena ?? password,
    },
  })
}

export function logout() {
  return apiClient('/auth/logout', { method: 'POST' })
}

export function getCurrentSession() {
  return apiClient('/auth/me')
}
