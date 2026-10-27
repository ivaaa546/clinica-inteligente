import { ModalidadAtencion, PrismaClient } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { DoctorsRepository } from "../doctors/doctors.repository.js";
import { AvailabilityRepository } from "./availability.repository.js";

const blockDurationMs = 30 * 60 * 1000;

export class AvailabilityService {
  constructor(private readonly db: PrismaClient) {}

  listForDoctor(medicoId: string, from?: Date) {
    return new AvailabilityRepository(this.db).listByDoctor(medicoId, from);
  }

  async publish(
    doctorUserId: string,
    inicio: Date,
    modalidades: ModalidadAtencion[] = [ModalidadAtencion.PRESENCIAL],
  ) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
    if (!doctor) {
      throw new Error("Perfil de medico no encontrado");
    }

    const validatedModalities = this.validateModalities(modalidades, doctor.direccionAtencionPresencial);
    const fin = new Date(inicio.getTime() + blockDurationMs);
    if (inicio <= new Date()) {
      throw new Error("La disponibilidad debe ser futura");
    }

    const repository = new AvailabilityRepository(this.db);
    if (await repository.findOverlap(doctor.id, inicio, fin)) {
      throw new Error("La disponibilidad se solapa con otro bloque");
    }

    const availability = await repository.create({
      medicoId: doctor.id,
      inicio,
      fin,
      activa: true,
      modalidades: validatedModalities,
    });
    await new AuditService(this.db).record({
      usuarioId: doctorUserId,
      accion: "DISPONIBILIDAD_PUBLICADA",
      entidad: "Disponibilidad",
      entidadId: availability.id,
      detalle: { duracionMinutos: 30, modalidades: validatedModalities.join(",") },
    });

    return availability;
  }

  async updateModalities(doctorUserId: string, id: string, modalidades: ModalidadAtencion[]) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
    const repository = new AvailabilityRepository(this.db);
    const availability = await repository.findById(id);

    if (!doctor || !availability || availability.medicoId !== doctor.id || !availability.activa) {
      throw new Error("Disponibilidad no encontrada");
    }
    if (availability.inicio <= new Date()) {
      throw new Error("Solo se puede actualizar una disponibilidad futura");
    }
    if (await repository.countActiveAppointments(id)) {
      throw new Error("No se puede modificar una disponibilidad con citas activas");
    }

    const validatedModalities = this.validateModalities(modalidades, doctor.direccionAtencionPresencial);
    const updated = await repository.updateModalities(id, validatedModalities);
    await new AuditService(this.db).record({
      usuarioId: doctorUserId,
      accion: "MODALIDADES_DISPONIBILIDAD_ACTUALIZADAS",
      entidad: "Disponibilidad",
      entidadId: id,
      detalle: { modalidades: validatedModalities.join(",") },
    });

    return updated;
  }

  async remove(doctorUserId: string, id: string) {
    const doctor = await new DoctorsRepository(this.db).findByUserId(doctorUserId);
    const repository = new AvailabilityRepository(this.db);
    const availability = await repository.findById(id);

    if (!doctor || !availability || availability.medicoId !== doctor.id) {
      throw new Error("Disponibilidad no encontrada");
    }

    // Un bloque con una cita activa no se elimina para conservar la agenda y su historial.
    if (await repository.countActiveAppointments(id)) {
      throw new Error("No se puede eliminar disponibilidad con citas activas");
    }

    const removed = await repository.deactivate(id);
    await new AuditService(this.db).record({
      usuarioId: doctorUserId,
      accion: "DISPONIBILIDAD_DESACTIVADA",
      entidad: "Disponibilidad",
      entidadId: id,
    });

    return removed;
  }

  private validateModalities(
    modalidades: ModalidadAtencion[],
    direccionAtencionPresencial: string | null,
  ) {
    if (!modalidades.length || modalidades.length > 2) {
      throw new Error("La disponibilidad debe habilitar una o ambas modalidades");
    }
    if (new Set(modalidades).size !== modalidades.length || modalidades.some((value) => !Object.values(ModalidadAtencion).includes(value))) {
      throw new Error("Las modalidades de atencion no son validas");
    }
    if (
      modalidades.includes(ModalidadAtencion.PRESENCIAL) &&
      !direccionAtencionPresencial?.trim()
    ) {
      throw new Error("Se requiere una direccion presencial para habilitar esta modalidad");
    }

    return modalidades;
  }
}
