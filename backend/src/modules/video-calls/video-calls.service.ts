import { EstadoCita, PrismaClient, RolUsuario } from "@prisma/client";
import { env } from "../../lib/env.js";
import { AuditService } from "../audit/audit.service.js";
import { AppointmentsRepository } from "../appointments/appointments.repository.js";
import { LiveKitAdapter, type VideoAccess, type VideoCallProvider } from "./livekit.adapter.js";

type AuthenticatedActor = { userId: string; role: RolUsuario };

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
      const reason = this.denialReason(actor, appointment, now);
      if (reason) throw new Error(reason);

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

  private denialReason(
    actor: AuthenticatedActor,
    appointment: Awaited<ReturnType<AppointmentsRepository["findById"]>>,
    now: Date,
  ) {
    if (!appointment) return "Cita no encontrada";
    if (actor.role === RolUsuario.ADMINISTRADOR) return "El administrador no puede acceder a videollamadas";
    if (actor.role === RolUsuario.PACIENTE && appointment.paciente.usuarioId !== actor.userId) return "El paciente no esta asignado a la cita";
    if (actor.role === RolUsuario.MEDICO && appointment.medico.usuarioId !== actor.userId) return "El medico no esta asignado a la cita";
    if (![RolUsuario.PACIENTE, RolUsuario.MEDICO].includes(actor.role)) return "Rol no autorizado";
    if (appointment.modalidad !== "VIRTUAL" || !appointment.salaVideoId) return "La cita no tiene videollamada";
    if (appointment.estado !== EstadoCita.ACEPTADA || appointment.videoRevocadaEn) return "El acceso de videollamada no esta habilitado";
    // Una cita virtual aceptada puede abrirse en cualquier momento hasta que cambie de estado.
    return null;
  }
}

function requiredLiveKitConfig(value: string | undefined, key: string) {
  if (!value) throw new Error(`${key} es obligatoria para emitir acceso a videollamada`);
  return value;
}
