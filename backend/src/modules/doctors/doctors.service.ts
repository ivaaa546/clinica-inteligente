import { PrismaClient } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { AvailabilityRepository } from "../availability/availability.repository.js";
import { SpecialtiesRepository } from "../specialties/specialties.repository.js";
import { DoctorsRepository } from "./doctors.repository.js";

export type DoctorProfileInput = {
  numeroProfesional?: string;
  especialidadId?: string;
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

  getOwnProfile(userId: string) {
    return new DoctorsRepository(this.db).findByUserId(userId);
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

    await doctors.updateProfile(doctor.id, input);
    await new AuditService(this.db).record({
      usuarioId: userId,
      accion: "PERFIL_MEDICO_ACTUALIZADO",
      entidad: "Medico",
      entidadId: doctor.id,
      detalle: { campos: Object.keys(input).join(",") },
    });

    const updated = await doctors.findPublicById(doctor.id);
    if (!updated) {
      throw new Error("Perfil de medico no encontrado despues de actualizar");
    }

    return this.publicDoctor(updated);
  }

  private publicDoctor(doctor: {
    id: string;
    numeroProfesional: string;
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
      especialidad: doctor.especialidad,
    };
  }
}
