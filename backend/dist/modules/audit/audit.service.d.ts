import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
type AuditDetail = Record<string, string | number | boolean | null>;
export type AuditEvent = {
    usuarioId: string;
    accion: string;
    entidad: string;
    entidadId: string;
    detalle?: AuditDetail;
};
export declare class AuditService {
    private readonly repository;
    constructor(db: DbClient);
    record(event: AuditEvent): Prisma.Prisma__AuditoriaClient<{
        id: string;
        usuarioId: string;
        accion: string;
        entidad: string;
        entidadId: string;
        ocurridoEn: Date;
        detalle: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    private serializeSafeDetail;
}
export {};
