import { PrismaClient } from "@prisma/client";
export type PatientRegistrationInput = {
    nombre: string;
    apellidos: string;
    correo: string;
    contrasena: string;
    telefono: string;
    fechaNacimiento: Date;
    sexo: "M" | "F" | "NO_ESPECIFICADO";
    direccion?: string;
    ocupacion?: string;
    poblacionMigrante?: boolean;
};
export type AuthSession = {
    userId?: string;
    destroy(callback: (error?: Error) => void): void;
};
export declare class AuthService {
    private readonly db;
    constructor(db: PrismaClient);
    registerPatient(input: PatientRegistrationInput): Promise<{
        id: string;
        nombre: string;
        correo: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }>;
    login(correo: string, contrasena: string, session: AuthSession): Promise<{
        id: string;
        nombre: string;
        correo: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    }>;
    logout(session: AuthSession): Promise<void>;
    getSessionUser(userId: string): Promise<{
        id: string;
        nombre: string;
        correo: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    } | null>;
    private publicUser;
}
