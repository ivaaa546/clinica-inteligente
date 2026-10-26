import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class ConsultationsRepository {
    private readonly db;
    constructor(db: DbClient);
    findById(id: string): Prisma.Prisma__ConsultaClient<({
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
        signosVitales: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            pesoLb: Prisma.Decimal;
            tallaCm: Prisma.Decimal;
            temperatura: Prisma.Decimal;
            presionArterial: string;
            frecCardiaca: number;
            frecRespiratoria: number;
            consultaId: string;
        } | null;
        recetas: {
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
        }[];
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        tipoFicha: import(".prisma/client").$Enums.TipoFichaClinica;
        historiaActual: string | null;
        evaluacionClinica: Prisma.JsonValue | null;
        diagnostico: string;
        observaciones: string | null;
        fechaConsulta: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByAppointment(citaId: string): Prisma.Prisma__ConsultaClient<({
        signosVitales: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            pesoLb: Prisma.Decimal;
            tallaCm: Prisma.Decimal;
            temperatura: Prisma.Decimal;
            presionArterial: string;
            frecCardiaca: number;
            frecRespiratoria: number;
            consultaId: string;
        } | null;
        recetas: {
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
        }[];
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        tipoFicha: import(".prisma/client").$Enums.TipoFichaClinica;
        historiaActual: string | null;
        evaluacionClinica: Prisma.JsonValue | null;
        diagnostico: string;
        observaciones: string | null;
        fechaConsulta: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.ConsultaUncheckedCreateInput): Prisma.Prisma__ConsultaClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        citaId: string;
        motivoConsulta: string;
        tipoFicha: import(".prisma/client").$Enums.TipoFichaClinica;
        historiaActual: string | null;
        evaluacionClinica: Prisma.JsonValue | null;
        diagnostico: string;
        observaciones: string | null;
        fechaConsulta: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createVitalSigns(data: Prisma.SignosVitalesUncheckedCreateInput): Prisma.Prisma__SignosVitalesClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        pesoLb: Prisma.Decimal;
        tallaCm: Prisma.Decimal;
        temperatura: Prisma.Decimal;
        presionArterial: string;
        frecCardiaca: number;
        frecRespiratoria: number;
        consultaId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
