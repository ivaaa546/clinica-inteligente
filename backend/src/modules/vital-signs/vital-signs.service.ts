import type { PrismaClient } from "@prisma/client";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import type { DeviceVitalSignsInput } from "./vital-signs.schema.js";
import { VitalSignsRepository } from "./vital-signs.repository.js";

export class VitalSignsService {
  constructor(private readonly db: PrismaClient) {}

  // Devuelve la lectura del dispositivo o, si aún no existe, los signos autorreportados en la preconsulta.
  async get(citaId: string) {
    const appointment = await this.findAppointment(citaId);
    const reading = await new VitalSignsRepository(this.db).findByAppointment(citaId);
    if (!reading) {
      const declared = (appointment.preconsulta?.signosVitales ?? {}) as { frecCardiaca?: number };
      return { citaId, origen: declared.frecCardiaca != null ? "PRECONSULTA" : "VACIO", frecCardiaca: declared.frecCardiaca ?? null };
    }
    return { citaId, origen: "DISPOSITIVO", ...this.present(reading) };
  }

  // PUT idempotente: reemplaza la lectura de la cita con los valores enviados.
  async put(citaId: string, input: DeviceVitalSignsInput) {
    const appointment = await this.findAppointment(citaId);
    if (appointment.estado !== "ACEPTADA") throw new Error("La cita debe estar aceptada para registrar signos vitales");
    if (await this.db.consulta.findUnique({ where: { citaId } })) throw new Error("La cita ya tiene una consulta registrada");

    const reading = await new VitalSignsRepository(this.db).upsert(citaId, {
      frecCardiaca: input.frecCardiaca,
      dispositivoId: input.dispositivoId ?? null,
      medidoEn: input.medidoEn ?? null,
    });
    return { citaId, origen: "DISPOSITIVO", ...this.present(reading) };
  }

  private async findAppointment(citaId: string) {
    const appointment = await new AppointmentsRepository(this.db).findById(citaId);
    if (!appointment) throw new Error("Cita no encontrada");
    return appointment;
  }

  private present(reading: NonNullable<Awaited<ReturnType<VitalSignsRepository["findByAppointment"]>>>) {
    return {
      frecCardiaca: reading.frecCardiaca,
      dispositivoId: reading.dispositivoId,
      medidoEn: reading.medidoEn,
      actualizadoEn: reading.actualizadoEn,
    };
  }
}
