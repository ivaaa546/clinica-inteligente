import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { createPrescription, listConsultationPrescriptions, listOwnPrescriptions } from "./prescriptions.controller.js";
export const prescriptionsRouter = Router();
// La consulta del paciente se filtra dentro del servicio para mantener privacidad clínica.
prescriptionsRouter.post("/", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), createPrescription);
prescriptionsRouter.get("/consultation/:id", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), listConsultationPrescriptions);
prescriptionsRouter.get("/me", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE), listOwnPrescriptions);
//# sourceMappingURL=prescriptions.routes.js.map