import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { login, registerPatient } from '../src/api/auth.js'
import { acceptAppointment, requestAppointment, rescheduleAppointment } from '../src/api/appointments.js'
import { listOwnAvailability, publishAvailability, removeAvailability, updateAvailability } from '../src/api/availability.js'
import { getOwnDoctor } from '../src/api/doctors.js'
import { createConsultation, getConsultation } from '../src/api/consultations.js'
import { getPatientRecord, updateBackground } from '../src/api/patients.js'
import { requestVideoAccess } from '../src/api/videoCalls.js'
import { toMedicalAgendaAppointment, toMedicalAvailabilityBlock, uniqueLinkedPatients } from '../src/adapters/medical.ts'
import { ApiError, apiClient } from '../src/api/client.js'

const originalFetch = globalThis.fetch

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('cliente HTTP', () => {
  it('envía JSON, cookies de sesión y devuelve respuestas JSON', async () => {
    let request
    globalThis.fetch = async (url, options) => {
      request = { url, options }
      return jsonResponse({ ok: true })
    }

    const result = await apiClient('/example', { method: 'POST', body: { value: 1 } })

    assert.deepEqual(result, { ok: true })
    assert.equal(request.url, 'http://localhost:3000/api/v1/example')
    assert.equal(request.options.credentials, 'include')
    assert.equal(request.options.headers.get('Content-Type'), 'application/json')
    assert.deepEqual(JSON.parse(request.options.body), { value: 1 })
  })

  it('procesa 204 y JSON null sin intentar inventar datos', async () => {
    globalThis.fetch = async (_url, options) => options.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : jsonResponse(null)

    assert.equal(await apiClient('/empty', { method: 'DELETE' }), null)
    assert.equal(await apiClient('/null'), null)
  })

  it('conserva status y code de errores HTTP', async () => {
    globalThis.fetch = async () => jsonResponse({ error: 'Datos inválidos', code: 'VALIDATION_ERROR' }, 400)

    await assert.rejects(
      apiClient('/invalid'),
      (error) => error instanceof ApiError
        && error.status === 400
        && error.code === 'VALIDATION_ERROR'
        && !error.isNetworkError,
    )
  })

  it('distingue fallos de red y no reintenta mutaciones', async () => {
    let calls = 0
    globalThis.fetch = async () => {
      calls += 1
      throw new Error('offline')
    }

    await assert.rejects(
      apiClient('/appointments', { method: 'POST', body: { value: 1 } }),
      (error) => error instanceof ApiError && error.isNetworkError && error.code === 'NETWORK_ERROR',
    )
    assert.equal(calls, 1)
  })
})

describe('adaptadores', () => {
  it('mapea el registro visual al contrato estricto y no envía campos visuales', async () => {
    let body
    globalThis.fetch = async (_url, options) => {
      body = JSON.parse(options.body)
      return jsonResponse({ id: 'patient-id' }, 201)
    }

    await registerPatient({
      email: 'patient@example.test',
      password: 'password-123',
      confirmar: 'password-123',
      nombre: 'Paciente',
      apellidos: 'Prueba',
      telefono: '5555',
      nacimiento: '1990-01-01',
      sexo: 'Femenino',
      migrante: 'Sí',
      direccion: 'Dirección',
      ocupacion: 'Ocupación',
      responsable: 'No enviar',
      recordar: true,
    })

    assert.deepEqual(body, {
      nombre: 'Paciente',
      apellidos: 'Prueba',
      correo: 'patient@example.test',
      contrasena: 'password-123',
      telefono: '5555',
      fechaNacimiento: '1990-01-01',
      sexo: 'F',
      direccion: 'Dirección',
      ocupacion: 'Ocupación',
      poblacionMigrante: true,
    })
  })

  it('envía credenciales reales al login y conserva UUID de citas', async () => {
    const requests = []
    globalThis.fetch = async (url, options) => {
      requests.push({ url, options })
      return jsonResponse({ id: 'appointment-id', estado: 'PENDIENTE' }, 201)
    }

    await login({ email: 'patient@example.test', password: 'password-123' })
    await requestAppointment({ medicoId: 'doctor-uuid', disponibilidadId: 'availability-uuid', modalidad: 'PRESENCIAL' })
    await rescheduleAppointment('appointment-uuid', 'new-availability-uuid', 'PRESENCIAL')

    assert.deepEqual(JSON.parse(requests[0].options.body), {
      correo: 'patient@example.test',
      contrasena: 'password-123',
    })
    assert.equal(requests[1].url, 'http://localhost:3000/api/v1/appointments')
    assert.deepEqual(JSON.parse(requests[1].options.body), {
      medicoId: 'doctor-uuid',
      disponibilidadId: 'availability-uuid',
      modalidad: 'PRESENCIAL',
    })
    assert.equal(requests[2].url, 'http://localhost:3000/api/v1/appointments/appointment-uuid/reschedule')
    assert.deepEqual(JSON.parse(requests[2].options.body), {
      nuevaDisponibilidadId: 'new-availability-uuid',
      modalidad: 'PRESENCIAL',
    })
  })

  it('usa los contratos autenticados de agenda médica', async () => {
    const requests = []
    globalThis.fetch = async (url, options = {}) => {
      requests.push({ url, options })
      return jsonResponse({ id: 'resource-id' })
    }

    await getOwnDoctor()
    await listOwnAvailability()
    await publishAvailability({ inicio: '2026-11-02T15:00:00.000Z', modalidades: ['PRESENCIAL'] })
    await updateAvailability('availability-uuid', { modalidades: ['VIRTUAL'] })
    await acceptAppointment('appointment-uuid')
    await removeAvailability('availability-uuid')
    await createConsultation({
      citaId: 'appointment-uuid',
      tipoFicha: 'ADULTO',
      motivoConsulta: 'Control',
      diagnostico: 'Diagnóstico',
      recetas: [],
    })
    await requestVideoAccess('appointment-uuid')

    assert.equal(requests[0].url, 'http://localhost:3000/api/v1/doctors/me')
    assert.equal(requests[1].url, 'http://localhost:3000/api/v1/availability/me')
    assert.deepEqual(JSON.parse(requests[2].options.body), {
      inicio: '2026-11-02T15:00:00.000Z',
      modalidades: ['PRESENCIAL'],
    })
    assert.equal(requests[3].url, 'http://localhost:3000/api/v1/availability/availability-uuid')
    assert.equal(requests[3].options.method, 'PATCH')
    assert.deepEqual(JSON.parse(requests[3].options.body), { modalidades: ['VIRTUAL'] })
    assert.equal(requests[4].url, 'http://localhost:3000/api/v1/appointments/appointment-uuid/accept')
    assert.equal(requests[4].options.method, 'PATCH')
    assert.equal(requests[5].url, 'http://localhost:3000/api/v1/availability/availability-uuid')
    assert.equal(requests[5].options.method, 'DELETE')
    assert.equal(requests[6].url, 'http://localhost:3000/api/v1/consultations')
    assert.equal(requests[6].options.method, 'POST')
    assert.deepEqual(JSON.parse(requests[6].options.body).recetas, [])
    assert.equal(requests[7].url, 'http://localhost:3000/api/v1/video-calls/appointments/appointment-uuid/access')
    assert.equal(requests[7].options.method, 'POST')
  })

  it('conecta expediente autorizado, antecedentes y consulta clínica', async () => {
    const requests = []
    globalThis.fetch = async (url, options = {}) => {
      requests.push({ url, options })
      return jsonResponse({ id: 'test-id', ok: true })
    }

    await getPatientRecord('patient-uuid')
    await updateBackground('patient-uuid', {
      antecedentesGenerales: { alergias: 'Penicilina', medicos: 'Hipertensión' },
      antecedentesGineco: { gestas: 2, partos: 2, cesareas: 0, abortos: 0, hijosVivos: 2 },
    })
    await getConsultation('consultation-uuid')

    assert.equal(requests[0].url, 'http://localhost:3000/api/v1/patients/patient-uuid/record')
    assert.equal(requests[1].url, 'http://localhost:3000/api/v1/patients/patient-uuid/background')
    assert.equal(requests[1].options.method, 'PATCH')
    assert.deepEqual(JSON.parse(requests[1].options.body), {
      antecedentesGenerales: { alergias: 'Penicilina', medicos: 'Hipertensión' },
      antecedentesGineco: { gestas: 2, partos: 2, cesareas: 0, abortos: 0, hijosVivos: 2 },
    })
    assert.equal(requests[2].url, 'http://localhost:3000/api/v1/consultations/consultation-uuid')
  })

  it('adapta citas y bloques médicos a la zona horaria clínica y calcula esFutura', () => {
    const appointment = {
      id: 'apt-1',
      disponibilidadId: 'avail-1',
      inicio: '2026-11-02T15:00:00.000Z',
      fin: '2026-11-02T15:30:00.000Z',
      estado: 'ACEPTADA',
      modalidad: 'PRESENCIAL',
      paciente: { id: 'pat-1', nombre: 'Ana', apellidos: 'López', telefono: '12345678' },
      consultaId: null,
    }

    const adaptedFuture = toMedicalAgendaAppointment(appointment, new Date('2026-11-01T00:00:00.000Z').getTime())
    assert.equal(adaptedFuture.id, 'apt-1')
    assert.equal(adaptedFuture.fecha, '2026-11-02')
    assert.equal(adaptedFuture.inicio, '9:00 a. m.')
    assert.equal(adaptedFuture.fin, '9:30 a. m.')
    assert.equal(adaptedFuture.esFutura, true)
    assert.equal(adaptedFuture.modalidad, 'PRESENCIAL')

    const adaptedPast = toMedicalAgendaAppointment(appointment, new Date('2026-11-03T00:00:00.000Z').getTime())
    assert.equal(adaptedPast.esFutura, false)

    const inactiveBlock = {
      id: 'blk-1',
      inicio: '2026-11-02T15:00:00.000Z',
      fin: '2026-11-02T15:30:00.000Z',
      activa: false,
      modalidades: ['PRESENCIAL'],
    }
    assert.equal(toMedicalAvailabilityBlock(inactiveBlock), null)

    const activeBlock = {
      id: 'blk-2',
      inicio: '2026-11-02T15:00:00.000Z',
      fin: '2026-11-02T15:30:00.000Z',
      activa: true,
      modalidades: ['PRESENCIAL', 'VIRTUAL'],
    }
    const adaptedBlock = toMedicalAvailabilityBlock(activeBlock)
    assert.notEqual(adaptedBlock, null)
    assert.equal(adaptedBlock.fecha, '2026-11-02')
    assert.equal(adaptedBlock.inicio, '9:00 a. m.')
    assert.equal(adaptedBlock.fin, '9:30 a. m.')
    assert.deepEqual(adaptedBlock.modalidades, ['PRESENCIAL', 'VIRTUAL'])
  })

  it('deduplica pacientes vinculados a partir de citas sin inventar catálogo', () => {
    const appointments = [
      {
        id: 'apt-1',
        disponibilidadId: 'avail-1',
        inicio: '2026-11-02T15:00:00.000Z',
        fin: '2026-11-02T15:30:00.000Z',
        estado: 'ACEPTADA',
        modalidad: 'PRESENCIAL',
        paciente: { id: 'pat-1', nombre: 'Ana', apellidos: 'López', telefono: '1111' },
        consultaId: null,
      },
      {
        id: 'apt-2',
        disponibilidadId: 'avail-2',
        inicio: '2026-11-03T15:00:00.000Z',
        fin: '2026-11-03T15:30:00.000Z',
        estado: 'PENDIENTE',
        modalidad: 'VIRTUAL',
        paciente: { id: 'pat-1', nombre: 'Ana', apellidos: 'López', telefono: '1111' },
        consultaId: null,
      },
      {
        id: 'apt-3',
        disponibilidadId: 'avail-3',
        inicio: '2026-11-04T15:00:00.000Z',
        fin: '2026-11-04T15:30:00.000Z',
        estado: 'COMPLETADA',
        modalidad: 'PRESENCIAL',
        paciente: { id: 'pat-2', nombre: 'Carlos', apellidos: 'Pérez', telefono: '2222' },
        consultaId: 'cons-1',
      },
    ]

    const unique = uniqueLinkedPatients(appointments)
    assert.equal(unique.length, 2)
    assert.deepEqual(unique.map((p) => p.id), ['pat-1', 'pat-2'])
  })
})
