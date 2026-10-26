export class ConsultationsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        return this.db.consulta.findUnique({
            where: { id },
            include: { cita: true, signosVitales: true, recetas: true },
        });
    }
    findByAppointment(citaId) {
        return this.db.consulta.findUnique({
            where: { citaId },
            include: { signosVitales: true, recetas: true },
        });
    }
    create(data) {
        return this.db.consulta.create({ data });
    }
    createVitalSigns(data) {
        return this.db.signosVitales.create({ data });
    }
}
//# sourceMappingURL=consultations.repository.js.map