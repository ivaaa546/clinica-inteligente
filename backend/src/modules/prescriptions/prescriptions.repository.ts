import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class PrescriptionsRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.receta.findUnique({ where: { id } });
  }

  listByConsultation(consultaId: string) {
    return this.db.receta.findMany({ where: { consultaId }, orderBy: { creadoEn: "asc" } });
  }

  create(data: Prisma.RecetaUncheckedCreateInput) {
    return this.db.receta.create({ data });
  }
}
