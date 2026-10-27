import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

// La proyeccion publica no incluye direccion de atencion ni campos de cuenta sensibles.
const publicDoctorSelect = {
  id: true,
  numeroProfesional: true,
  usuario: { select: { nombre: true, apellidos: true, telefono: true } },
  especialidad: { select: { id: true, nombre: true } },
} satisfies Prisma.MedicoSelect;

export class DoctorsRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.medico.findUnique({ where: { id } });
  }

  findByUserId(usuarioId: string) {
    return this.db.medico.findUnique({ where: { usuarioId } });
  }

  findPublicById(id: string) {
    return this.db.medico.findFirst({
      where: { id, usuario: { activo: true }, especialidad: { activa: true } },
      select: publicDoctorSelect,
    });
  }

  searchActive(especialidadId?: string) {
    return this.db.medico.findMany({
      where: {
        usuario: { activo: true },
        especialidad: { activa: true, ...(especialidadId ? { id: especialidadId } : {}) },
      },
      select: publicDoctorSelect,
      orderBy: { creadoEn: "asc" },
    });
  }

  create(data: Prisma.MedicoUncheckedCreateInput) {
    return this.db.medico.create({ data });
  }

  updateProfile(id: string, data: Prisma.MedicoUpdateInput) {
    return this.db.medico.update({ where: { id }, data });
  }

  updateAttendanceAddress(id: string, direccionAtencionPresencial: string | null) {
    return this.db.medico.update({ where: { id }, data: { direccionAtencionPresencial } });
  }
}
