import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  accessRouteFor,
  homeRouteFor,
  patientLoginDestination,
  personalLoginDestination,
  requestedPathFor,
} from '../src/features/auth/guards/routePolicy.ts'

describe('guardias de autenticación', () => {
  it('envía una ruta protegida sin sesión al acceso correspondiente y conserva el destino', () => {
    const location = { pathname: '/paciente/citas', search: '?estado=proxima', hash: '#lista' }

    assert.equal(accessRouteFor('PACIENTE'), '/login')
    assert.equal(requestedPathFor(location), '/paciente/citas?estado=proxima#lista')
    assert.equal(accessRouteFor('MEDICO'), '/acceso-personal')
    assert.equal(accessRouteFor('ADMINISTRADOR'), '/acceso-personal')
  })

  it('calcula el espacio propio cuando el rol no coincide', () => {
    assert.equal(homeRouteFor('PACIENTE'), '/paciente')
    assert.equal(homeRouteFor('MEDICO'), '/medico/agenda')
    assert.equal(homeRouteFor('ADMINISTRADOR'), '/admin/usuarios')
    assert.equal(homeRouteFor('DESCONOCIDO'), '/')
  })

  it('restaura la ruta posterior al login solo dentro del espacio autorizado', () => {
    assert.equal(patientLoginDestination('PACIENTE', '/paciente/citas/123'), '/paciente/citas/123')
    assert.equal(patientLoginDestination('PACIENTE', '/admin/usuarios'), '/paciente')
    assert.equal(personalLoginDestination('MEDICO', '/medico/pacientes'), '/medico/pacientes')
    assert.equal(personalLoginDestination('ADMINISTRADOR', '/medico/agenda'), '/admin/usuarios')
  })
})
