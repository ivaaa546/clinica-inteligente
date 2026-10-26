import { Prisma, PrismaClient, TipoFichaClinica } from "@prisma/client";
export type ConsultationInput = {
    citaId: string;
    tipoFicha: TipoFichaClinica;
    motivoConsulta: string;
    historiaActual?: string;
    evaluacionClinica?: Prisma.InputJsonValue;
    diagnostico: string;
    observaciones?: string;
    signosVitales: {
        pesoLb: number;
        tallaCm: number;
        temperatura: number;
        presionArterial: string;
        frecCardiaca: number;
        frecRespiratoria: number;
    };
};
export declare class ConsultationsService {
    private readonly db;
    constructor(db: PrismaClient);
    register(doctorUserId: string, input: ConsultationInput): Promise<({
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
    }) | null>;
    private validateEvaluation;
    getById(doctorUserId: string, id: string): Promise<{
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
    }>;
    getByAppointment(doctorUserId: string, citaId: string): Promise<({
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
    }) | null>;
    private authorizeDoctorConsultation;
}
