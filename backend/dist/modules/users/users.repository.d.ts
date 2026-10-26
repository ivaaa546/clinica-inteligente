import { Prisma, PrismaClient } from "@prisma/client";
type DbClient = PrismaClient | Prisma.TransactionClient;
export declare class UsersRepository {
    private readonly db;
    constructor(db: DbClient);
    findById(id: string): Prisma.Prisma__UsuarioClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByEmail(correo: string): Prisma.Prisma__UsuarioClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.UsuarioUncheckedCreateInput): Prisma.Prisma__UsuarioClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateNonClinical(id: string, data: Prisma.UsuarioUpdateInput): Prisma.Prisma__UsuarioClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deactivate(id: string): Prisma.Prisma__UsuarioClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    list(where?: Prisma.UsuarioWhereInput): Prisma.PrismaPromise<{
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
    }[]>;
}
export {};
