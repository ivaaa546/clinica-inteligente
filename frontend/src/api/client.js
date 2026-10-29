const viteEnv = import.meta.env || {}
let unauthorizedHandler

// Si no hay VITE_API_URL explícita, se usa ruta relativa '/api/v1' para que el proxy
// de Vite o el túnel de Cloudflare resuelvan en el mismo dominio sin problemas de CORS ni cookies cross-site.
export const API_BASE_URL = (viteEnv.VITE_API_URL || '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { status = null, code = null, isNetworkError = false, cause } = {}) {
    super(message, cause ? { cause } : undefined)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.isNetworkError = isNetworkError
  }
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined
    }
  }
}

function resolveUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\//, '')}`
}

function isJsonBody(body) {
  return body !== undefined && body !== null && !(body instanceof FormData)
}

async function readResponseBody(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    throw new ApiError('La respuesta del servidor no tiene JSON válido.', {
      status: response.status,
      code: 'INVALID_RESPONSE',
    })
  }
}

/**
 * Ejecuta una petición a la API versionada.
 * Las mutaciones no se reintentan para evitar operaciones duplicadas.
 */
export async function apiClient(path, { body, headers, ...options } = {}) {
  const requestHeaders = new Headers(headers)
  const requestOptions = {
    ...options,
    credentials: 'include',
    headers: requestHeaders,
  }

  if (isJsonBody(body)) {
    requestHeaders.set('Content-Type', 'application/json')
    requestOptions.body = JSON.stringify(body)
  } else if (body !== undefined && body !== null) {
    requestOptions.body = body
  }

  let response
  try {
    response = await fetch(resolveUrl(path), requestOptions)
  } catch (error) {
    throw new ApiError('No fue posible conectar con el servidor.', {
      code: 'NETWORK_ERROR',
      isNetworkError: true,
      cause: error,
    })
  }

  const data = await readResponseBody(response)

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.()
    }

    throw new ApiError(data?.error || 'La solicitud no pudo completarse.', {
      status: response.status,
      code: data?.code || null,
    })
  }

  return data
}
