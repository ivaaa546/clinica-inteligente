export type Rol = 'PACIENTE' | 'MEDICO' | 'ADMINISTRADOR'

/** Usuario con sesión iniciada (lo devuelve /auth/login y /auth/me) */
export interface SessionUser {
  id: string
  nombre: string
  correo: string
  rol: Rol
}

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous' | 'error'

/** Forma del contexto de `auth/AuthProvider.jsx` (que es JavaScript) */
export interface AuthValue {
  user: SessionUser | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<SessionUser>
  logout: () => Promise<void>
  refreshSession: (options?: { showChecking?: boolean }) => Promise<SessionUser | null>
}
