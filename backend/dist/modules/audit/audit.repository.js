export class AuditRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    create(data) {
        return this.db.auditoria.create({ data });
    }
    listByActor(usuarioId, take = 100) {
        return this.db.auditoria.findMany({
            where: { usuarioId },
            orderBy: { ocurridoEn: "desc" },
            take,
        });
    }
    listByDateRange(from, to, take = 100) {
        return this.db.auditoria.findMany({
            where: { ocurridoEn: { gte: from, lte: to } },
            orderBy: { ocurridoEn: "desc" },
            take,
        });
    }
}
//# sourceMappingURL=audit.repository.js.map