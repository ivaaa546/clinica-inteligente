import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class PrescriptionsRepository {
    private readonly db;
    constructor(db: DbClient);
    findById(id: string): Prisma.Prisma__RecetaClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        consultaId: string;
        medicamento: string;
        dosis: string;
        via: string;
        frecuencia: string;
        duracion: string;
        indicaciones: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    listByConsultation(consultaId: string): Prisma.PrismaPromise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        consultaId: string;
        medicamento: string;
        dosis: string;
        via: string;
        frecuencia: string;
        duracion: string;
        indicaciones: string;
    }[]>;
    create(data: Prisma.RecetaUncheckedCreateInput): Prisma.Prisma__RecetaClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        consultaId: string;
        medicamento: string;
        dosis: string;
        via: string;
        frecuencia: string;
        duracion: string;
        indicaciones: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listForPatient(pacienteId: string): Prisma.PrismaPromise<{
        consulta: {
            diagnostico: string;
        };
        id: string;
        medicamento: string;
        dosis: string;
        via: string;
        frecuencia: string;
        duracion: string;
        indicaciones: string;
    }[]>;
}
export {};
