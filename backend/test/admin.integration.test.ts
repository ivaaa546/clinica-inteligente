import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/lib/app.js";
import { prisma } from "../src/lib/prisma.js";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suffix = Date.now();
const password = "Admin-password-123!";
const adminEmail = `admin-metrics-${suffix}@example.test`;
const patientEmail = `admin-patient-${suffix}@example.test`;
const doctorEmail = `admin-doctor-${suffix}@example.test`;

describe.skipIf(!enabled)("administracion integrada", () => {
  let adminUserId: string;
  let patientUserId: string;
  let patientId: string;
  let doctorUserId: string;
  let doctorId: string;
  let specialtyId: string;
  let availabilityId: string;
  let appointmentId: string;
  let consultationId: string;
  let prescriptionId: string;
  const adminAgent = request.agent(app);

  beforeAll(async () => {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const specialty = await prisma.especialidad.create({
      data: { nombre: `Administracion ${suffix}` },
    });
    specialtyId = specialty.id;

    const [admin, patientUser, doctorUser] = await Promise.all([
      prisma.usuario.create({
        data: {
          nombre: "Admin",
          apellidos: "Metricas",
          correo: adminEmail,
          contrasenaHash: passwordHash,
          telefono: "00000051",
          rol: "ADMINISTRADOR",
        },
      }),
      prisma.usuario.create({
        data: {
          nombre: "Paciente",
          apellidos: "Metricas",
          correo: patientEmail,
          contrasenaHash: passwordHash,
          telefono: "00000052",
          rol: "PACIENTE",
        },
      }),
      prisma.usuario.create({
        data: {
          nombre: "Medico",
          apellidos: "Metricas",
          correo: doctorEmail,
          contrasenaHash: passwordHash,
          telefono: "00000053",
          rol: "MEDICO",
        },
      }),
    ]);
    adminUserId = admin.id;
    patientUserId = patientUser.id;
    doctorUserId = doctorUser.id;

    patientId = (
      await prisma.paciente.create({
        data: {
          usuarioId: patientUserId,
          fechaNacimiento: new Date("1990-01-01"),
          sexo: "NO_ESPECIFICADO",
        },
      })
    ).id;
    doctorId = (
      await prisma.medico.create({
        data: {
          usuarioId: doctorUserId,
          especialidadId: specialtyId,
          numeroProfesional: `ADMIN-${suffix}`,
        },
      })
    ).id;

    const inicio = new Date(Date.now() + 24 * 60 * 60 * 1_000);
    const availability = await prisma.disponibilidad.create({
      data: {
        medicoId: doctorId,
        inicio,
        fin: new Date(inicio.getTime() + 30 * 60 * 1_000),
      },
    });
    availabilityId = availability.id;
    const appointment = await prisma.cita.create({
      data: {
        pacienteId: patientId,
        medicoId: doctorId,
        disponibilidadId: availabilityId,
        inicio: availability.inicio,
        fin: availability.fin,
        estado: "COMPLETADA", modalidad: "PRESENCIAL", direccionAtencionPresencial: "Direccion de prueba",
      },
    });
    appointmentId = appointment.id;
    const consultation = await prisma.consulta.create({
      data: {
        citaId: appointmentId,
        tipoFicha: "ADULTO",
        motivoConsulta: "Control",
        diagnostico: "Estable",
        fechaConsulta: new Date(),
        evaluacionClinica: { problemas_activos: [], signos_peligro: [] },
      },
    });
    consultationId = consultation.id;
    await prisma.signosVitales.create({
      data: {
        consultaId: consultationId,
        pesoLb: 150,
        tallaCm: 170,
        temperatura: 36.5,
        presionArterial: "120/80",
        frecCardiaca: 70,
        frecRespiratoria: 16,
      },
    });
    prescriptionId = (
      await prisma.receta.create({
        data: {
          consultaId: consultationId,
          medicamento: "Medicamento prueba",
          dosis: "1 tableta",
          via: "oral",
          frecuencia: "diaria",
          duracion: "3 dias",
          indicaciones: "Prueba",
        },
      })
    ).id;

    const login = await adminAgent
      .post("/api/v1/auth/login")
      .send({ correo: adminEmail, contrasena: password });
    expect(login.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.auditoria.deleteMany({
      where: { usuarioId: { in: [adminUserId, patientUserId, doctorUserId] } },
    });
    await prisma.receta.deleteMany({ where: { id: prescriptionId } });
    await prisma.signosVitales.deleteMany({ where: { consultaId: consultationId } });
    await prisma.consulta.deleteMany({ where: { id: consultationId } });
    await prisma.cita.deleteMany({ where: { id: appointmentId } });
    await prisma.disponibilidad.deleteMany({ where: { id: availabilityId } });
    await prisma.medico.delete({ where: { id: doctorId } });
    await prisma.paciente.delete({ where: { id: patientId } });
    await prisma.usuario.deleteMany({
      where: { id: { in: [adminUserId, patientUserId, doctorUserId] } },
    });
    await prisma.especialidad.delete({ where: { id: specialtyId } });
    await prisma.$disconnect();
  });

  it("entrega solo las metricas agregadas aprobadas", async () => {
    const response = await adminAgent.get("/api/v1/admin/metrics");

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual([
      "appointmentsByState",
      "completedConsultations",
      "doctors",
      "patients",
      "usersByRole",
    ]);
    expect(response.body.patients).toBeGreaterThanOrEqual(1);
    expect(response.body.doctors).toBeGreaterThanOrEqual(1);
    expect(response.body.completedConsultations).toBeGreaterThanOrEqual(1);
    expect(response.body.usersByRole).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rol: "ADMINISTRADOR", _count: { _all: expect.any(Number) } }),
        expect.objectContaining({ rol: "PACIENTE", _count: { _all: expect.any(Number) } }),
        expect.objectContaining({ rol: "MEDICO", _count: { _all: expect.any(Number) } }),
      ]),
    );
    expect(response.body.appointmentsByState).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ estado: "COMPLETADA", modalidad: "PRESENCIAL", direccionAtencionPresencial: "Direccion de prueba", _count: { _all: expect.any(Number) } }),
      ]),
    );
    expect(JSON.stringify(response.body)).not.toContain("diagnostico");
    expect(JSON.stringify(response.body)).not.toContain("receta");
  });

  it("desactiva la cuenta sin eliminar el historial clinico", async () => {
    const response = await adminAgent.patch(`/api/v1/users/${patientUserId}/deactivate`);

    expect(response.status).toBe(200);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: patientUserId } })).activo).toBe(false);
    expect(await prisma.cita.count({ where: { id: appointmentId } })).toBe(1);
    expect(await prisma.consulta.count({ where: { id: consultationId } })).toBe(1);
    expect(await prisma.receta.count({ where: { id: prescriptionId } })).toBe(1);
  });

  it("no expone auditoria mediante endpoints administrativos", async () => {
    const response = await adminAgent.get("/api/v1/admin/audit");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });
});
