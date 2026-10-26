import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class PreconsultationsRepository {
    private readonly db;
    constructor(db: DbClient);
    findById(id: string): Prisma.Prisma__PreconsultaClient<({
        cita: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            pacienteId: string;
            medicoId: string;
            disponibilidadId: string;
            inicio: Date;
            fin: Date;
            estado: import(".prisma/client").$Enums.EstadoCita;
            citaOrigenId: string | null;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        antecedentesIniciales: Prisma.JsonValue | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByAppointment(citaId: string): Prisma.Prisma__PreconsultaClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        antecedentesIniciales: Prisma.JsonValue | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.PreconsultaUncheckedCreateInput): Prisma.Prisma__PreconsultaClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        antecedentesIniciales: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: Prisma.PreconsultaUpdateInput): Prisma.Prisma__PreconsultaClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        antecedentesIniciales: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
