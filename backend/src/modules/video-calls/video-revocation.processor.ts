import { PrismaClient } from "@prisma/client";
import { env } from "../../lib/env.js";
import { AuditService } from "../audit/audit.service.js";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { LiveKitAdapter, type VideoCallProvider } from "./livekit.adapter.js";
import { VideoRevocationRepository } from "./video-revocation.repository.js";

export class VideoRevocationProcessor {
  private readonly provider: VideoCallProvider;

  constructor(private readonly db: PrismaClient, provider?: VideoCallProvider) {
    this.provider = provider ?? new LiveKitAdapter({
      url: required(env.livekit.url, "LIVEKIT_URL"),
      apiKey: required(env.livekit.apiKey, "LIVEKIT_API_KEY"),
      apiSecret: required(env.livekit.apiSecret, "LIVEKIT_API_SECRET"),
    });
  }

  async processNext(now = new Date()) {
    const tasks = new VideoRevocationRepository(this.db);
    const task = await tasks.claimNext(now);
    if (!task) return false;

    try {
      const appointment = await new AppointmentsRepository(this.db).findById(task.citaId);
      if (!appointment?.salaVideoId) {
        await tasks.complete(task.id, now);
        return true;
      }

      await this.provider.revokeParticipant({
        roomId: appointment.salaVideoId,
        participantId: `video-participant_${appointment.paciente.usuarioId}`,
      });
      await this.provider.revokeParticipant({
        roomId: appointment.salaVideoId,
        participantId: `video-participant_${appointment.medico.usuarioId}`,
      });

      // Solo el consumidor que completa efectivamente registra el éxito.
      if (await tasks.complete(task.id, now)) {
        await new AuditService(this.db).record({
          usuarioId: appointment.medico.usuarioId,
          accion: "ACCESO_VIDEO_REVOCADO",
          entidad: "Cita",
          entidadId: appointment.id,
          detalle: { causa: task.causa },
        });
      }
      return true;
    } catch {
      const delayMs = Math.min(60_000 * 2 ** Math.max(task.intentos - 1, 0), 60 * 60 * 1000);
      await tasks.releaseForRetry(task.id, new Date(now.getTime() + delayMs));
      return false;
    }
  }
}

function required(value: string | undefined, key: string) {
  if (!value) throw new Error(`${key} es obligatoria para procesar revocaciones`);
  return value;
}
