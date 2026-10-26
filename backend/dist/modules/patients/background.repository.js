export class BackgroundRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findByPatientId(pacienteId) {
        return Promise.all([
            this.db.antecedentesGenerales.findUnique({ where: { pacienteId } }),
            this.db.antecedentesGineco.findUnique({ where: { pacienteId } }),
        ]);
    }
    upsertGeneral(data) {
        const { pacienteId, ...values } = data;
        return this.db.antecedentesGenerales.upsert({
            where: { pacienteId },
            create: data,
            update: values,
        });
    }
    upsertGineco(data) {
        const { pacienteId, ...values } = data;
        return this.db.antecedentesGineco.upsert({
            where: { pacienteId },
            create: data,
            update: values,
        });
    }
}
//# sourceMappingURL=background.repository.js.map