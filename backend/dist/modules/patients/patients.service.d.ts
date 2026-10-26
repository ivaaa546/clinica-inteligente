import { Prisma, PrismaClient } from "@prisma/client";
export type PatientProfileInput = {
    direccion?: string;
    ocupacion?: string;
    nombreResponsable?: string;
};
export type GeneralBackgroundInput = {
    medicos?: Prisma.InputJsonValue;
    quirurgicos?: string;
    familiares?: Prisma.InputJsonValue;
    habitos?: Prisma.InputJsonValue;
    alergias: string;
};
export type GynecologicalBackgroundInput = {
    fur?: Date;
    gestas?: number;
    partos?: number;
    cesareas?: number;
    abortos?: number;
    hijosVivos?: number;
    planificacion?: string;
};
export declare class PatientsService {
    private readonly db;
    constructor(db: PrismaClient);
    getOwnProfile(userId: string): Prisma.Prisma__PacienteClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaNacimiento: Date;
        sexo: import(".prisma/client").$Enums.SexoPaciente;
        direccion: string | null;
        ocupacion: string | null;
        poblacionMigrante: boolean;
        nombreResponsable: string | null;
        usuarioId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updateOwnProfile(userId: string, input: PatientProfileInput): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaNacimiento: Date;
        sexo: import(".prisma/client").$Enums.SexoPaciente;
        direccion: string | null;
        ocupacion: string | null;
        poblacionMigrante: boolean;
        nombreResponsable: string | null;
        usuarioId: string;
    }>;
    getAuthorizedRecord(doctorUserId: string, patientId: string): Promise<({
        antecedentesGenerales: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            pacienteId: string;
            medicos: Prisma.JsonValue | null;
            quirurgicos: string | null;
            familiares: Prisma.JsonValue | null;
            habitos: Prisma.JsonValue | null;
            alergias: string;
        } | null;
        antecedentesGineco: {
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
        } | null;
        citas: ({
            consulta: ({
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
            }) | null;
        } & {
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
        })[];
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaNacimiento: Date;
        sexo: import(".prisma/client").$Enums.SexoPaciente;
        direccion: string | null;
        ocupacion: string | null;
        poblacionMigrante: boolean;
        nombreResponsable: string | null;
        usuarioId: string;
    }) | null>;
    getBackground(doctorUserId: string, patientId: string): Promise<[{
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
    updateBackground(doctorUserId: string, patientId: string, general: GeneralBackgroundInput, gynecological?: GynecologicalBackgroundInput): Promise<{
        general: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            pacienteId: string;
            medicos: Prisma.JsonValue | null;
            quirurgicos: string | null;
            familiares: Prisma.JsonValue | null;
            habitos: Prisma.JsonValue | null;
            alergias: string;
        };
        gynecological: {
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
        } | undefined;
    }>;
    private assertDoctorRelationship;
}
