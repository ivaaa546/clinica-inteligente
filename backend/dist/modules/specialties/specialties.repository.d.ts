import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class SpecialtiesRepository {
    private readonly db;
    constructor(db: DbClient);
    listActive(): Prisma.PrismaPromise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    }[]>;
    findById(id: string): Prisma.Prisma__EspecialidadClient<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.EspecialidadCreateInput): Prisma.Prisma__EspecialidadClient<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateName(id: string, nombre: string): Prisma.Prisma__EspecialidadClient<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deactivate(id: string): Prisma.Prisma__EspecialidadClient<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    countActiveDoctors(id: string): Prisma.PrismaPromise<number>;
}
export {};
