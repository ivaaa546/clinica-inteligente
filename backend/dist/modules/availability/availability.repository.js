export class AvailabilityRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        return this.db.disponibilidad.findUnique({ where: { id } });
    }
    listByDoctor(medicoId, from) {
        return this.db.disponibilidad.findMany({
            where: {
                medicoId,
                activa: true,
                ...(from ? { inicio: { gte: from } } : {}),
            },
            orderBy: { inicio: "asc" },
        });
    }
    findOverlap(medicoId, inicio, fin) {
        return this.db.disponibilidad.findFirst({
            where: { medicoId, activa: true, inicio: { lt: fin }, fin: { gt: inicio } },
        });
    }
    create(data) {
        return this.db.disponibilidad.create({ data });
    }
    deactivate(id) {
        return this.db.disponibilidad.update({ where: { id }, data: { activa: false } });
    }
    countActiveAppointments(id) {
        return this.db.cita.count({
            where: {
                disponibilidadId: id,
                estado: { in: ["PENDIENTE", "ACEPTADA"] },
            },
        });
    }
}
//# sourceMappingURL=availability.repository.js.map