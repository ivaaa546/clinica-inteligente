import type { RequestHandler } from "express";
import { AuthService } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const register: RequestHandler = async (request, response, next) => {
  try {
    // Zod valida y normaliza la entrada antes de llegar al servicio de dominio.
    const input = registerSchema.parse(request.body);
    const user = await new AuthService(request.app.locals.prisma).registerPatient(input);
    response.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const user = await new AuthService(request.app.locals.prisma).login(
      input.correo,
      input.contrasena,
      request.session,
    );
    response.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (request, response, next) => {
  try {
    await new AuthService(request.app.locals.prisma).logout(request.session);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = async (request, response, next) => {
  try {
    const user = await new AuthService(request.app.locals.prisma).getSessionUser(request.auth!.userId);
    if (!user) {
      response.status(401).json({ error: "Sesion invalida", code: "INVALID_SESSION" });
      return;
    }
    response.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
