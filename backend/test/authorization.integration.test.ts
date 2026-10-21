import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/lib/app.js";
import { prisma } from "../src/lib/prisma.js";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suffix = Date.now();
const password = "Authorization-password-123!";
const patientEmail = `authorization-patient-${suffix}@example.test`;
const doctorEmail = `authorization-doctor-${suffix}@example.test`;
const adminEmail = `authorization-admin-${suffix}@example.test`;

describe.skipIf(!enabled)("autorizacion clinica integrada", () => {
  let patientId: string;
  let doctorId: string;
  let adminId: string;
  let appointmentId: string;
  let specialtyId: string;
  let availabilityId: string;

  beforeAll(async () => {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const specialty = await prisma.especialidad.create({ data: { nombre: `Especialidad ${suffix}` } });
    specialtyId = specialty.id;
    const patientUser = await prisma.usuario.create({ data: { nombre: "Paciente", apellidos: "Auth", correo: patientEmail, contrasenaHash: passwordHash, telefono: "00000011", rol: "PACIENTE" } });
    const doctorUser = await prisma.usuario.create({ data: { nombre: "Medico", apellidos: "Auth", correo: doctorEmail, contrasenaHash: passwordHash, telefono: "00000012", rol: "MEDICO" } });
    const adminUser = await prisma.usuario.create({ data: { nombre: "Admin", apellidos: "Auth", correo: adminEmail, contrasenaHash: passwordHash, telefono: "00000013", rol: "ADMINISTRADOR" } });
    adminId = adminUser.id;
    const patient = await prisma.paciente.create({ data: { usuarioId: patientUser.id, fechaNacimiento: new Date("1990-01-01"), sexo: "M" } });
    patientId = patient.id;
    const doctor = await prisma.medico.create({ data: { usuarioId: doctorUser.id, especialidadId: specialty.id, numeroProfesional: `AUTH-${suffix}` } });
    doctorId = doctor.id;
    const availability = await prisma.disponibilidad.create({ data: { medicoId: doctor.id, inicio: new Date(Date.now() + 86_400_000), fin: new Date(Date.now() + 86_400_000 + 1_800_000) } });
    availabilityId = availability.id;
    const appointment = await prisma.cita.create({ data: { pacienteId: patient.id, medicoId: doctor.id, disponibilidadId: availability.id, inicio: availability.inicio, fin: availability.fin, estado: "ACEPTADA" } });
    appointmentId = appointment.id;
    await prisma.preconsulta.create({ data: { citaId: appointment.id, motivoConsulta: "Control", antecedentesIniciales: { declarado: true } } });
    const consultation = await prisma.consulta.create({ data: { citaId: appointment.id, tipoFicha: "ADULTO", motivoConsulta: "Control", diagnostico: "Estable", fechaConsulta: new Date(), evaluacionClinica: { problemas_activos: [], signos_peligro: [] } } });
    await prisma.signosVitales.create({ data: { consultaId: consultation.id, pesoLb: 150, tallaCm: 170, temperatura: 36.5, presionArterial: "120/80", frecCardiaca: 70, frecRespiratoria: 16 } });
    await prisma.receta.create({ data: { consultaId: consultation.id, medicamento: "Medicamento de prueba", dosis: "1", via: "oral", frecuencia: "diaria", duracion: "5 dias", indicaciones: "Prueba" } });
  });

  afterAll(async () => {
    await prisma.auditoria.deleteMany({ where: { usuarioId: { in: [adminId] } } });
    await prisma.receta.deleteMany({ where: { consulta: { citaId: appointmentId } } });
    await prisma.signosVitales.deleteMany({ where: { consulta: { citaId: appointmentId } } });
    await prisma.consulta.deleteMany({ where: { citaId: appointmentId } });
    await prisma.preconsulta.deleteMany({ where: { citaId: appointmentId } });
    await prisma.cita.deleteMany({ where: { id: appointmentId } });
    await prisma.disponibilidad.deleteMany({ where: { id: availabilityId } });
    await prisma.medico.deleteMany({ where: { id: doctorId } });
    await prisma.paciente.deleteMany({ where: { id: patientId } });
    await prisma.auditoria.deleteMany({ where: { usuario: { correo: { in: [patientEmail, doctorEmail, adminEmail] } } } });
    await prisma.usuario.deleteMany({ where: { correo: { in: [patientEmail, doctorEmail, adminEmail] } } });
    await prisma.especialidad.deleteMany({ where: { id: specialtyId } });
    await prisma.$disconnect();
  });

  const login = async (email: string) => {
    const agent = request.agent(app);
    await agent.post("/api/v1/auth/login").send({ correo: email, contrasena: password });
    return agent;
  };

  it("protege el expediente por rol y permite la preconsulta al medico asignado", async () => {
    const patientAgent = request.agent(app);
    const doctorAgent = request.agent(app);
    await patientAgent.post("/api/v1/auth/login").send({ correo: patientEmail, contrasena: password });
    await doctorAgent.post("/api/v1/auth/login").send({ correo: doctorEmail, contrasena: password });

    expect((await patientAgent.get(`/api/v1/patients/${patientId}/record`)).status).toBe(403);
    expect((await doctorAgent.get(`/api/v1/preconsultations/${appointmentId}`)).status).toBe(200);
  });

  it("expone al paciente solo sus recetas y diagnosticos", async () => {
    const patientAgent = await login(patientEmail);
    const response = await patientAgent.get("/api/v1/prescriptions/me");

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty("consulta");
    expect(response.body[0]).not.toHaveProperty("signosVitales");
  });

  it("rechaza funciones clinicas al administrador", async () => {
    const adminAgent = await login(adminEmail);
    expect((await adminAgent.get(`/api/v1/patients/${patientId}/record`)).status).toBe(403);
  });
});
