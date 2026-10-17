import { PrismaClient } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { SpecialtiesRepository } from "./specialties.repository.js";

export class SpecialtiesService {
  constructor(private readonly db: PrismaClient) {}

  listPublic() {
    return new SpecialtiesRepository(this.db).listActive();
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
    const activeDoctors = await repository.countActiveDoctors(id);

    // Una especialidad en uso se conserva para no romper perfiles profesionales existentes.
    if (activeDoctors > 0) {
      throw new Error("No se puede desactivar una especialidad usada por medicos activos");
    }

    const specialty = await repository.deactivate(id);
    await this.audit(actorId, "ESPECIALIDAD_DESACTIVADA", id);
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
