import { RolUsuario } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PatientsRepository } from "../patients/patients.repository.js";
import { UsersRepository } from "../users/users.repository.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
export class AuthService {
    db;
    constructor(db) {
        this.db = db;
    }
    async registerPatient(input) {
        const passwordHash = await hashPassword(input.contrasena);
        return this.db.$transaction(async (transaction) => {
            const users = new UsersRepository(transaction);
            const patients = new PatientsRepository(transaction);
            const audit = new AuditService(transaction);
            // El registro publico siempre crea un Paciente; nunca acepta un rol recibido del cliente.
            const user = await users.create({
                nombre: input.nombre,
                apellidos: input.apellidos,
                correo: input.correo,
                contrasenaHash: passwordHash,
                telefono: input.telefono,
                rol: RolUsuario.PACIENTE,
                activo: true,
            });
            await patients.create({
                usuarioId: user.id,
                fechaNacimiento: input.fechaNacimiento,
                sexo: input.sexo,
                direccion: input.direccion,
                ocupacion: input.ocupacion,
                poblacionMigrante: input.poblacionMigrante ?? false,
            });
            await audit.record({
                usuarioId: user.id,
                accion: "USUARIO_REGISTRADO",
                entidad: "Usuario",
                entidadId: user.id,
                detalle: { rol: RolUsuario.PACIENTE },
            });
            return this.publicUser(user);
        });
    }
    async login(correo, contrasena, session) {
        const users = new UsersRepository(this.db);
        const user = await users.findByEmail(correo);
        if (!user || !user.activo || !(await verifyPassword(user.contrasenaHash, contrasena))) {
            throw new Error("Credenciales invalidas");
        }
        session.userId = user.id;
        await new AuditService(this.db).record({
            usuarioId: user.id,
            accion: "LOGIN",
            entidad: "Usuario",
            entidadId: user.id,
            detalle: { rol: user.rol },
        });
        return this.publicUser(user);
    }
    async logout(session) {
        const userId = session.userId;
        await new Promise((resolve, reject) => {
            session.destroy((error) => (error ? reject(error) : resolve()));
        });
        if (userId) {
            await new AuditService(this.db).record({
                usuarioId: userId,
                accion: "LOGOUT",
                entidad: "Usuario",
                entidadId: userId,
            });
        }
    }
    async getSessionUser(userId) {
        const user = await new UsersRepository(this.db).findById(userId);
        if (!user || !user.activo) {
            return null;
        }
        return this.publicUser(user);
    }
    publicUser(user) {
        return { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
    }
}
//# sourceMappingURL=auth.service.js.map