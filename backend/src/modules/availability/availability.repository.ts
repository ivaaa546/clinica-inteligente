import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class AvailabilityRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.disponibilidad.findUnique({ where: { id } });
  }

  listByDoctor(medicoId: string, from?: Date) {
    return this.db.disponibilidad.findMany({
      where: {
        medicoId,
        activa: true,
        ...(from ? { inicio: { gte: from } } : {}),
      },
      orderBy: { inicio: "asc" },
    });
  }

  findOverlap(medicoId: string, inicio: Date, fin: Date) {
    return this.db.disponibilidad.findFirst({
      where: { medicoId, activa: true, inicio: { lt: fin }, fin: { gt: inicio } },
    });
  }

  create(data: Prisma.DisponibilidadUncheckedCreateInput) {
    return this.db.disponibilidad.create({ data });
  }

  deactivate(id: string) {
    return this.db.disponibilidad.update({ where: { id }, data: { activa: false } });
  }

  countActiveAppointments(id: string) {
    return this.db.cita.count({
      where: {
        disponibilidadId: id,
        estado: { in: ["PENDIENTE", "ACEPTADA"] },
      },
    });
  }
}
