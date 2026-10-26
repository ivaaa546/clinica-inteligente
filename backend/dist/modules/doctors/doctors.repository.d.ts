import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class DoctorsRepository {
    private readonly db;
    constructor(db: DbClient);
    findById(id: string): Prisma.Prisma__MedicoClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        numeroProfesional: string;
        especialidadId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByUserId(usuarioId: string): Prisma.Prisma__MedicoClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        numeroProfesional: string;
        especialidadId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findPublicById(id: string): Prisma.Prisma__MedicoClient<({
        usuario: {
            id: string;
            correo: string;
            nombre: string;
            apellidos: string;
            contrasenaHash: string;
            telefono: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
        };
        especialidad: {
            id: string;
            nombre: string;
            creadoEn: Date;
            actualizadoEn: Date;
            activa: boolean;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        numeroProfesional: string;
        especialidadId: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    searchActive(especialidadId?: string): Prisma.PrismaPromise<({
        usuario: {
            id: string;
            correo: string;
            nombre: string;
            apellidos: string;
            contrasenaHash: string;
            telefono: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            activo: boolean;
            creadoEn: Date;
            actualizadoEn: Date;
        };
        especialidad: {
            id: string;
            nombre: string;
            creadoEn: Date;
            actualizadoEn: Date;
            activa: boolean;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        numeroProfesional: string;
        especialidadId: string;
    })[]>;
    create(data: Prisma.MedicoUncheckedCreateInput): Prisma.Prisma__MedicoClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        numeroProfesional: string;
        especialidadId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateProfile(id: string, data: Prisma.MedicoUpdateInput): Prisma.Prisma__MedicoClient<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        numeroProfesional: string;
        especialidadId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
