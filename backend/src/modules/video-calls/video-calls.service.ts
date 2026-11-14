import { EstadoCita, PrismaClient, RolUsuario } from "@prisma/client";
import { env } from "../../lib/env.js";
import { ApiError } from "../../middleware/error.middleware.js";
import { AuditService } from "../audit/audit.service.js";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { LiveKitAdapter, type VideoAccess, type VideoCallProvider } from "./livekit.adapter.js";

type AuthenticatedActor = { userId: string; role: RolUsuario };

/** La sala se habilita 10 minutos antes del inicio de la cita. */
const VIDEO_EARLY_ACCESS_MS = 10 * 60_000;

export class VideoCallsService {
  private readonly provider: VideoCallProvider;

  constructor(private readonly db: PrismaClient, provider?: VideoCallProvider) {
    this.provider = provider ?? new LiveKitAdapter({
      url: requiredLiveKitConfig(env.livekit.url, "LIVEKIT_URL"),
      apiKey: requiredLiveKitConfig(env.livekit.apiKey, "LIVEKIT_API_KEY"),
      apiSecret: requiredLiveKitConfig(env.livekit.apiSecret, "LIVEKIT_API_SECRET"),
    });
  }

  async issueAccess(actor: AuthenticatedActor, appointmentId: string, now = new Date()): Promise<VideoAccess> {
    try {
      const appointment = await new AppointmentsRepository(this.db).findById(appointmentId);
      const denial = this.denialError(actor, appointment, now);
      if (denial) throw denial;

      const access = await this.provider.issueAccess({
        roomId: appointment!.salaVideoId!,
        participantId: `video-participant_${actor.userId}`,
      });
      await new AuditService(this.db).record({
        usuarioId: actor.userId,
        accion: "ACCESO_VIDEO_EMITIDO",
        entidad: "Cita",
        entidadId: appointmentId,
        detalle: { rol: actor.role, expiraEn: access.expiresAt.toISOString() },
      });
      return access;
    } catch (error) {
      await new AuditService(this.db).record({
        usuarioId: actor.userId,
        accion: "ACCESO_VIDEO_DENEGADO",
        entidad: "Cita",
        entidadId: appointmentId,
        detalle: { rol: actor.role, razon: error instanceof Error ? error.message : "ERROR_INTERNO" },
      });
      throw error;
    }
  }

  private denialError(
    actor: AuthenticatedActor,
    appointment: Awaited<ReturnType<AppointmentsRepository["findById"]>>,
    now: Date,
  ) {
    if (!appointment) return new ApiError(404, "APPOINTMENT_NOT_FOUND", "Cita no encontrada");
    if (actor.role === RolUsuario.ADMINISTRADOR) return new ApiError(403, "VIDEO_ACCESS_DENIED", "El administrador no puede acceder a videollamadas");
    if (actor.role === RolUsuario.PACIENTE && appointment.paciente.usuarioId !== actor.userId) return new ApiError(404, "APPOINTMENT_NOT_FOUND", "Cita no encontrada");
    if (actor.role === RolUsuario.MEDICO && appointment.medico.usuarioId !== actor.userId) return new ApiError(404, "APPOINTMENT_NOT_FOUND", "Cita no encontrada");
    if (![RolUsuario.PACIENTE, RolUsuario.MEDICO].includes(actor.role)) return new ApiError(403, "VIDEO_ACCESS_DENIED", "Rol no autorizado");
    if (appointment.modalidad !== "VIRTUAL" || !appointment.salaVideoId) return new ApiError(422, "VIDEO_NOT_AVAILABLE", "La cita no tiene videollamada");
    if (appointment.estado !== EstadoCita.ACEPTADA || appointment.videoRevocadaEn) return new ApiError(422, "VIDEO_NOT_AVAILABLE", "El acceso de videollamada no esta habilitado");
    if (now.getTime() < appointment.inicio.getTime() - VIDEO_EARLY_ACCESS_MS) return new ApiError(422, "VIDEO_TOO_EARLY", "La videollamada estara disponible 10 minutos antes de la hora programada");
    if (now >= appointment.fin) return new ApiError(422, "VIDEO_ENDED", "El horario de la videollamada ya finalizo");
    if (actor.role === RolUsuario.PACIENTE && !appointment.lecturaSignosVitales) {
      return new ApiError(422, "HEART_RATE_REQUIRED", "Debes registrar tu frecuencia cardiaca antes de entrar a la videollamada");
    }
    return null;
  }
}

function requiredLiveKitConfig(value: string | undefined, key: string) {
  if (!value) throw new Error(`${key} es obligatoria para emitir acceso a videollamada`);
  return value;
}
