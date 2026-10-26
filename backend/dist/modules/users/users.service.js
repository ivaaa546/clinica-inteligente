import { RolUsuario } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { SpecialtiesRepository } from "../specialties/specialties.repository.js";
import { hashPassword } from "../../lib/password.js";
import { UsersRepository } from "./users.repository.js";
export class UsersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createDoctor(actorId, input) {
        const passwordHash = await hashPassword(input.contrasena);
        // Cuenta, perfil profesional y auditoria se confirman o revierten juntos.
        return this.db.$transaction(async (transaction) => {
            const users = new UsersRepository(transaction);
            const doctors = new DoctorsRepository(transaction);
            const specialties = new SpecialtiesRepository(transaction);
            const specialty = await specialties.findById(input.especialidadId);
            if (!specialty?.activa) {
                throw new Error("La especialidad no existe o esta inactiva");
            }
            const user = await users.create({
                nombre: input.nombre,
                apellidos: input.apellidos,
                correo: input.correo,
                contrasenaHash: passwordHash,
                telefono: input.telefono,
                rol: RolUsuario.MEDICO,
                activo: true,
            });
            await doctors.create({
                usuarioId: user.id,
                especialidadId: input.especialidadId,
                numeroProfesional: input.numeroProfesional,
            });
            await new AuditService(transaction).record({
                usuarioId: actorId,
                accion: "MEDICO_CREADO",
                entidad: "Usuario",
                entidadId: user.id,
                detalle: { rol: RolUsuario.MEDICO, especialidadId: input.especialidadId },
            });
            return this.publicUser(user);
        });
    }
    async updateNonClinical(actorId, userId, input) {
        // El tipo de entrada solo permite datos administrativos, nunca campos clinicos.
        const user = await new UsersRepository(this.db).updateNonClinical(userId, input);
        await new AuditService(this.db).record({
            usuarioId: actorId,
            accion: "USUARIO_ACTUALIZADO",
            entidad: "Usuario",
            entidadId: userId,
            detalle: { campos: Object.keys(input).join(",") },
        });
        return this.publicUser(user);
    }
    async list(where) {
        const users = await new UsersRepository(this.db).list(where);
        // El servicio elimina el hash antes de entregar cualquier usuario al controller.
        return users.map((user) => this.publicUser(user));
    }
    async deactivate(actorId, userId) {
        // La desactivacion logica conserva citas y registros clinicos historicos.
        const user = await new UsersRepository(this.db).deactivate(userId);
        await new AuditService(this.db).record({
            usuarioId: actorId,
            accion: "USUARIO_DESACTIVADO",
            entidad: "Usuario",
            entidadId: userId,
        });
        return this.publicUser(user);
    }
    publicUser(user) {
        return { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
    }
}
//# sourceMappingURL=users.service.js.map