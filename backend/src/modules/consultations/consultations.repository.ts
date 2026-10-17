import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class ConsultationsRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.consulta.findUnique({
      where: { id },
      include: { cita: true, signosVitales: true, recetas: true },
    });
  }

  findByAppointment(citaId: string) {
    return this.db.consulta.findUnique({
      where: { citaId },
      include: { signosVitales: true, recetas: true },
    });
  }

  create(data: Prisma.ConsultaUncheckedCreateInput) {
    return this.db.consulta.create({ data });
  }

  createVitalSigns(data: Prisma.SignosVitalesUncheckedCreateInput) {
    return this.db.signosVitales.create({ data });
  }
}
