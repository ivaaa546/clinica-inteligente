import { PrismaClient } from "@prisma/client";
export type DoctorProfileInput = {
    numeroProfesional?: string;
    especialidadId?: string;
};
export declare class DoctorsService {
    private readonly db;
    constructor(db: PrismaClient);
    search(especialidadId?: string): Promise<{
        id: string;
        nombre: string;
        apellidos: string;
        telefono: string;
        numeroProfesional: string;
        especialidad: {
            id: string;
            nombre: string;
        };
    }[]>;
    getPublicProfile(id: string, from?: Date): Promise<{
        availability: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            medicoId: string;
            inicio: Date;
            fin: Date;
            activa: boolean;
        }[];
        id: string;
        nombre: string;
        apellidos: string;
        telefono: string;
        numeroProfesional: string;
        especialidad: {
            id: string;
            nombre: string;
        };
    } | null>;
    getOwnProfile(userId: string): import(".prisma/client").Prisma.Prisma__MedicoClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        numeroProfesional: string;
        especialidadId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updateOwnProfile(userId: string, input: DoctorProfileInput): Promise<{
        id: string;
        nombre: string;
        apellidos: string;
        telefono: string;
        numeroProfesional: string;
        especialidad: {
            id: string;
            nombre: string;
        };
    }>;
    private publicDoctor;
}
