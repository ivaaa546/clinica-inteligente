import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/lib/app.js";
import { buildTestUser, createTestAgent } from "./support/test-factories.js";

describe("configuracion HTTP", () => {
  // Comprueba que la aplicacion puede levantarse y responder sin depender de un modulo de dominio.
  it("responde al endpoint de salud", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("responde 404 uniforme para rutas desconocidas", async () => {
    const response = await request(app).get("/api/v1/no-existe");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Ruta no encontrada", code: "NOT_FOUND" });
  });

  // Comprueba que las utilidades basicas para futuras pruebas de autenticacion estan disponibles.
  it("crea fixtures de usuario y un agente con cookies persistentes", () => {
    const user = buildTestUser();
    const agent = createTestAgent(app);

    expect(user.rol).toBe("PACIENTE");
    expect(agent).toBeDefined();
  });
});
