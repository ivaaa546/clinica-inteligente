import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/lib/app.js";
import { prisma } from "../src/lib/prisma.js";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suffix = Date.now();
const password = "Appointments-password-123!";
const patientEmail = `appointments-patient-${suffix}@example.test`;
const doctorEmail = `appointments-doctor-${suffix}@example.test`;

describe.skipIf(!enabled)("ciclo de citas integrado", () => {
  let patientId: string;
  let doctorId: string;
  let patientUserId: string;
  let doctorUserId: string;
  let specialtyId: string;
  const availabilityIds: string[] = [];
  const appointmentIds: string[] = [];

  beforeAll(async () => {
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    const specialty = await prisma.especialidad.create({ data: { nombre: `Agenda ${suffix}` } });
    specialtyId = specialty.id;
    const patientUser = await prisma.usuario.create({ data: { nombre: "Paciente", apellidos: "Agenda", correo: patientEmail, contrasenaHash: hash, telefono: "00000021", rol: "PACIENTE" } });
    const doctorUser = await prisma.usuario.create({ data: { nombre: "Medico", apellidos: "Agenda", correo: doctorEmail, contrasenaHash: hash, telefono: "00000022", rol: "MEDICO" } });
    patientUserId = patientUser.id;
    doctorUserId = doctorUser.id;
    patientId = (await prisma.paciente.create({ data: { usuarioId: patientUser.id, fechaNacimiento: new Date("1990-01-01"), sexo: "M" } })).id;
    doctorId = (await prisma.medico.create({ data: { usuarioId: doctorUser.id, especialidadId: specialty.id, numeroProfesional: `AGENDA-${suffix}` } })).id;
  });

  afterAll(async () => {
    await prisma.auditoria.deleteMany({ where: { usuarioId: { in: [patientUserId, doctorUserId] } } });
    await prisma.cita.deleteMany({ where: { medicoId: doctorId } });
    await prisma.disponibilidad.deleteMany({ where: { medicoId: doctorId } });
    await prisma.medico.deleteMany({ where: { id: doctorId } });
    await prisma.paciente.deleteMany({ where: { id: patientId } });
    await prisma.usuario.deleteMany({ where: { id: { in: [patientUserId, doctorUserId] } } });
    await prisma.especialidad.deleteMany({ where: { id: specialtyId } });
    await prisma.$disconnect();
  });

  const createAvailability = async (doctorAgent: request.SuperAgentTest, minutesFromNow: number) => {
    const response = await doctorAgent.post("/api/v1/availability").send({ inicio: new Date(Date.now() + minutesFromNow * 60_000).toISOString() });
    expect(response.status).toBe(201);
    availabilityIds.push(response.body.id);
    return response.body.id as string;
  };

  it("solicita y acepta una cita", async () => {
    const doctorAgent = request.agent(app);
    const patientAgent = request.agent(app);
    await doctorAgent.post("/api/v1/auth/login").send({ correo: doctorEmail, contrasena: password });
    await patientAgent.post("/api/v1/auth/login").send({ correo: patientEmail, contrasena: password });
    const availabilityId = await createAvailability(doctorAgent, 60);

    const requestResponse = await patientAgent.post("/api/v1/appointments").send({ medicoId: doctorId, disponibilidadId: availabilityId });
    expect(requestResponse.status).toBe(201);
    appointmentIds.push(requestResponse.body.id);
    expect(requestResponse.body.estado).toBe("PENDIENTE");

    const accepted = await doctorAgent.patch(`/api/v1/appointments/${requestResponse.body.id}/accept`);
    expect(accepted.status).toBe(200);
    expect(accepted.body.estado).toBe("ACEPTADA");
  });

  it("rechaza una cita y no permite aceptarla de nuevo", async () => {
    const doctorAgent = request.agent(app);
    const patientAgent = request.agent(app);
    await doctorAgent.post("/api/v1/auth/login").send({ correo: doctorEmail, contrasena: password });
    await patientAgent.post("/api/v1/auth/login").send({ correo: patientEmail, contrasena: password });
    const availabilityId = await createAvailability(doctorAgent, 120);
    const created = await patientAgent.post("/api/v1/appointments").send({ medicoId: doctorId, disponibilidadId: availabilityId });
    appointmentIds.push(created.body.id);
    expect((await doctorAgent.patch(`/api/v1/appointments/${created.body.id}/reject`)).body.estado).toBe("RECHAZADA");
    expect((await doctorAgent.patch(`/api/v1/appointments/${created.body.id}/accept`)).status).not.toBe(200);
  });

  it("cancela y reprograma solo citas futuras en estados permitidos", async () => {
    const doctorAgent = request.agent(app);
    const patientAgent = request.agent(app);
    await doctorAgent.post("/api/v1/auth/login").send({ correo: doctorEmail, contrasena: password });
    await patientAgent.post("/api/v1/auth/login").send({ correo: patientEmail, contrasena: password });
    const firstBlock = await createAvailability(doctorAgent, 180);
    const secondBlock = await createAvailability(doctorAgent, 240);
    const created = await patientAgent.post("/api/v1/appointments").send({ medicoId: doctorId, disponibilidadId: firstBlock });
    appointmentIds.push(created.body.id);
    const rescheduled = await patientAgent.patch(`/api/v1/appointments/${created.body.id}/reschedule`).send({ nuevaDisponibilidadId: secondBlock });
    appointmentIds.push(rescheduled.body.id);
    expect(rescheduled.body.estado).toBe("PENDIENTE");
    expect((await prisma.cita.findUniqueOrThrow({ where: { id: created.body.id } })).estado).toBe("REPROGRAMADA");
    expect((await patientAgent.patch(`/api/v1/appointments/${rescheduled.body.id}/cancel`)).body.estado).toBe("CANCELADA");
    expect((await patientAgent.patch(`/api/v1/appointments/${rescheduled.body.id}/reschedule`).send({ nuevaDisponibilidadId: firstBlock })).status).not.toBe(200);
  });

  it("permite una sola reserva ante solicitudes concurrentes", async () => {
    const doctorAgent = request.agent(app);
    const firstPatientAgent = request.agent(app);
    const secondPatientAgent = request.agent(app);
    await doctorAgent.post("/api/v1/auth/login").send({ correo: doctorEmail, contrasena: password });
    await firstPatientAgent.post("/api/v1/auth/login").send({ correo: patientEmail, contrasena: password });
    await secondPatientAgent.post("/api/v1/auth/login").send({ correo: patientEmail, contrasena: password });
    const availabilityId = await createAvailability(doctorAgent, 300);

    const responses = await Promise.all([
      firstPatientAgent.post("/api/v1/appointments").send({ medicoId: doctorId, disponibilidadId: availabilityId }),
      secondPatientAgent.post("/api/v1/appointments").send({ medicoId: doctorId, disponibilidadId: availabilityId }),
    ]);

    expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
    expect(responses.filter((response) => response.status !== 201)).toHaveLength(1);
    expect(await prisma.cita.count({ where: { disponibilidadId: availabilityId, estado: { in: ["PENDIENTE", "ACEPTADA"] } } })).toBe(1);
  });
});
