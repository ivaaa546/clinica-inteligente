import type { Rol } from '../../../types/auth'

export const ACCESS_BY_ROLE: Record<Rol, string> = {
  PACIENTE: '/login',
  MEDICO: '/acceso-personal',
  ADMINISTRADOR: '/acceso-personal',
}

export const HOME_BY_ROLE: Record<Rol, string> = {
  PACIENTE: '/paciente',
  MEDICO: '/medico/agenda',
  ADMINISTRADOR: '/admin/usuarios',
}

export function accessRouteFor(role?: string): string {
  return ACCESS_BY_ROLE[role as Rol] || '/login'
}

export function homeRouteFor(role?: string): string {
  return HOME_BY_ROLE[role as Rol] || '/'
}

export function requestedPathFor(location: { pathname: string; search: string; hash: string }): string {
  return `${location.pathname}${location.search}${location.hash}`
}

export function patientLoginDestination(role: string | undefined, requestedPath?: string): string {
  const destination = HOME_BY_ROLE[role as Rol] || '/login'
  return role === 'PACIENTE' && requestedPath?.startsWith('/paciente') ? requestedPath : destination
}

export function personalLoginDestination(role: 'MEDICO' | 'ADMINISTRADOR', requestedPath?: string): string {
  const prefix = role === 'MEDICO' ? '/medico' : '/admin'
  return requestedPath?.startsWith(prefix) ? requestedPath : HOME_BY_ROLE[role]
}
