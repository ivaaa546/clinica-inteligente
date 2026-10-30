import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

const includeMedico = {
  medico: {
    select: {
      especialidadId: true,
      numeroProfesional: true,
    },
  },
} as const;

export class UsersRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.usuario.findUnique({
      where: { id },
      include: includeMedico,
    });
  }

  findByEmail(correo: string) {
    return this.db.usuario.findUnique({ where: { correo } });
  }

  create(data: Prisma.UsuarioUncheckedCreateInput) {
    return this.db.usuario.create({ data });
  }

  updateNonClinical(id: string, data: Prisma.UsuarioUpdateInput) {
    return this.db.usuario.update({
      where: { id },
      data,
      include: includeMedico,
    });
  }

  deactivate(id: string) {
    return this.db.usuario.update({
      where: { id },
      data: { activo: false },
      include: includeMedico,
    });
  }

  activate(id: string) {
    return this.db.usuario.update({
      where: { id },
      data: { activo: true },
      include: includeMedico,
    });
  }

  list(where?: Prisma.UsuarioWhereInput) {
    return this.db.usuario.findMany({
      where,
      include: includeMedico,
      orderBy: { creadoEn: "desc" },
    });
  }
}
