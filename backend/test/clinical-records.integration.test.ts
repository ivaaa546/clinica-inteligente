import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/lib/app.js";
import { prisma } from "../src/lib/prisma.js";

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suffix = Date.now();
const password = "Clinical-records-password-123!";
const patientEmail = `clinical-records-patient-${suffix}@example.test`;
const doctorEmail = `clinical-records-doctor-${suffix}@example.test`;

describe.skipIf(!enabled)("preconsulta, antecedentes y recetas integrados", () => {
  let patientId: string;
  let patientUserId: string;
  let doctorId: string;
  let doctorUserId: string;
  let specialtyId: string;
  let availabilityId: string;
  let appointmentId: string;
  let preconsultationId: string;
  let consultationId: string;
  const patientAgent = request.agent(app);
  const doctorAgent = request.agent(app);

  beforeAll(async () => {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const specialty = await prisma.especialidad.create({
      data: { nombre: `Expediente ${suffix}` },
    });
    specialtyId = specialty.id;

    const patientUser = await prisma.usuario.create({
      data: {
        nombre: "Paciente",
        apellidos: "Expediente",
        correo: patientEmail,
        contrasenaHash: passwordHash,
        telefono: "00000041",
        rol: "PACIENTE",
      },
    });
    const doctorUser = await prisma.usuario.create({
      data: {
        nombre: "Medico",
        apellidos: "Expediente",
        correo: doctorEmail,
        contrasenaHash: passwordHash,
        telefono: "00000042",
        rol: "MEDICO",
      },
    });
    patientUserId = patientUser.id;
    doctorUserId = doctorUser.id;

    patientId = (
      await prisma.paciente.create({
        data: {
          usuarioId: patientUserId,
          fechaNacimiento: new Date("1990-01-01"),
          sexo: "F",
        },
      })
    ).id;
    doctorId = (
      await prisma.medico.create({
        data: {
          usuarioId: doctorUserId,
          especialidadId: specialtyId,
          numeroProfesional: `EXPEDIENTE-${suffix}`,
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
        estado: "ACEPTADA", modalidad: "PRESENCIAL", direccionAtencionPresencial: "Direccion de prueba",
      },
    });
    appointmentId = appointment.id;

    const patientLogin = await patientAgent
      .post("/api/v1/auth/login")
      .send({ correo: patientEmail, contrasena: password });
    const doctorLogin = await doctorAgent
      .post("/api/v1/auth/login")
      .send({ correo: doctorEmail, contrasena: password });
    expect(patientLogin.status).toBe(200);
    expect(doctorLogin.status).toBe(200);

    const preconsultation = await patientAgent
      .post("/api/v1/preconsultations")
      .send({
        citaId: appointmentId,
        motivoConsulta: "Dolor de cabeza",
        antecedentesIniciales: { duracion: "dos dias" },
      });
    expect(preconsultation.status).toBe(201);
    preconsultationId = preconsultation.body.id;

    const consultation = await doctorAgent
      .post("/api/v1/consultations")
      .send({
        citaId: appointmentId,
        tipoFicha: "ADULTO",
        motivoConsulta: "Dolor de cabeza",
        evaluacionClinica: {
          problemas_activos: ["Cefalea"],
          signos_peligro: [],
        },
        diagnostico: "Cefalea tensional",
        signosVitales: {
          pesoLb: 130,
          tallaCm: 165,
          temperatura: 36.7,
          presionArterial: "110/70",
          frecCardiaca: 68,
          frecRespiratoria: 15,
        },
      });
    expect(consultation.status).toBe(201);
    consultationId = consultation.body.id;
  }, 30_000);

  afterAll(async () => {
    await prisma.auditoria.deleteMany({
      where: { usuarioId: { in: [patientUserId, doctorUserId] } },
    });
    await prisma.receta.deleteMany({ where: { consultaId: consultationId } });
    await prisma.signosVitales.deleteMany({ where: { consultaId: consultationId } });
    await prisma.consulta.deleteMany({ where: { id: consultationId } });
    await prisma.preconsulta.deleteMany({ where: { id: preconsultationId } });
    await prisma.antecedentesGineco.deleteMany({ where: { pacienteId: patientId } });
    await prisma.antecedentesGenerales.deleteMany({ where: { pacienteId: patientId } });
    await prisma.cita.delete({ where: { id: appointmentId } });
    await prisma.disponibilidad.delete({ where: { id: availabilityId } });
    await prisma.medico.delete({ where: { id: doctorId } });
    await prisma.paciente.delete({ where: { id: patientId } });
    await prisma.usuario.deleteMany({
      where: { id: { in: [patientUserId, doctorUserId] } },
    });
    await prisma.especialidad.delete({ where: { id: specialtyId } });
    await prisma.$disconnect();
  });

  it("inmoviliza la preconsulta despues de registrar la consulta", async () => {
    const response = await patientAgent
      .patch(`/api/v1/preconsultations/${preconsultationId}`)
      .send({
        motivoConsulta: "Intento de cambio posterior",
        antecedentesIniciales: { alterado: true },
      });

    expect(response.status).not.toBe(200);
    const stored = await prisma.preconsulta.findUniqueOrThrow({
      where: { id: preconsultationId },
    });
    expect(stored.motivoConsulta).toBe("Dolor de cabeza");
    expect(stored.antecedentesIniciales).toEqual({ duracion: "dos dias" });
  });

  it("actualiza antecedentes con trazabilidad sin guardar contenido clinico en auditoria", async () => {
    const response = await doctorAgent
      .patch(`/api/v1/patients/${patientId}/background`)
      .send({
        antecedentesGenerales: {
          medicos: { hipertension: false },
          quirurgicos: "Ninguno",
          familiares: { diabetes: true },
          habitos: { tabaco: false },
          alergias: "Penicilina",
        },
        antecedentesGineco: {
          gestas: 1,
          partos: 1,
          cesareas: 0,
          abortos: 0,
          hijosVivos: 1,
          planificacion: "Ninguna",
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.general.alergias).toBe("Penicilina");
    const audit = await prisma.auditoria.findFirstOrThrow({
      where: {
        usuarioId: doctorUserId,
        accion: "ANTECEDENTES_ACTUALIZADOS",
        entidadId: patientId,
      },
      orderBy: { ocurridoEn: "desc" },
    });
    expect(audit.entidad).toBe("Paciente");
    expect(audit.detalle).not.toContain("Penicilina");
    expect(audit.detalle).not.toContain("diabetes");
  });

  it("exige los seis campos de la receta y no incorpora firma digital", async () => {
    const incomplete = await doctorAgent
      .post("/api/v1/prescriptions")
      .send({
        consultaId: consultationId,
        medicamento: "Paracetamol",
        dosis: "500 mg",
        via: "oral",
        frecuencia: "cada 8 horas",
        duracion: "3 dias",
      });

    expect(incomplete.status).toBe(400);
    expect(incomplete.body.code).toBe("VALIDATION_ERROR");
    expect(await prisma.receta.count({ where: { consultaId: consultationId } })).toBe(0);

    const complete = await doctorAgent
      .post("/api/v1/prescriptions")
      .send({
        consultaId: consultationId,
        medicamento: "Paracetamol",
        dosis: "500 mg",
        via: "oral",
        frecuencia: "cada 8 horas",
        duracion: "3 dias",
        indicaciones: "Tomar despues de los alimentos",
      });

    expect(complete.status).toBe(201);
    expect(complete.body).toMatchObject({
      medicamento: "Paracetamol",
      dosis: "500 mg",
      via: "oral",
      frecuencia: "cada 8 horas",
      duracion: "3 dias",
      indicaciones: "Tomar despues de los alimentos",
    });
    expect(complete.body).not.toHaveProperty("firmaDigital");
    expect(complete.body).not.toHaveProperty("firma");
  });
});
