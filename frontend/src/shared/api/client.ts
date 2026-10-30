const viteEnv = import.meta.env || {}
let unauthorizedHandler: (() => void) | undefined

// Si no hay VITE_API_URL explícita, se usa ruta relativa '/api/v1' para que el proxy
// de Vite o el túnel de Cloudflare resuelvan en el mismo dominio sin problemas de CORS ni cookies cross-site.
export const API_BASE_URL = (viteEnv.VITE_API_URL || '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  status: number | null
  code: string | null
  isNetworkError: boolean
  /** Compatibilidad con los servicios legacy mientras se migran por features. */
  estado: number | null

  constructor(message: string, options: {
    status?: number | null
    code?: string | null
    isNetworkError?: boolean
    cause?: unknown
  } | number = {}) {
    const normalized = typeof options === 'number' ? { status: options } : options
    const { status = null, code = null, isNetworkError = false, cause } = normalized
    super(message, cause ? { cause } : undefined)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.isNetworkError = isNetworkError
    this.estado = status
  }
}

export function setUnauthorizedHandler(handler: () => void): () => void {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined
    }
  }
}

function resolveUrl(path: string, baseUrl: string): string {
  return `${baseUrl}/${path.replace(/^\//, '')}`
}

function isJsonBody(body: unknown): boolean {
  return body !== undefined && body !== null && !(body instanceof FormData)
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return null

  try {
    return await response.json()
  } catch {
    throw new ApiError('La respuesta del servidor no tiene JSON válido.', {
      status: response.status,
      code: 'INVALID_RESPONSE',
    })
  }
}

type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  headers?: HeadersInit
}

async function execute(path: string, { body, headers, baseUrl, ...options }: RequestOptions & { baseUrl: string }): Promise<unknown> {
  const requestHeaders = new Headers(headers)
  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: requestHeaders,
  }

  if (isJsonBody(body)) {
    requestHeaders.set('Content-Type', 'application/json')
    requestOptions.body = JSON.stringify(body)
  } else if (body !== undefined && body !== null) {
    requestOptions.body = body as BodyInit
  }

  let response: Response
  try {
    response = await fetch(resolveUrl(path, baseUrl), requestOptions)
  } catch (error) {
    throw new ApiError('No fue posible conectar con el servidor.', {
      code: 'NETWORK_ERROR',
      isNetworkError: true,
      cause: error,
    })
  }

  const data = await readResponseBody(response) as { error?: string; message?: string; mensaje?: string; code?: string } | null

  if (!response.ok) {
    if (response.status === 401) unauthorizedHandler?.()

    throw new ApiError(data?.error || data?.message || data?.mensaje || 'La solicitud no pudo completarse.', {
      status: response.status,
      code: data?.code || null,
    })
  }

  return data
}

/** Ejecuta una petición a la API versionada. Las mutaciones no se reintentan. */
export function apiClient<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  return execute(path, { ...options, baseUrl: API_BASE_URL }) as Promise<T>
}

/** Compatibilidad temporal para servicios que aún no fueron migrados a features. */
export const USAR_MOCK = false
export const esperar = (ms = 300): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export async function request<T = unknown>(ruta: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const baseUrl = (viteEnv.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')
  try {
    return await execute(ruta, { ...options, baseUrl }) as T
  } catch (error) {
    if (error instanceof ApiError && error.isNetworkError) {
      throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', { status: 0, code: 'NETWORK_ERROR', cause: error })
    }
    throw error
  }
}
