// TODO: todo esto es SOLO para maquetar. Con USAR_MOCK = false ya no se usa.
import firmaDraTorres from '../../assets/firma-doctor.png'

export const PACIENTE = {
  id: 'P-0024',
  nombre: 'Tilin Insano',
  email: 'correo@ejemplo.com',
  telefono: '+502 0000 0000',
  edad: '34 años', // se calcula a partir de fecha_nacimiento
}

export const PERFIL = {
  codigo: 'P-0024',
  nombre: 'Tilin', apellidos: 'Insano', email: 'correo@ejemplo.com', telefono: '+502 0000 0000',
  nacimiento: '1992-03-14', sexo: 'Masculino', direccion: 'Calle principal 12-45, zona 1',
  ocupacion: 'Ingeniero', migrante: 'No', responsable: '',
}

export const MEDICOS = [
  // `firma`: imagen de la firma del médico (⚠ el modelo de datos aún no la tiene: sería `medico.firma_url`)
  { id: 1, nombre: 'Dra. Elena Torres', iniciales: 'ET', especialidad: 'Medicina general', numeroProfesional: '0000000', firma: firmaDraTorres },
  { id: 2, nombre: 'Dr. Pablo Ríos', iniciales: 'PR', especialidad: 'Medicina general', numeroProfesional: '0000001' },
]

// Cada fila de "receta" en la base de datos es UN medicamento; una consulta puede tener varias
const receta = (id, medicamento, dosis, frecuencia, duracion) => ({
  id, medicamento, dosis, via: 'Oral', frecuencia, duracion,
  indicaciones: 'Seguir la pauta indicada por el médico',
})

export const CONSULTAS = [
  {
    id: 'CO-1042', cita: 'C-1042', fecha: '19 oct 2026', hora: '10:30–11:00', estado: 'COMPLETADA',
    medico: MEDICOS[0], diagnostico: 'Cefalea tensional recurrente',
    recetas: [
      receta('R-1042-1', 'Medicamento A', '1 unidad', 'Cada 24 horas', '3 días'),
      receta('R-1042-2', 'Medicamento B', '1 tableta', 'Cada 8 horas', '5 días'),
    ],
  },
  {
    id: 'CO-0938', cita: 'C-0938', fecha: '17 sep 2026', hora: '09:00–09:30', estado: 'COMPLETADA',
    medico: MEDICOS[0], diagnostico: 'Revisión general',
    recetas: [receta('R-0938-1', 'Medicamento A', '1 unidad', 'Cada 24 horas', '3 días')],
  },
]

// `futura`: la cita aún no llega a su fecha/hora (solo entonces se puede cancelar o reprogramar).
// `modalidad`: 'PRESENCIAL' | 'VIDEOLLAMADA'  (⚠ campo nuevo: pedir al backend que lo agregue a `cita`)
const cita = (codigo, iso, hora, estado, futura, modalidad, medicoId = 1) => {
  const m = MEDICOS.find((x) => x.id === medicoId)
  return {
    codigo, iso, hora, estado, futura, modalidad, medicoId,
    medico: m.nombre, especialidad: m.especialidad, citaOrigen: null,
    // Estado de la sala: 'SIN_INICIAR' | 'EN_CURSO' | 'FINALIZADA' (⚠ pedir al backend)
    llamada: 'SIN_INICIAR',
  }
}

export const CITAS = [
  cita('C-1042', '2026-10-19', '10:30–11:00', 'ACEPTADA', true, 'VIDEOLLAMADA'),
  cita('C-1043', '2026-10-20', '09:00–09:30', 'PENDIENTE', true, 'PRESENCIAL'),
  cita('C-0986', '2026-09-17', '09:00–09:30', 'COMPLETADA', false, 'PRESENCIAL'),
  cita('C-0950', '2026-09-02', '11:00–11:30', 'RECHAZADA', false, 'PRESENCIAL', 2),
  cita('C-0901', '2026-08-20', '10:00–10:30', 'CANCELADA', false, 'VIDEOLLAMADA'),
  cita('C-0870', '2026-08-05', '09:30–10:00', 'REPROGRAMADA', false, 'PRESENCIAL'),
]
