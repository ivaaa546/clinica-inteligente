// ---------------------------------------------------------------
//  Capa de conexión con el backend
//
//  USAR_MOCK = true  -> todo funciona con datos de ejemplo en memoria
//  USAR_MOCK = false -> las funciones llaman a la API real
//
//  Para cambiar la dirección del backend crea frontend/.env con:
//    VITE_API_URL=http://localhost:3000/api
// ---------------------------------------------------------------
export const USAR_MOCK = true

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(mensaje, estado = 500) {
    super(mensaje)
    this.name = 'ApiError'
    this.estado = estado
  }
}

/**
 * Petición JSON al backend.
 * La sesión va en una cookie HttpOnly (002-arquitectura.md), por eso
 * se envía `credentials: 'include'` y NO se guarda ningún token en el navegador.
 */
export async function request(ruta, { method = 'GET', body } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0)
  }

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw new ApiError(datos?.message ?? datos?.mensaje ?? 'Ocurrió un error. Intenta de nuevo.', respuesta.status)
  }
  return datos
}

/** Simula la latencia de red en modo mock */
export const esperar = (ms = 300) => new Promise((resolver) => setTimeout(resolver, ms))
