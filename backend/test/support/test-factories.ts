import request from "supertest";
import type { Express } from "express";

export type TestRole = "PACIENTE" | "MEDICO" | "ADMINISTRADOR";

export type TestUser = {
  id: string;
  nombre: string;
  correo: string;
  rol: TestRole;
};

// Genera un usuario estable y permite sobrescribir solo los datos necesarios para cada prueba.
export const buildTestUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: "00000000-0000-0000-0000-000000000001",
  nombre: "Usuario de prueba",
  correo: "prueba@example.test",
  rol: "PACIENTE",
  ...overrides,
});

// SuperTest conserva las cookies entre peticiones para simular una sesion de navegador.
export const createTestAgent = (app: Express) => request.agent(app);
