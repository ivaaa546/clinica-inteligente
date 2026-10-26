import { PrismaClient } from "@prisma/client";
export declare class SpecialtiesService {
    private readonly db;
    constructor(db: PrismaClient);
    listPublic(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    }[]>;
    create(actorId: string, nombre: string): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    }>;
    updateName(actorId: string, id: string, nombre: string): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    }>;
    deactivate(actorId: string, id: string): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        activa: boolean;
    }>;
    private audit;
}
