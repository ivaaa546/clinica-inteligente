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

  listForPatient(pacienteId: string) {
    return this.db.receta.findMany({
      where: { consulta: { cita: { pacienteId } } },
      select: {
        id: true,
        medicamento: true,
        dosis: true,
        via: true,
        frecuencia: true,
        duracion: true,
        indicaciones: true,
        consulta: {
          select: {
            id: true,
            diagnostico: true,
            fechaConsulta: true,
            cita: {
              select: {
                medico: {
                  select: {
                    numeroProfesional: true,
                    usuario: { select: { nombre: true, apellidos: true } },
                    especialidad: { select: { nombre: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { creadoEn: "desc" },
    });
  }
}
