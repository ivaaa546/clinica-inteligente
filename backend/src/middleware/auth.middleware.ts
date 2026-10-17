import type { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "express";
import { UsersRepository } from "../modules/users/users.repository.js";

export const requireAuth = (db: PrismaClient): RequestHandler => async (request, response, next) => {
  try {
    const userId = request.session.userId;
    if (!userId) {
      response.status(401).json({ error: "Autenticacion requerida", code: "AUTH_REQUIRED" });
      return;
    }

    const user = await new UsersRepository(db).findById(userId);
    if (!user || !user.activo) {
      response.status(401).json({ error: "Sesion invalida", code: "INVALID_SESSION" });
      return;
    }

    // El contexto se obtiene de la base de datos, no de datos enviados por el cliente.
    request.auth = { userId: user.id, role: user.rol };
    next();
  } catch (error) {
    next(error);
  }
};
