import { AuditService } from "../audit/audit.service.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { AvailabilityRepository } from "./availability.repository.js";
const blockDurationMs = 30 * 60 * 1000;
export class AvailabilityService {
    db;
    constructor(db) {
        this.db = db;
    }
    listForDoctor(medicoId, from) {
        return new AvailabilityRepository(this.db).listByDoctor(medicoId, from);
    }
    async publish(doctorUserId, inicio) {
        const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
        if (!doctor) {
            throw new Error("Perfil de medico no encontrado");
        }
        const fin = new Date(inicio.getTime() + blockDurationMs);
        if (inicio <= new Date()) {
            throw new Error("La disponibilidad debe ser futura");
        }
        const repository = new AvailabilityRepository(this.db);
        if (await repository.findOverlap(doctor.id, inicio, fin)) {
            throw new Error("La disponibilidad se solapa con otro bloque");
        }
        const availability = await repository.create({ medicoId: doctor.id, inicio, fin, activa: true });
        await new AuditService(this.db).record({
            usuarioId: doctorUserId,
            accion: "DISPONIBILIDAD_PUBLICADA",
            entidad: "Disponibilidad",
            entidadId: availability.id,
            detalle: { duracionMinutos: 30 },
        });
        return availability;
    }
    async remove(doctorUserId, id) {
        const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
        const repository = new AvailabilityRepository(this.db);
        const availability = await repository.findById(id);
        if (!doctor || !availability || availability.medicoId !== doctor.id) {
            throw new Error("Disponibilidad no encontrada");
        }
        // Un bloque con una cita activa no se elimina para conservar la agenda y su historial.
        if (await repository.countActiveAppointments(id)) {
            throw new Error("No se puede eliminar disponibilidad con citas activas");
        }
        const removed = await repository.deactivate(id);
        await new AuditService(this.db).record({
            usuarioId: doctorUserId,
            accion: "DISPONIBILIDAD_DESACTIVADA",
            entidad: "Disponibilidad",
            entidadId: id,
        });
        return removed;
    }
}
//# sourceMappingURL=availability.service.js.map