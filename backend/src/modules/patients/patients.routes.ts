import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { getBackground, getOwnProfile, getRecord, updateBackground, updateOwnProfile } from "./patients.controller.js";

export const patientsRouter = Router();
patientsRouter.get("/me", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE), getOwnProfile);
patientsRouter.patch("/me", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE), updateOwnProfile);
patientsRouter.get("/:id/record", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), getRecord);
patientsRouter.get("/:id/background", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), getBackground);
patientsRouter.patch("/:id/background", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), updateBackground);
