import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class PatientsRepository {
    private readonly db;
    constructor(db: DbClient);
    findById(id: string): Prisma.Prisma__PacienteClient<{
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
    findByUserId(usuarioId: string): Prisma.Prisma__PacienteClient<{
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
    updateProfile(id: string, data: Prisma.PacienteUpdateInput): Prisma.Prisma__PacienteClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.PacienteUncheckedCreateInput): Prisma.Prisma__PacienteClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findRecord(id: string): Prisma.Prisma__PacienteClient<({
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
