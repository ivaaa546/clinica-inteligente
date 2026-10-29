import { PrismaClient } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { AvailabilityRepository } from "../availability/availability.repository.js";
import { SpecialtiesRepository } from "../specialties/specialties.repository.js";
import { DoctorsRepository } from "./doctors.repository.js";

export type DoctorProfileInput = {
  numeroProfesional?: string;
  especialidadId?: string;
  direccionAtencionPresencial?: string | null;
};

export class DoctorsService {
  constructor(private readonly db: PrismaClient) {}

  // La búsqueda solo consulta médicos y especialidades activos.
  search(especialidadId?: string) {
    return new DoctorsRepository(this.db).searchActive(especialidadId).then((doctors) =>
      doctors.map((doctor) => this.publicDoctor(doctor)),
    );
  }

  async getPublicProfile(id: string, from?: Date) {
    const doctor = await new DoctorsRepository(this.db).findPublicById(id);
    if (!doctor) {
      return null;
    }

    const availability = await new AvailabilityRepository(this.db).listByDoctor(id, from);

    // El perfil publico solo expone identidad profesional y horarios activos.
    return { ...this.publicDoctor(doctor), availability };
  }

  async getOwnProfile(userId: string) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(userId);
    return doctor && {
      id: doctor.id,
      nombre: doctor.usuario.nombre,
      apellidos: doctor.usuario.apellidos,
      telefono: doctor.usuario.telefono,
      numeroProfesional: doctor.numeroProfesional,
      especialidad: doctor.especialidad,
      direccionAtencionPresencial: doctor.direccionAtencionPresencial,
    };
  }

  async updateOwnProfile(userId: string, input: DoctorProfileInput) {
    const doctors = new DoctorsRepository(this.db);
    const doctor = await doctors.findByUserId(userId);
    if (!doctor) {
      throw new Error("Perfil de medico no encontrado");
    }

    // El cambio de especialidad nunca puede apuntar a una especialidad inactiva.
    if (input.especialidadId) {
      const specialty = await new SpecialtiesRepository(this.db).findById(input.especialidadId);
      if (!specialty?.activa) {
        throw new Error("La especialidad no existe o esta inactiva");
      }
    }

    const { direccionAtencionPresencial, ...profileInput } = input;
    const normalizedAddress = direccionAtencionPresencial?.trim() || null;
    if (direccionAtencionPresencial !== undefined && direccionAtencionPresencial !== null && !normalizedAddress) {
      throw new Error("La direccion de atencion presencial no puede estar vacia");
    }

    if (Object.keys(profileInput).length) {
      await doctors.updateProfile(doctor.id, profileInput);
      await new AuditService(this.db).record({
        usuarioId: userId,
        accion: "PERFIL_MEDICO_ACTUALIZADO",
        entidad: "Medico",
        entidadId: doctor.id,
        detalle: { campos: Object.keys(profileInput).join(",") },
      });
    }

    if (direccionAtencionPresencial !== undefined) {
      await doctors.updateAttendanceAddress(doctor.id, normalizedAddress);
      // Solo registra si hay configuracion; nunca persiste la direccion en la auditoria.
      await new AuditService(this.db).record({
        usuarioId: userId,
        accion: "DIRECCION_PRESENCIAL_ACTUALIZADA",
        entidad: "Medico",
        entidadId: doctor.id,
        detalle: { configurada: normalizedAddress !== null },
      });
    }

    const updated = await doctors.findPublicById(doctor.id);
    if (!updated) {
      throw new Error("Perfil de medico no encontrado despues de actualizar");
    }

    return this.publicDoctor(updated);
  }

  private publicDoctor(doctor: {
    id: string;
    numeroProfesional: string;
    direccionAtencionPresencial: string | null;
    usuario: { nombre: string; apellidos: string; telefono: string };
    especialidad: { id: string; nombre: string };
  }) {
    // Este serializer evita devolver el usuario completo o cualquier credencial interna.
    return {
      id: doctor.id,
      nombre: doctor.usuario.nombre,
      apellidos: doctor.usuario.apellidos,
      telefono: doctor.usuario.telefono,
      numeroProfesional: doctor.numeroProfesional,
      direccionAtencionPresencial: doctor.direccionAtencionPresencial,
      especialidad: doctor.especialidad,
    };
  }
}
