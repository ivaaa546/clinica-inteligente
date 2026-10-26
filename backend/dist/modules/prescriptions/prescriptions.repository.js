export class PrescriptionsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        return this.db.receta.findUnique({ where: { id } });
    }
    listByConsultation(consultaId) {
        return this.db.receta.findMany({ where: { consultaId }, orderBy: { creadoEn: "asc" } });
    }
    create(data) {
        return this.db.receta.create({ data });
    }
    listForPatient(pacienteId) {
        return this.db.receta.findMany({
            where: { consulta: { cita: { pacienteId } } },
            select: {
                id: true,
                medicamento: true,
                dosis: true,
                via: true,
                frecuencia: true,
                duracion: true,
                indicaciones: true,
                consulta: { select: { diagnostico: true } },
            },
            orderBy: { creadoEn: "desc" },
        });
    }
}
//# sourceMappingURL=prescriptions.repository.js.map