import { Prisma, PrismaClient, EstadoCita } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class AppointmentsRepository {
    private readonly db;
    constructor(db: DbClient);
    findById(id: string): Prisma.Prisma__CitaClient<({
        paciente: {
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
        };
        medico: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            usuarioId: string;
            numeroProfesional: string;
            especialidadId: string;
        };
        disponibilidad: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            medicoId: string;
            inicio: Date;
            fin: Date;
            activa: boolean;
        };
        preconsulta: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            citaId: string;
            motivoConsulta: string;
            antecedentesIniciales: Prisma.JsonValue | null;
        } | null;
        consulta: {
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
        } | null;
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findActiveByAvailability(disponibilidadId: string): Prisma.Prisma__CitaClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    listByPatient(pacienteId: string, estado?: EstadoCita): Prisma.PrismaPromise<{
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
    }[]>;
    listByDoctor(medicoId: string, estado?: EstadoCita): Prisma.PrismaPromise<{
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
    }[]>;
    listAll(estado?: EstadoCita): Prisma.PrismaPromise<{
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
    }[]>;
    existsDoctorPatientRelationship(medicoId: string, pacienteId: string): Prisma.Prisma__CitaClient<{
        id: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.CitaUncheckedCreateInput): Prisma.Prisma__CitaClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateState(id: string, estado: EstadoCita): Prisma.Prisma__CitaClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createRescheduled(data: Prisma.CitaUncheckedCreateInput): Prisma.Prisma__CitaClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
