import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class PreconsultationsRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.preconsulta.findUnique({ where: { id }, include: { cita: true } });
  }

  findByAppointment(citaId: string) {
    return this.db.preconsulta.findUnique({ where: { citaId } });
  }

  create(data: Prisma.PreconsultaUncheckedCreateInput) {
    return this.db.preconsulta.create({ data });
  }

  update(id: string, data: Prisma.PreconsultaUpdateInput) {
    return this.db.preconsulta.update({ where: { id }, data });
  }
}
