export class SpecialtiesRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    listActive() {
        return this.db.especialidad.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } });
    }
    findById(id) {
        return this.db.especialidad.findUnique({ where: { id } });
    }
    create(data) {
        return this.db.especialidad.create({ data });
    }
    updateName(id, nombre) {
        return this.db.especialidad.update({ where: { id }, data: { nombre } });
    }
    deactivate(id) {
        return this.db.especialidad.update({ where: { id }, data: { activa: false } });
    }
    countActiveDoctors(id) {
        return this.db.medico.count({ where: { especialidadId: id, usuario: { activo: true } } });
    }
}
//# sourceMappingURL=specialties.repository.js.map