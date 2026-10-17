import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { createConsultation, getAppointmentConsultation, getConsultation } from "./consultations.controller.js";

export const consultationsRouter = Router();
// Solo los médicos autenticados llegan a las operaciones clínicas.
consultationsRouter.post("/", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), createConsultation);
consultationsRouter.get("/appointment/:citaId", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), getAppointmentConsultation);
consultationsRouter.get("/:id", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), getConsultation);
