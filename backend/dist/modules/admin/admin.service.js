import { RolUsuario } from "@prisma/client";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { AppointmentsService } from "../appointments/appointments.service.js";
import { MetricsRepository } from "./metrics.repository.js";
export class AdminService {
    db;
    constructor(db) {
        this.db = db;
    }
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
    listAppointments(estado) {
        // El listado administrativo contiene agenda y estado, nunca datos clinicos.
        return new AppointmentsRepository(this.db).listAll(estado);
    }
    cancelAppointment(adminUserId, appointmentId) {
        return new AppointmentsService(this.db).cancel({ userId: adminUserId, role: RolUsuario.ADMINISTRADOR }, appointmentId);
    }
    rescheduleAppointment(adminUserId, appointmentId, newAvailabilityId) {
        return new AppointmentsService(this.db).reschedule({ userId: adminUserId, role: RolUsuario.ADMINISTRADOR }, appointmentId, newAvailabilityId);
    }
}
//# sourceMappingURL=admin.service.js.map