import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class UsersRepository {
  constructor(private readonly db: DbClient) {}

  findById(id: string) {
    return this.db.usuario.findUnique({ where: { id } });
  }

  findByEmail(correo: string) {
    return this.db.usuario.findUnique({ where: { correo } });
  }

  create(data: Prisma.UsuarioUncheckedCreateInput) {
    return this.db.usuario.create({ data });
  }

  updateNonClinical(id: string, data: Prisma.UsuarioUpdateInput) {
    return this.db.usuario.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.db.usuario.update({ where: { id }, data: { activo: false } });
  }

  list(where?: Prisma.UsuarioWhereInput) {
    return this.db.usuario.findMany({ where, orderBy: { creadoEn: "desc" } });
  }
}
