import { PrismaClient, RolUsuario } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { SpecialtiesRepository } from "../specialties/specialties.repository.js";
import { hashPassword } from "../../lib/password.js";
import { UsersRepository } from "./users.repository.js";

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

export class UsersService {
  constructor(private readonly db: PrismaClient) {}

  async createDoctor(actorId: string, input: CreateDoctorInput) {
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

      return this.publicUser({
        ...user,
        medico: {
          especialidadId: input.especialidadId,
          numeroProfesional: input.numeroProfesional,
        },
      });
    });
  }

  async updateNonClinical(actorId: string, userId: string, input: UpdateUserInput) {
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

  async list(where?: { activo?: boolean; rol?: RolUsuario }) {
    const users = await new UsersRepository(this.db).list(where);

    // El servicio elimina el hash antes de entregar cualquier usuario al controller.
    return users.map((user) => this.publicUser(user));
  }

  async findById(userId: string) {
    const user = await new UsersRepository(this.db).findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return this.publicUser(user);
  }

  async deactivate(actorId: string, userId: string) {
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

  async activate(actorId: string, userId: string) {
    const user = await new UsersRepository(this.db).activate(userId);

    await new AuditService(this.db).record({
      usuarioId: actorId,
      accion: "USUARIO_ACTIVADO",
      entidad: "Usuario",
      entidadId: userId,
    });

    return this.publicUser(user);
  }

  private publicUser(user: {
    id: string;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    rol: RolUsuario;
    activo: boolean;
    medico?: { especialidadId: string; numeroProfesional: string } | null;
  }) {
    return {
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.rol,
      activo: user.activo,
      especialidadId: user.medico?.especialidadId ?? null,
      numeroProfesional: user.medico?.numeroProfesional ?? null,
    };
  }
}
