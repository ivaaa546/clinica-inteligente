import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class AuditRepository {
    private readonly db;
    constructor(db: DbClient);
    create(data: Prisma.AuditoriaUncheckedCreateInput): Prisma.Prisma__AuditoriaClient<{
        id: string;
        usuarioId: string;
        accion: string;
        entidad: string;
        entidadId: string;
        ocurridoEn: Date;
        detalle: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listByActor(usuarioId: string, take?: number): Prisma.PrismaPromise<{
        id: string;
        usuarioId: string;
        accion: string;
        entidad: string;
        entidadId: string;
        ocurridoEn: Date;
        detalle: string | null;
    }[]>;
    listByDateRange(from: Date, to: Date, take?: number): Prisma.PrismaPromise<{
        id: string;
        usuarioId: string;
        accion: string;
        entidad: string;
        entidadId: string;
        ocurridoEn: Date;
        detalle: string | null;
    }[]>;
}
export {};
