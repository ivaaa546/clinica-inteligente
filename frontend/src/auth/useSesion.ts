import { useAuth } from './useAuth.js'
import type { AuthValue } from '../types/auth'

/** `useAuth` con tipos, para las pantallas en TypeScript (el contexto original es JavaScript). */
export const useSesion = (): AuthValue => useAuth() as unknown as AuthValue
