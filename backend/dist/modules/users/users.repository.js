export class UsersRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        return this.db.usuario.findUnique({ where: { id } });
    }
    findByEmail(correo) {
        return this.db.usuario.findUnique({ where: { correo } });
    }
    create(data) {
        return this.db.usuario.create({ data });
    }
    updateNonClinical(id, data) {
        return this.db.usuario.update({ where: { id }, data });
    }
    deactivate(id) {
        return this.db.usuario.update({ where: { id }, data: { activo: false } });
    }
    list(where) {
        return this.db.usuario.findMany({ where, orderBy: { creadoEn: "desc" } });
    }
}
//# sourceMappingURL=users.repository.js.map