import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class SpecialtiesRepository {
  constructor(private readonly db: DbClient) {}

  listActive() {
    return this.db.especialidad.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } });
  }

  findById(id: string) {
    return this.db.especialidad.findUnique({ where: { id } });
  }

  create(data: Prisma.EspecialidadCreateInput) {
    return this.db.especialidad.create({ data });
  }

  updateName(id: string, nombre: string) {
    return this.db.especialidad.update({ where: { id }, data: { nombre } });
  }

  deactivate(id: string) {
    return this.db.especialidad.update({ where: { id }, data: { activa: false } });
  }

  countActiveDoctors(id: string) {
    return this.db.medico.count({ where: { especialidadId: id, usuario: { activo: true } } });
  }
}
