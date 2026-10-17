import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class DoctorsRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.medico.findUnique({ where: { id } });
  }

  findByUserId(usuarioId: string) {
    return this.db.medico.findUnique({ where: { usuarioId } });
  }

  findPublicById(id: string) {
    return this.db.medico.findFirst({
      where: { id, usuario: { activo: true }, especialidad: { activa: true } },
      include: { usuario: true, especialidad: true },
    });
  }

  searchActive(especialidadId?: string) {
    return this.db.medico.findMany({
      where: {
        usuario: { activo: true },
        especialidad: { activa: true, ...(especialidadId ? { id: especialidadId } : {}) },
      },
      include: { usuario: true, especialidad: true },
      orderBy: { creadoEn: "asc" },
    });
  }

  create(data: Prisma.MedicoUncheckedCreateInput) {
    return this.db.medico.create({ data });
  }

  updateProfile(id: string, data: Prisma.MedicoUpdateInput) {
    return this.db.medico.update({ where: { id }, data });
  }
}
