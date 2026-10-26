import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class BackgroundRepository {
    private readonly db;
    constructor(db: DbClient);
    findByPatientId(pacienteId: string): Promise<[{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        pacienteId: string;
        medicos: Prisma.JsonValue | null;
        quirurgicos: string | null;
        familiares: Prisma.JsonValue | null;
        habitos: Prisma.JsonValue | null;
        alergias: string;
    } | null, {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        pacienteId: string;
        fur: Date | null;
        gestas: number;
        partos: number;
        cesareas: number;
        abortos: number;
        hijosVivos: number;
        planificacion: string | null;
    } | null]>;
    upsertGeneral(data: Prisma.AntecedentesGeneralesUncheckedCreateInput): Prisma.Prisma__AntecedentesGeneralesClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        pacienteId: string;
        medicos: Prisma.JsonValue | null;
        quirurgicos: string | null;
        familiares: Prisma.JsonValue | null;
        habitos: Prisma.JsonValue | null;
        alergias: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    upsertGineco(data: Prisma.AntecedentesGinecoUncheckedCreateInput): Prisma.Prisma__AntecedentesGinecoClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        pacienteId: string;
        fur: Date | null;
        gestas: number;
        partos: number;
        cesareas: number;
        abortos: number;
        hijosVivos: number;
        planificacion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
