export class PreconsultationsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        return this.db.preconsulta.findUnique({ where: { id }, include: { cita: true } });
    }
    findByAppointment(citaId) {
        return this.db.preconsulta.findUnique({ where: { citaId } });
    }
    create(data) {
        return this.db.preconsulta.create({ data });
    }
    update(id, data) {
        return this.db.preconsulta.update({ where: { id }, data });
    }
}
//# sourceMappingURL=preconsultations.repository.js.map