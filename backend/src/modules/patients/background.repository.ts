import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class BackgroundRepository {
  constructor(private readonly db: DbClient) {}

  findByPatientId(pacienteId: string) {
    return Promise.all([
      this.db.antecedentesGenerales.findUnique({ where: { pacienteId } }),
      this.db.antecedentesGineco.findUnique({ where: { pacienteId } }),
    ]);
  }

  upsertGeneral(data: Prisma.AntecedentesGeneralesUncheckedCreateInput) {
    const { pacienteId, ...values } = data;
    return this.db.antecedentesGenerales.upsert({
      where: { pacienteId },
      create: data,
      update: values,
    });
  }

  upsertGineco(data: Prisma.AntecedentesGinecoUncheckedCreateInput) {
    const { pacienteId, ...values } = data;
    return this.db.antecedentesGineco.upsert({
      where: { pacienteId },
      create: data,
      update: values,
    });
  }
}
