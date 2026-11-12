import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class VitalSignsRepository {
  constructor(private readonly db: DbClient) {}

  findByAppointment(citaId: string) {
    return this.db.lecturaSignosVitales.findUnique({ where: { citaId } });
  }

  upsert(citaId: string, data: Omit<Prisma.LecturaSignosVitalesUncheckedCreateInput, "citaId">) {
    return this.db.lecturaSignosVitales.upsert({ where: { citaId }, create: { citaId, ...data }, update: data });
  }
}
