import { PrismaClient } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { SpecialtiesRepository } from "./specialties.repository.js";

export class SpecialtiesService {
  constructor(private readonly db: PrismaClient) {}

  listPublic() {
    return new SpecialtiesRepository(this.db).listActive();
  }

  async listAdmin() {
    const list = await new SpecialtiesRepository(this.db).listAll();
    return list.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      activa: e.activa,
      medicosActivos: e.medicos.length,
      medicos: e.medicos.map((m) => `${m.usuario.nombre} ${m.usuario.apellidos}`),
    }));
  }

  async create(actorId: string, nombre: string) {
    const specialty = await new SpecialtiesRepository(this.db).create({ nombre, activa: true });
    await this.audit(actorId, "ESPECIALIDAD_CREADA", specialty.id);
    return specialty;
  }

  async updateName(actorId: string, id: string, nombre: string) {
    const specialty = await new SpecialtiesRepository(this.db).updateName(id, nombre);
    await this.audit(actorId, "ESPECIALIDAD_ACTUALIZADA", id);
    return specialty;
  }

  async deactivate(actorId: string, id: string) {
    const repository = new SpecialtiesRepository(this.db);
    const specialty = await repository.deactivate(id);
    await this.audit(actorId, "ESPECIALIDAD_DESACTIVADA", id);
    return specialty;
  }

  async activate(actorId: string, id: string) {
    const specialty = await new SpecialtiesRepository(this.db).activate(id);
    await this.audit(actorId, "ESPECIALIDAD_ACTIVADA", id);
    return specialty;
  }

  async delete(actorId: string, id: string) {
    const repository = new SpecialtiesRepository(this.db);
    const doctorCount = await this.db.medico.count({ where: { especialidadId: id } });
    if (doctorCount > 0) {
      throw new Error("No se puede eliminar una especialidad en uso: desactivala como alternativa");
    }
    const specialty = await repository.delete(id);
    await this.audit(actorId, "ESPECIALIDAD_ELIMINADA", id);
    return specialty;
  }

  private audit(actorId: string, accion: string, entidadId: string) {
    return new AuditService(this.db).record({
      usuarioId: actorId,
      accion,
      entidad: "Especialidad",
      entidadId,
    });
  }
}
