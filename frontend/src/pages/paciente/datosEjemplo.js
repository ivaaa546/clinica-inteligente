// TODO: todo esto es SOLO para maquetar. Se reemplaza por datos reales de la API.
export const PACIENTE = {
  id: 'P-0024',
  nombre: 'Tilin Insano',
  email: 'correo@ejemplo.com',
  telefono: '+502 0000 0000',
  edad: '34 años',
  peso: '—',
  altura: '—',
}

const DRA_TORRES = {
  nombre: 'Dra. Elena Torres',
  especialidad: 'Medicina general',
  colegiado: '0000000',
  direccion: 'Dirección de la clínica, ciudad',
  horario: 'De lunes a viernes, de 08:00 a 16:00',
}

const receta = (id) => ({
  id, estado: 'Emitida', medicamento: 'Medicamento A', dosis: '1 unidad', via: 'Oral',
  frecuencia: 'Cada 24 horas', duracion: '3 días', indicaciones: 'Seguir la pauta indicada por el médico',
})

export const CONSULTAS = [
  {
    id: 'CO-1042', cita: 'C-1042', fecha: '19 oct 2026', hora: '10:30–11:00', estado: 'Completada',
    medico: DRA_TORRES, diagnostico: 'Cefalea tensional recurrente', receta: receta('R-1042'),
  },
  {
    id: 'CO-0938', cita: 'C-0938', fecha: '17 sep 2026', hora: '09:00–09:30', estado: 'Completada',
    medico: DRA_TORRES, diagnostico: 'Revisión general', receta: receta('R-0938'),
  },
]