import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class AvailabilityRepository {
    private readonly db;
    constructor(db: DbClient);
    findById(id: string): Prisma.Prisma__DisponibilidadClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        medicoId: string;
        inicio: Date;
        fin: Date;
        activa: boolean;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    listByDoctor(medicoId: string, from?: Date): Prisma.PrismaPromise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        medicoId: string;
        inicio: Date;
        fin: Date;
        activa: boolean;
    }[]>;
    findOverlap(medicoId: string, inicio: Date, fin: Date): Prisma.Prisma__DisponibilidadClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        medicoId: string;
        inicio: Date;
        fin: Date;
        activa: boolean;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.DisponibilidadUncheckedCreateInput): Prisma.Prisma__DisponibilidadClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        medicoId: string;
        inicio: Date;
        fin: Date;
        activa: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deactivate(id: string): Prisma.Prisma__DisponibilidadClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        medicoId: string;
        inicio: Date;
        fin: Date;
        activa: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    countActiveAppointments(id: string): Prisma.PrismaPromise<number>;
}
export {};
