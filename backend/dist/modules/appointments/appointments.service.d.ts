import { EstadoCita, Prisma, PrismaClient, RolUsuario } from "@prisma/client";
export declare class AppointmentsService {
    private readonly db;
    constructor(db: PrismaClient);
    request(patientUserId: string, medicoId: string, disponibilidadId: string): Promise<{
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
    }>;
    listForPatient(userId: string, estado?: EstadoCita): Promise<{
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
    listForDoctor(userId: string, estado?: EstadoCita): Promise<{
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
    getById(id: string): Prisma.Prisma__CitaClient<({
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
    getForActor(actor: {
        userId: string;
        role: RolUsuario;
    }, id: string): Promise<({
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
    }) | {
        id: string;
        medicoId: string;
        disponibilidadId: string;
        inicio: Date;
        fin: Date;
        estado: import(".prisma/client").$Enums.EstadoCita;
        citaOrigenId: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        preconsulta: {
            id: string;
            citaId: string;
            motivoConsulta: string;
            antecedentesIniciales: Prisma.JsonValue;
        } | null;
        consulta: {
            diagnostico: string;
        } | null;
        pacienteId?: undefined;
    } | {
        id: string;
        pacienteId: string;
        medicoId: string;
        disponibilidadId: string;
        inicio: Date;
        fin: Date;
        estado: import(".prisma/client").$Enums.EstadoCita;
        citaOrigenId: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        preconsulta?: undefined;
        consulta?: undefined;
    }>;
    accept(doctorUserId: string, appointmentId: string): Promise<{
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
    }>;
    reject(doctorUserId: string, appointmentId: string): Promise<{
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
    }>;
    cancel(actor: {
        userId: string;
        role: RolUsuario;
    }, appointmentId: string): Promise<{
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
    }>;
    reschedule(actor: {
        userId: string;
        role: RolUsuario;
    }, appointmentId: string, newAvailabilityId: string): Promise<{
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
    }>;
    private authorizeDoctorAppointment;
    private authorizeActorAppointment;
    private changeState;
    private assertState;
    private assertFuture;
}
