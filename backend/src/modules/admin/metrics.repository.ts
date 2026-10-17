import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class MetricsRepository {
  constructor(private readonly db: DbClient) {}

  countActivePatients() {
    return this.db.paciente.count({ where: { usuario: { activo: true } } });
  }

  countActiveDoctors() {
    return this.db.medico.count({ where: { usuario: { activo: true } } });
  }

  countActiveUsersByRole() {
    return this.db.usuario.groupBy({
      by: ["rol"],
      where: { activo: true },
      _count: { _all: true },
    });
  }

  countAppointmentsByState() {
    return this.db.cita.groupBy({
      by: ["estado"],
      _count: { _all: true },
    });
  }

  countCompletedConsultations() {
    return this.db.consulta.count({ where: { cita: { estado: "COMPLETADA" } } });
  }
}
