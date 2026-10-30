import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/lib/app.js";
import { prisma } from "../src/lib/prisma.js";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suffix = Date.now();
const password = "Consultations-password-123!";
const patientEmail = `consultations-patient-${suffix}@example.test`;
const doctorEmail = `consultations-doctor-${suffix}@example.test`;

const validVitalSigns = {
  pesoLb: 150,
  tallaCm: 170,
  temperatura: 36.5,
  presionArterial: "120/80",
  frecCardiaca: 70,
  frecRespiratoria: 16,
};

const consultationPayload = (citaId: string) => ({
  citaId,
  tipoFicha: "ADULTO",
  motivoConsulta: "Control general",
  historiaActual: "Sin síntomas de alarma",
  evaluacionClinica: {
    problemas_activos: ["Control preventivo"],
    signos_peligro: [],
  },
  diagnostico: "Paciente estable",
  observaciones: "Continuar controles",
  signosVitales: validVitalSigns,
});

describe.skipIf(!enabled)("cierre de consulta integrado", () => {
  let patientId: string;
  let doctorId: string;
  let patientUserId: string;
  let doctorUserId: string;
  let specialtyId: string;
  const availabilityIds: string[] = [];
  const appointmentIds: string[] = [];
  const doctorAgent = request.agent(app);

  beforeAll(async () => {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const specialty = await prisma.especialidad.create({
      data: { nombre: `Consultas ${suffix}` },
    });
    specialtyId = specialty.id;

    const patientUser = await prisma.usuario.create({
      data: {
        nombre: "Paciente",
        apellidos: "Consultas",
        correo: patientEmail,
        contrasenaHash: passwordHash,
        telefono: "00000031",
        rol: "PACIENTE",
      },
    });
    const doctorUser = await prisma.usuario.create({
      data: {
        nombre: "Medico",
        apellidos: "Consultas",
        correo: doctorEmail,
        contrasenaHash: passwordHash,
        telefono: "00000032",
        rol: "MEDICO",
      },
    });
    patientUserId = patientUser.id;
    doctorUserId = doctorUser.id;

    patientId = (
      await prisma.paciente.create({
        data: {
          usuarioId: patientUser.id,
          fechaNacimiento: new Date("1990-01-01"),
          sexo: "M",
        },
      })
    ).id;
    doctorId = (
      await prisma.medico.create({
        data: {
          usuarioId: doctorUser.id,
          especialidadId: specialty.id,
          numeroProfesional: `CONSULTAS-${suffix}`,
        },
      })
    ).id;

    for (let index = 1; index <= 4; index += 1) {
      const inicio = new Date(Date.now() + (24 + index) * 60 * 60 * 1_000);
      const disponibilidad = await prisma.disponibilidad.create({
        data: {
          medicoId: doctorId,
          inicio,
          fin: new Date(inicio.getTime() + 30 * 60 * 1_000),
        },
      });
      availabilityIds.push(disponibilidad.id);

      const cita = await prisma.cita.create({
        data: {
          pacienteId: patientId,
          medicoId: doctorId,
          disponibilidadId: disponibilidad.id,
          inicio: disponibilidad.inicio,
          fin: disponibilidad.fin,
          estado: "ACEPTADA", modalidad: "PRESENCIAL", direccionAtencionPresencial: "Direccion de prueba",
        },
      });
      appointmentIds.push(cita.id);
    }

    const login = await doctorAgent
      .post("/api/v1/auth/login")
      .send({ correo: doctorEmail, contrasena: password });
    expect(login.status).toBe(200);
  });

  afterAll(async () => {
    await prisma.auditoria.deleteMany({
      where: { usuarioId: { in: [patientUserId, doctorUserId] } },
    });
    await prisma.signosVitales.deleteMany({
      where: { consulta: { citaId: { in: appointmentIds } } },
    });
    await prisma.consulta.deleteMany({
      where: { citaId: { in: appointmentIds } },
    });
    await prisma.cita.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.disponibilidad.deleteMany({
      where: { id: { in: availabilityIds } },
    });
    await prisma.medico.delete({ where: { id: doctorId } });
    await prisma.paciente.delete({ where: { id: patientId } });
    await prisma.usuario.deleteMany({
      where: { id: { in: [patientUserId, doctorUserId] } },
    });
    await prisma.especialidad.delete({ where: { id: specialtyId } });
  });

  it("permite cerrar sin un signo vital y lo normaliza como no medido", async () => {
    const { frecRespiratoria: _missing, ...incompleteVitalSigns } = validVitalSigns;
    const response = await doctorAgent
      .post("/api/v1/consultations")
      .send({ ...consultationPayload(appointmentIds[0]), signosVitales: incompleteVitalSigns });

    expect(response.status).toBe(201);
    const consultation = await prisma.consulta.findUniqueOrThrow({
      where: { citaId: appointmentIds[0] }, include: { signosVitales: true, cita: true },
    });
    expect(consultation.signosVitales?.frecRespiratoria).toBeNull();
    expect(consultation.signosVitales?.frecRespiratoriaEstado).toBe("NO_MEDIDO");
    expect(consultation.cita.estado).toBe("COMPLETADA");
  });

  it("rechaza una evaluacion que no corresponde a la ficha declarada", async () => {
    const response = await doctorAgent
      .post("/api/v1/consultations")
      .send({
        ...consultationPayload(appointmentIds[1]),
        evaluacionClinica: {
          semanas_gestacion: 24,
          posicion_fetal: "longitudinal",
          presentacion: "cefalica",
          signos_peligro: [],
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(await prisma.consulta.count({ where: { citaId: appointmentIds[1] } })).toBe(0);
    expect((await prisma.cita.findUniqueOrThrow({ where: { id: appointmentIds[1] } })).estado).toBe("ACEPTADA");
  });

  it("crea la consulta y sus signos vitales y completa la cita", async () => {
    const response = await doctorAgent
      .post("/api/v1/consultations")
      .send(consultationPayload(appointmentIds[2]));

    expect(response.status).toBe(201);
    const consultation = await prisma.consulta.findUniqueOrThrow({
      where: { citaId: appointmentIds[2] },
      include: { signosVitales: true, cita: true },
    });
    expect(consultation.signosVitales).not.toBeNull();
    expect(consultation.tipoFicha).toBe("ADULTO");
    expect(consultation.cita.estado).toBe("COMPLETADA");
  });

  it("revierte consulta, signos y estado si una escritura transaccional falla", async () => {
    const response = await doctorAgent
      .post("/api/v1/consultations")
      .send({
        ...consultationPayload(appointmentIds[3]),
        signosVitales: { ...validVitalSigns, pesoLb: 10_000 },
      });

    expect(response.status).toBe(500);
    expect(await prisma.consulta.count({ where: { citaId: appointmentIds[3] } })).toBe(0);
    expect((await prisma.cita.findUniqueOrThrow({ where: { id: appointmentIds[3] } })).estado).toBe("ACEPTADA");
    expect(
      await prisma.auditoria.count({
        where: { usuarioId: doctorUserId, accion: "CONSULTA_CREADA" },
      }),
    ).toBe(2);
  });
});
