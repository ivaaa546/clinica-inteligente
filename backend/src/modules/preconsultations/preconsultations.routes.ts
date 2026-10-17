import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { createPreconsultation, getPreconsultation, updatePreconsultation } from "./preconsultations.controller.js";

export const preconsultationsRouter = Router();
// Los roles se aplican en la ruta; la relación concreta se valida en el servicio.
preconsultationsRouter.post("/", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE), createPreconsultation);
preconsultationsRouter.patch("/:id", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE), updatePreconsultation);
preconsultationsRouter.get("/:citaId", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), getPreconsultation);
