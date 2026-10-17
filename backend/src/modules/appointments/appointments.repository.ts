import { Prisma, PrismaClient, EstadoCita } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

const activeStates: EstadoCita[] = ["PENDIENTE", "ACEPTADA"];

export class AppointmentsRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.cita.findUnique({
      where: { id },
      include: { paciente: true, medico: true, disponibilidad: true, preconsulta: true, consulta: true },
    });
  }

  findActiveByAvailability(disponibilidadId: string) {
    return this.db.cita.findFirst({
      where: { disponibilidadId, estado: { in: activeStates } },
    });
  }

  listByPatient(pacienteId: string, estado?: EstadoCita) {
    return this.db.cita.findMany({
      where: { pacienteId, ...(estado ? { estado } : {}) },
      orderBy: { inicio: "desc" },
    });
  }

  listByDoctor(medicoId: string, estado?: EstadoCita) {
    return this.db.cita.findMany({
      where: { medicoId, ...(estado ? { estado } : {}) },
      orderBy: { inicio: "asc" },
    });
  }

  create(data: Prisma.CitaUncheckedCreateInput) {
    return this.db.cita.create({ data });
  }

  updateState(id: string, estado: EstadoCita) {
    return this.db.cita.update({ where: { id }, data: { estado } });
  }

  createRescheduled(data: Prisma.CitaUncheckedCreateInput) {
    return this.db.cita.create({ data });
  }
}
