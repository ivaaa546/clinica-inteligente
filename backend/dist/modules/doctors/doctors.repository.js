export class DoctorsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findById(id) {
        return this.db.medico.findUnique({ where: { id } });
    }
    findByUserId(usuarioId) {
        return this.db.medico.findUnique({ where: { usuarioId } });
    }
    findPublicById(id) {
        return this.db.medico.findFirst({
            where: { id, usuario: { activo: true }, especialidad: { activa: true } },
            include: { usuario: true, especialidad: true },
        });
    }
    searchActive(especialidadId) {
        return this.db.medico.findMany({
            where: {
                usuario: { activo: true },
                especialidad: { activa: true, ...(especialidadId ? { id: especialidadId } : {}) },
            },
            include: { usuario: true, especialidad: true },
            orderBy: { creadoEn: "asc" },
        });
    }
    create(data) {
        return this.db.medico.create({ data });
    }
    updateProfile(id, data) {
        return this.db.medico.update({ where: { id }, data });
    }
}
//# sourceMappingURL=doctors.repository.js.map