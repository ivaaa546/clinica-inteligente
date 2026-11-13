import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/lib/app.js";
import { prisma } from "../src/lib/prisma.js";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suffix = Date.now();
const key = { "x-device-key": process.env.DEVICE_API_KEY! };

describe.skipIf(!enabled)("signos vitales de dispositivo (ESP32)", () => {
  let specialtyId: string;
  let patientId: string;
  let doctorId: string;
  let availabilityId: string;
  let appointmentId: string;
  let pendingAppointmentId: string;
  let pendingAvailabilityId: string;
  const emails = [`vs-patient-${suffix}@example.test`, `vs-doctor-${suffix}@example.test`];
  const url = (id: string) => `/api/v1/devices/appointments/${id}/vital-signs`;

  beforeAll(async () => {
    const hash = await argon2.hash("Vital-signs-password-123!", { type: argon2.argon2id });
    specialtyId = (await prisma.especialidad.create({ data: { nombre: `VS Especialidad ${suffix}` } })).id;
    const patientUser = await prisma.usuario.create({ data: { nombre: "Paciente", apellidos: "VS", correo: emails[0], contrasenaHash: hash, telefono: "00000021", rol: "PACIENTE" } });
    const doctorUser = await prisma.usuario.create({ data: { nombre: "Medico", apellidos: "VS", correo: emails[1], contrasenaHash: hash, telefono: "00000022", rol: "MEDICO" } });
    patientId = (await prisma.paciente.create({ data: { usuarioId: patientUser.id, fechaNacimiento: new Date("1990-01-01"), sexo: "M" } })).id;
    doctorId = (await prisma.medico.create({ data: { usuarioId: doctorUser.id, especialidadId: specialtyId, numeroProfesional: `VS-${suffix}` } })).id;
    const start = new Date(Date.now() + 5 * 60_000);
    const availability = await prisma.disponibilidad.create({ data: { medicoId: doctorId, inicio: start, fin: new Date(+start + 1_800_000) } });
    availabilityId = availability.id;
    appointmentId = (await prisma.cita.create({ data: { pacienteId: patientId, medicoId: doctorId, disponibilidadId: availability.id, inicio: availability.inicio, fin: availability.fin, estado: "ACEPTADA", modalidad: "PRESENCIAL", direccionAtencionPresencial: "Direccion de prueba" } })).id;
    const start2 = new Date(Date.now() + 6 * 60_000);
    const availability2 = await prisma.disponibilidad.create({ data: { medicoId: doctorId, inicio: start2, fin: new Date(+start2 + 1_800_000) } });
    pendingAvailabilityId = availability2.id;
    pendingAppointmentId = (await prisma.cita.create({ data: { pacienteId: patientId, medicoId: doctorId, disponibilidadId: availability2.id, inicio: availability2.inicio, fin: availability2.fin, estado: "PENDIENTE", modalidad: "PRESENCIAL", direccionAtencionPresencial: "Direccion de prueba" } })).id;
    await prisma.preconsulta.create({ data: { citaId: appointmentId, motivoConsulta: "Control", signosVitales: { frecCardiaca: 70 } } });
  });

  afterAll(async () => {
    const ids = [appointmentId, pendingAppointmentId];
    await prisma.lecturaSignosVitales.deleteMany({ where: { citaId: { in: ids } } });
    await prisma.preconsulta.deleteMany({ where: { citaId: { in: ids } } });
    await prisma.cita.deleteMany({ where: { id: { in: ids } } });
    await prisma.disponibilidad.deleteMany({ where: { id: { in: [availabilityId, pendingAvailabilityId] } } });
    await prisma.medico.deleteMany({ where: { id: doctorId } });
    await prisma.paciente.deleteMany({ where: { id: patientId } });
    await prisma.usuario.deleteMany({ where: { correo: { in: emails } } });
    await prisma.especialidad.deleteMany({ where: { id: specialtyId } });
  });

  it("rechaza peticiones sin clave o con clave incorrecta", async () => {
    expect((await request(app).get(url(appointmentId))).status).toBe(401);
    expect((await request(app).get(url(appointmentId)).set("x-device-key", "incorrecta")).status).toBe(401);
  });

  it("GET devuelve la preconsulta como base y 404 si la cita no existe", async () => {
    const response = await request(app).get(url(appointmentId)).set(key);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ origen: "PRECONSULTA", frecCardiaca: 70 });
    expect((await request(app).get(url("00000000-0000-4000-8000-000000000000")).set(key)).status).toBe(404);
  });

  it("PUT inserta y luego actualiza la misma lectura sin duplicarla", async () => {
    const first = await request(app).put(url(appointmentId)).set(key).send({ frecCardiaca: 72, dispositivoId: "esp32-01" });
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ frecCardiaca: 72, dispositivoId: "esp32-01" });

    const second = await request(app).put(url(appointmentId)).set(key).send({ frecCardiaca: 80 });
    expect(second.body).toMatchObject({ frecCardiaca: 80 });
    expect(await prisma.lecturaSignosVitales.count({ where: { citaId: appointmentId } })).toBe(1);

    const read = await request(app).get(url(appointmentId)).set(key);
    expect(read.body).toMatchObject({ origen: "DISPOSITIVO", frecCardiaca: 80 });
  });

  it("valida el payload y el estado de la cita", async () => {
    expect((await request(app).put(url(appointmentId)).set(key).send({})).status).toBe(400);
    expect((await request(app).put(url(appointmentId)).set(key).send({ frecCardiaca: -5 })).status).toBe(400);
    expect((await request(app).put(url(appointmentId)).set(key).send({ frecCardiaca: 70, temperatura: 36 })).status).toBe(400);
    expect((await request(app).put(url(pendingAppointmentId)).set(key).send({ frecCardiaca: 70 })).status).toBe(422);
  });
});
