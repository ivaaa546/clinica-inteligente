import type { RolUsuario } from "@prisma/client";
import type { RequestHandler } from "express";

export const requireRoles = (...allowedRoles: RolUsuario[]): RequestHandler => (request, response, next) => {
  if (!request.auth || !allowedRoles.includes(request.auth.role)) {
    response.status(403).json({ error: "Rol no autorizado", code: "ROLE_FORBIDDEN" });
    return;
  }

  next();
};
