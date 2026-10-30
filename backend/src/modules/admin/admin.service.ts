import { EstadoCita, PrismaClient, RolUsuario } from "@prisma/client";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { AppointmentsService } from "../appointments/appointments.service.js";
import { MetricsRepository } from "./metrics.repository.js";

export class AdminService {
  constructor(private readonly db: PrismaClient) {}

  async metrics() {
    const repository = new MetricsRepository(this.db);
    const [patients, doctors, usersByRole, appointmentsByState, completedConsultations] = await Promise.all([
      repository.countActivePatients(),
      repository.countActiveDoctors(),
      repository.countActiveUsersByRole(),
      repository.countAppointmentsByState(),
      repository.countCompletedConsultations(),
    ]);

    return { patients, doctors, usersByRole, appointmentsByState, completedConsultations };
  }

  async listAppointments(estado?: EstadoCita) {
    // El listado administrativo contiene agenda y estado, nunca datos clinicos.
    const list = await new AppointmentsRepository(this.db).listAll(estado);
    return list.map((c) => ({
      id: c.id,
      inicio: c.inicio,
      fin: c.fin,
      estado: c.estado,
      modalidad: c.modalidad,
      pacienteId: c.pacienteId,
      paciente: `${c.paciente.usuario.nombre} ${c.paciente.usuario.apellidos}`,
      medicoId: c.medicoId,
      medico: `${c.medico.usuario.nombre} ${c.medico.usuario.apellidos}`,
      especialidad: c.medico.especialidad.nombre,
    }));
  }

  cancelAppointment(adminUserId: string, appointmentId: string) {
    return new AppointmentsService(this.db).cancel(
      { userId: adminUserId, role: RolUsuario.ADMINISTRADOR },
      appointmentId,
    );
  }

  rescheduleAppointment(adminUserId: string, appointmentId: string, newAvailabilityId: string) {
    return new AppointmentsService(this.db).reschedule(
      { userId: adminUserId, role: RolUsuario.ADMINISTRADOR },
      appointmentId,
      newAvailabilityId,
    );
  }
}
