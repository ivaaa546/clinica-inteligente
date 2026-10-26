const activeStates = ["PENDIENTE", "ACEPTADA"];
export class AppointmentsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        return this.db.cita.findUnique({
            where: { id },
            include: { paciente: true, medico: true, disponibilidad: true, preconsulta: true, consulta: true },
        });
    }
    findActiveByAvailability(disponibilidadId) {
        return this.db.cita.findFirst({
            where: { disponibilidadId, estado: { in: activeStates } },
        });
    }
    listByPatient(pacienteId, estado) {
        return this.db.cita.findMany({
            where: { pacienteId, ...(estado ? { estado } : {}) },
            orderBy: { inicio: "desc" },
        });
    }
    listByDoctor(medicoId, estado) {
        return this.db.cita.findMany({
            where: { medicoId, ...(estado ? { estado } : {}) },
            orderBy: { inicio: "asc" },
        });
    }
    listAll(estado) {
        return this.db.cita.findMany({
            where: estado ? { estado } : undefined,
            orderBy: { inicio: "asc" },
        });
    }
    existsDoctorPatientRelationship(medicoId, pacienteId) {
        return this.db.cita.findFirst({ where: { medicoId, pacienteId }, select: { id: true } });
    }
    create(data) {
        return this.db.cita.create({ data });
    }
    updateState(id, estado) {
        return this.db.cita.update({ where: { id }, data: { estado } });
    }
    createRescheduled(data) {
        return this.db.cita.create({ data });
    }
}
//# sourceMappingURL=appointments.repository.js.map