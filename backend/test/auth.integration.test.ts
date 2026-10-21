import argon2 from "argon2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "../src/lib/prisma.js";
import { app } from "../src/lib/app.js";

const hasTestDatabase = Boolean(process.env.TEST_DATABASE_URL);
const email = `integration-${Date.now()}@example.test`;
const password = "Integration-password-123!";

describe.skipIf(!hasTestDatabase)("autenticacion integrada", () => {
  let userId: string;
  const agent = request.agent(app);

  beforeAll(async () => {
    await prisma.auditoria.deleteMany({ where: { usuario: { correo: email } } });
    await prisma.paciente.deleteMany({ where: { usuario: { correo: email } } });
    await prisma.usuario.deleteMany({ where: { correo: email } });
  });

  afterAll(async () => {
    if (userId) {
      await prisma.auditoria.deleteMany({ where: { usuarioId: userId } });
      await prisma.paciente.deleteMany({ where: { usuarioId: userId } });
      await prisma.usuario.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  it("registra un paciente con hash Argon2id y sin exponer secretos", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      nombre: "Paciente",
      apellidos: "Integracion",
      correo: email,
      contrasena: password,
      telefono: "00000002",
      fechaNacimiento: "1990-01-01",
      sexo: "NO_ESPECIFICADO",
    });

    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty("contrasena");
    expect(response.body).not.toHaveProperty("contrasenaHash");
    userId = response.body.id;

    const user = await prisma.usuario.findUniqueOrThrow({ where: { id: userId } });
    expect(await argon2.verify(user.contrasenaHash, password)).toBe(true);
  });

  it("crea, conserva y destruye la sesion de login", async () => {
    const login = await agent.post("/api/v1/auth/login").send({ correo: email, contrasena: password });
    expect(login.status).toBe(200);

    const current = await agent.get("/api/v1/auth/me");
    expect(current.status).toBe(200);
    expect(current.body.id).toBe(userId);

    const logout = await agent.post("/api/v1/auth/logout");
    expect(logout.status).toBe(204);
    expect((await agent.get("/api/v1/auth/me")).status).toBe(401);
  });

  it("rechaza roles enviados en el registro publico", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      nombre: "Intento",
      apellidos: "No permitido",
      correo: `role-${Date.now()}@example.test`,
      contrasena: password,
      telefono: "00000003",
      fechaNacimiento: "1990-01-01",
      sexo: "M",
      rol: "ADMINISTRADOR",
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});
