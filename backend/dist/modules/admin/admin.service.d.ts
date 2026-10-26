import { EstadoCita, PrismaClient } from "@prisma/client";
export declare class AdminService {
    private readonly db;
    constructor(db: PrismaClient);
    metrics(): Promise<{
        patients: number;
        doctors: number;
        usersByRole: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.UsuarioGroupByOutputType, "rol"[]> & {
            _count: {
                _all: number;
            };
        })[];
        appointmentsByState: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.CitaGroupByOutputType, "estado"[]> & {
            _count: {
                _all: number;
            };
        })[];
        completedConsultations: number;
    }>;
    listAppointments(estado?: EstadoCita): import(".prisma/client").Prisma.PrismaPromise<{
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
    cancelAppointment(adminUserId: string, appointmentId: string): Promise<{
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
    rescheduleAppointment(adminUserId: string, appointmentId: string, newAvailabilityId: string): Promise<{
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
}
