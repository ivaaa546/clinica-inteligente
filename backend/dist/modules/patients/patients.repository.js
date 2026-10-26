export class PatientsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        return this.db.paciente.findUnique({ where: { id } });
    }
    findByUserId(usuarioId) {
        return this.db.paciente.findUnique({ where: { usuarioId } });
    }
    updateProfile(id, data) {
        return this.db.paciente.update({ where: { id }, data });
    }
    create(data) {
        return this.db.paciente.create({ data });
    }
    findRecord(id) {
        return this.db.paciente.findUnique({
            where: { id },
            include: {
                antecedentesGenerales: true,
                antecedentesGineco: true,
                citas: {
                    include: { consulta: { include: { recetas: true } } },
                    orderBy: { inicio: "desc" },
                },
            },
        });
    }
}
//# sourceMappingURL=patients.repository.js.map