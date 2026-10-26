import { PrismaClient } from "@prisma/client";
export declare class AvailabilityService {
    private readonly db;
    constructor(db: PrismaClient);
    listForDoctor(medicoId: string, from?: Date): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        medicoId: string;
        inicio: Date;
        fin: Date;
        activa: boolean;
    }[]>;
    publish(doctorUserId: string, inicio: Date): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        medicoId: string;
        inicio: Date;
        fin: Date;
        activa: boolean;
    }>;
    remove(doctorUserId: string, id: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        medicoId: string;
        inicio: Date;
        fin: Date;
        activa: boolean;
    }>;
}
