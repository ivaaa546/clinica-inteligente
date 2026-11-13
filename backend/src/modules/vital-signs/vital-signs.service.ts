import type { PrismaClient } from "@prisma/client";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import type { DeviceVitalSignsInput } from "./vital-signs.schema.js";
import { VitalSignsRepository } from "./vital-signs.repository.js";

export class VitalSignsService {
  constructor(private readonly db: PrismaClient) {}

  // Solo una lectura real del dispositivo habilita la videollamada.
  async get(citaId: string) {
    await this.findAppointment(citaId);
    const reading = await new VitalSignsRepository(this.db).findByAppointment(citaId);
    if (!reading) return { citaId, origen: "VACIO", frecCardiaca: null };
    return { citaId, origen: "DISPOSITIVO", ...this.present(reading) };
  }

  // PUT idempotente: reemplaza la lectura de la cita con los valores enviados.
  async put(citaId: string, input: DeviceVitalSignsInput) {
    const appointment = await this.findAppointment(citaId);
    if (appointment.estado !== "ACEPTADA") throw new Error("La cita debe estar aceptada para registrar signos vitales");
    if (await this.db.consulta.findUnique({ where: { citaId } })) throw new Error("La cita ya tiene una consulta registrada");
    const now = new Date();
    const measurementStartsAt = new Date(appointment.inicio.getTime() - 10 * 60_000);
    if (now < measurementStartsAt || now >= appointment.fin) {
      throw new Error("La frecuencia cardiaca solo puede registrarse desde 10 minutos antes y durante la cita");
    }

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
