import { Prisma, PrismaClient, EstadoCita } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

const activeStates: EstadoCita[] = ["PENDIENTE", "ACEPTADA"];

export class AppointmentsRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.cita.findUnique({
      where: { id },
      include: {
        paciente: {
          include: {
            usuario: { select: { nombre: true, apellidos: true, correo: true, telefono: true } },
          },
        },
        medico: true,
        disponibilidad: true,
        preconsulta: true,
        consulta: true,
      },
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
      include: {
        paciente: {
          select: {
            id: true,
            usuario: { select: { nombre: true, apellidos: true, telefono: true } },
          },
        },
        consulta: { select: { id: true } },
      },
      orderBy: { inicio: "asc" },
    });
  }

  listAll(estado?: EstadoCita) {
    return this.db.cita.findMany({
      where: estado ? { estado } : undefined,
      orderBy: { inicio: "asc" },
    });
  }

  listExpiredAcceptedVirtual(now: Date) {
    return this.db.cita.findMany({
      where: {
        modalidad: "VIRTUAL",
        estado: "ACEPTADA",
        fin: { lte: now },
        videoRevocadaEn: null,
      },
    });
  }

  existsDoctorPatientRelationship(medicoId: string, pacienteId: string) {
    return this.db.cita.findFirst({ where: { medicoId, pacienteId }, select: { id: true } });
  }

  create(data: Prisma.CitaUncheckedCreateInput) {
    return this.db.cita.create({ data });
  }

  updateState(id: string, estado: EstadoCita) {
    return this.db.cita.update({ where: { id }, data: { estado } });
  }

  markVideoRevoked(id: string, videoRevocadaEn: Date) {
    return this.db.cita.update({ where: { id }, data: { videoRevocadaEn } });
  }

  createRescheduled(data: Prisma.CitaUncheckedCreateInput) {
    return this.db.cita.create({ data });
  }
}
