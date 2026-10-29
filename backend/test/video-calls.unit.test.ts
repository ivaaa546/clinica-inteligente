import { randomUUID } from "node:crypto";
import { EstadoCita, RolUsuario } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { LiveKitAdapter, type VideoAccessRequest, type VideoCallProvider } from "../src/modules/video-calls/livekit.adapter.js";
import { VideoCallsService } from "../src/modules/video-calls/video-calls.service.js";
import { VideoRevocationProcessor } from "../src/modules/video-calls/video-revocation.processor.js";
import { VideoRevocationRepository } from "../src/modules/video-calls/video-revocation.repository.js";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suffix = Date.now();
const now = new Date("2030-01-01T12:00:00.000Z");

class FakeVideoProvider implements VideoCallProvider {
  readonly accessRequests: VideoAccessRequest[] = [];
  readonly revocations: VideoAccessRequest[] = [];
  failNextRevocation = false;

  async issueAccess(request: VideoAccessRequest) {
    this.accessRequests.push(request);
    return { url: "https://fake.livekit.invalid", token: "fake-token-must-not-be-audited", expiresAt: new Date(now.getTime() + 10 * 60_000) };
  }

  async revokeParticipant(request: VideoAccessRequest) {
    this.revocations.push(request);
    if (this.failNextRevocation) {
      this.failNextRevocation = false;
      throw new Error("temporary provider failure");
    }
  }
}

function decodeJwtPayload(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as Record<string, unknown>;
}

describe("adaptador LiveKit", () => {
  it("emite claims mínimos, opacos y con expiración máxima de diez minutos", async () => {
    const adapter = new LiveKitAdapter(
      { url: "https://test.livekit.invalid", apiKey: "test-key", apiSecret: "test-secret" },
      () => new Date("2026-01-01T00:00:00.000Z"),
    );
    const roomId = "video-room_11111111-1111-1111-1111-111111111111";
    const participantId = "video-participant_22222222-2222-2222-2222-222222222222";
    const access = await adapter.issueAccess({ roomId, participantId });
    const claims = decodeJwtPayload(access.token);

    expect(access.url).toBe("https://test.livekit.invalid");
    expect(access.expiresAt.toISOString()).toBe("2026-01-01T00:10:00.000Z");
    expect(claims.sub).toBe(participantId);
    expect(claims.video).toMatchObject({ roomJoin: true, room: roomId, canPublish: true, canSubscribe: true, canPublishData: false });
    expect((claims.exp as number) - (claims.nbf as number)).toBeLessThanOrEqual(600);
  });

  it("rechaza identificadores no opacos", async () => {
    const adapter = new LiveKitAdapter({ url: "https://test.livekit.invalid", apiKey: "test-key", apiSecret: "test-secret" });
    await expect(adapter.issueAccess({ roomId: "patient@example.test", participantId: "video-participant_22222222-2222-2222-2222-222222222222" })).rejects.toThrow("identificador opaco");
  });
});

describe.skipIf(!enabled)("emisor y revocador de videollamadas", () => {
  let patientUserId: string;
  let doctorUserId: string;
  let thirdPartyUserId: string;
  let adminUserId: string;
  let patientId: string;
  let doctorId: string;
  let specialtyId: string;
  const appointmentIds: string[] = [];
  let appointmentSequence = 0;

  beforeAll(async () => {
    const specialty = await prisma.especialidad.create({ data: { nombre: `Video test ${suffix}` } });
    specialtyId = specialty.id;
    const [patient, doctor, thirdParty, admin] = await Promise.all([
      prisma.usuario.create({ data: { nombre: "Paciente", apellidos: "Video", correo: `video-patient-${suffix}@test.invalid`, contrasenaHash: "hash", telefono: "1", rol: "PACIENTE" } }),
      prisma.usuario.create({ data: { nombre: "Medico", apellidos: "Video", correo: `video-doctor-${suffix}@test.invalid`, contrasenaHash: "hash", telefono: "2", rol: "MEDICO" } }),
      prisma.usuario.create({ data: { nombre: "Tercero", apellidos: "Video", correo: `video-third-${suffix}@test.invalid`, contrasenaHash: "hash", telefono: "3", rol: "PACIENTE" } }),
      prisma.usuario.create({ data: { nombre: "Admin", apellidos: "Video", correo: `video-admin-${suffix}@test.invalid`, contrasenaHash: "hash", telefono: "4", rol: "ADMINISTRADOR" } }),
    ]);
    patientUserId = patient.id;
    doctorUserId = doctor.id;
    thirdPartyUserId = thirdParty.id;
    adminUserId = admin.id;
    patientId = (await prisma.paciente.create({ data: { usuarioId: patient.id, fechaNacimiento: new Date("1990-01-01"), sexo: "M" } })).id;
    await prisma.paciente.create({ data: { usuarioId: thirdParty.id, fechaNacimiento: new Date("1990-01-01"), sexo: "F" } });
    doctorId = (await prisma.medico.create({ data: { usuarioId: doctor.id, especialidadId: specialty.id, numeroProfesional: `VIDEO-${suffix}` } })).id;
  });

  afterAll(async () => {
    await prisma.auditoria.deleteMany({ where: { usuarioId: { in: [patientUserId, doctorUserId, thirdPartyUserId, adminUserId] } } });
    await prisma.tareaRevocacionVideo.deleteMany({ where: { cita: { medicoId: doctorId } } });
    await prisma.cita.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.disponibilidad.deleteMany({ where: { medicoId: doctorId } });
    await prisma.medico.deleteMany({ where: { id: doctorId } });
    await prisma.paciente.deleteMany({ where: { usuarioId: { in: [patientUserId, thirdPartyUserId] } } });
    await prisma.usuario.deleteMany({ where: { id: { in: [patientUserId, doctorUserId, thirdPartyUserId, adminUserId] } } });
    await prisma.especialidad.deleteMany({ where: { id: specialtyId } });
    await prisma.$disconnect();
  });

  async function createAppointment(estado: EstadoCita, inicio = new Date(now.getTime() + 60_000), modalidad: "VIRTUAL" | "PRESENCIAL" = "VIRTUAL") {
    const scheduledStart = new Date(inicio.getTime() + appointmentSequence++);
    const availability = await prisma.disponibilidad.create({ data: { medicoId: doctorId, inicio: scheduledStart, fin: new Date(scheduledStart.getTime() + 30 * 60_000), modalidades: [modalidad] } });
    const appointment = await prisma.cita.create({ data: {
      pacienteId: patientId, medicoId: doctorId, disponibilidadId: availability.id, inicio: scheduledStart, fin: availability.fin, estado, modalidad,
      direccionAtencionPresencial: modalidad === "PRESENCIAL" ? "Consultorio" : null,
      salaVideoId: modalidad === "VIRTUAL" ? `video-room_${randomUUID()}` : null,
    } });
    appointmentIds.push(appointment.id);
    return appointment;
  }

  it("autoriza solo a Paciente y Medico asignados para una cita virtual aceptada y nunca audita secretos", async () => {
    const appointment = await createAppointment("ACEPTADA", new Date(now.getTime() + 4 * 60_000));
    const provider = new FakeVideoProvider();
    const service = new VideoCallsService(prisma, provider);

    await expect(service.issueAccess({ userId: patientUserId, role: RolUsuario.PACIENTE }, appointment.id, now)).resolves.toMatchObject({ url: "https://fake.livekit.invalid" });
    await expect(service.issueAccess({ userId: doctorUserId, role: RolUsuario.MEDICO }, appointment.id, now)).resolves.toBeDefined();
    await expect(service.issueAccess({ userId: thirdPartyUserId, role: RolUsuario.PACIENTE }, appointment.id, now)).rejects.toThrow("no esta asignado");
    await expect(service.issueAccess({ userId: adminUserId, role: RolUsuario.ADMINISTRADOR }, appointment.id, now)).rejects.toThrow("administrador");
    expect(provider.accessRequests).toHaveLength(2);

    const records = await prisma.auditoria.findMany({ where: { entidadId: appointment.id } });
    expect(JSON.stringify(records)).not.toContain("fake-token-must-not-be-audited");
    expect(JSON.stringify(records)).not.toContain("https://fake.livekit.invalid");
  });

  it("deniega modalidad presencial y todos los estados no aceptados, sin restringir horario", async () => {
    const provider = new FakeVideoProvider();
    const service = new VideoCallsService(prisma, provider);
    const actor = { userId: patientUserId, role: RolUsuario.PACIENTE };
    const cases = [
      await createAppointment("ACEPTADA", new Date(now.getTime() + 60_000), "PRESENCIAL"),
      ...await Promise.all((["PENDIENTE", "RECHAZADA", "CANCELADA", "REPROGRAMADA", "COMPLETADA"] as EstadoCita[]).map((estado) => createAppointment(estado))),
    ];
    for (const appointment of cases) await expect(service.issueAccess(actor, appointment.id, now)).rejects.toThrow();
    const early = await createAppointment("ACEPTADA", new Date(now.getTime() + 6 * 60_000));
    const finished = await createAppointment("ACEPTADA", new Date(now.getTime() - 31 * 60_000));
    await expect(service.issueAccess(actor, early.id, now)).resolves.toBeDefined();
    await expect(service.issueAccess(actor, finished.id, now)).resolves.toBeDefined();
    expect(provider.accessRequests).toHaveLength(2);
  });

  it("reintenta revocaciones, revoca ambos participantes y registra el exito una sola vez sin secretos", async () => {
    const appointment = await createAppointment("CANCELADA");
    // Una fecha histórica aísla la cola de tareas reales o de otras suites de prueba.
    const revocationNow = new Date("1900-01-01T00:00:00.000Z");
    await new VideoRevocationRepository(prisma).enqueue(appointment.id, "CITA_CANCELADA", revocationNow);
    const provider = new FakeVideoProvider();
    provider.failNextRevocation = true;
    const processor = new VideoRevocationProcessor(prisma, provider);

    await expect(processor.processNext(revocationNow)).resolves.toBe(false);
    let task = await prisma.tareaRevocacionVideo.findFirstOrThrow({ where: { citaId: appointment.id } });
    expect(task.estado).toBe("PENDIENTE");
    expect(task.intentos).toBe(1);
    const retryAt = new Date(revocationNow.getTime() + 2 * 60_000);
    const retried = await processor.processNext(retryAt);
    task = await prisma.tareaRevocacionVideo.findFirstOrThrow({ where: { citaId: appointment.id } });
    expect(retried).toBe(true);
    expect(task.estado).toBe("COMPLETADA");
    expect(task.intentos).toBe(2);
    await expect(processor.processNext(retryAt)).resolves.toBe(false);
    expect(task.estado).toBe("COMPLETADA");
    expect(provider.revocations.filter((request) => request.roomId === appointment.salaVideoId)).toHaveLength(3);
    expect(new Set(provider.revocations.map((request) => request.participantId))).toEqual(new Set([`video-participant_${patientUserId}`, `video-participant_${doctorUserId}`]));
    const audit = await prisma.auditoria.findMany({ where: { entidadId: appointment.id, accion: "ACCESO_VIDEO_REVOCADO" } });
    expect(audit).toHaveLength(1);
    expect(JSON.stringify(audit)).not.toContain("fake-token-must-not-be-audited");
  });
});
