import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { listDoctorAvailability, listOwnAvailability, publishAvailability, removeAvailability } from "./availability.controller.js";

export const availabilityRouter = Router();
availabilityRouter.get("/doctor/:id", listDoctorAvailability);
availabilityRouter.get("/me", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), listOwnAvailability);
availabilityRouter.post("/", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), publishAvailability);
availabilityRouter.delete("/:id", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), removeAvailability);
