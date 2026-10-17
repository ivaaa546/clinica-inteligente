import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class PatientsRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.paciente.findUnique({ where: { id } });
  }

  findByUserId(usuarioId: string) {
    return this.db.paciente.findUnique({ where: { usuarioId } });
  }

  updateProfile(id: string, data: Prisma.PacienteUpdateInput) {
    return this.db.paciente.update({ where: { id }, data });
  }

  create(data: Prisma.PacienteUncheckedCreateInput) {
    return this.db.paciente.create({ data });
  }

  findRecord(id: string) {
    return this.db.paciente.findUnique({
      where: { id },
      include: {
        antecedentesGenerales: true,
        antecedentesGineco: true,
        citas: {
          include: { consulta: { include: { recetas: true } } },
          orderBy: { inicio: "desc" },
        },
      },
    });
  }
}
