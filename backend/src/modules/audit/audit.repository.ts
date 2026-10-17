import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class AuditRepository {
  constructor(private readonly db: DbClient) {}

  create(data: Prisma.AuditoriaUncheckedCreateInput) {
    return this.db.auditoria.create({ data });
  }

  listByActor(usuarioId: string, take = 100) {
    return this.db.auditoria.findMany({
      where: { usuarioId },
      orderBy: { ocurridoEn: "desc" },
      take,
    });
  }

  listByDateRange(from: Date, to: Date, take = 100) {
    return this.db.auditoria.findMany({
      where: { ocurridoEn: { gte: from, lte: to } },
      orderBy: { ocurridoEn: "desc" },
      take,
    });
  }
}
