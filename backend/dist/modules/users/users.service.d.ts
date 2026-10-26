import { PrismaClient, RolUsuario } from "@prisma/client";
export type CreateDoctorInput = {
    nombre: string;
    apellidos: string;
    correo: string;
    contrasena: string;
    telefono: string;
    numeroProfesional: string;
    especialidadId: string;
};
export type UpdateUserInput = {
    nombre?: string;
    apellidos?: string;
    telefono?: string;
    correo?: string;
};
export declare class UsersService {
    private readonly db;
    constructor(db: PrismaClient);
    createDoctor(actorId: string, input: CreateDoctorInput): Promise<{
        id: string;
        nombre: string;
        correo: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }>;
    updateNonClinical(actorId: string, userId: string, input: UpdateUserInput): Promise<{
        id: string;
        nombre: string;
        correo: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }>;
    list(where?: {
        activo?: boolean;
        rol?: RolUsuario;
    }): Promise<{
        id: string;
        nombre: string;
        correo: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }[]>;
    deactivate(actorId: string, userId: string): Promise<{
        id: string;
        nombre: string;
        correo: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }>;
    private publicUser;
}
