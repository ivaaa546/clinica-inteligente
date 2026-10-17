import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { getDoctor, getOwnDoctor, listDoctors, updateOwnDoctor } from "./doctors.controller.js";

export const doctorsRouter = Router();
doctorsRouter.get("/", listDoctors);
doctorsRouter.get("/me", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), getOwnDoctor);
doctorsRouter.patch("/me", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), updateOwnDoctor);
doctorsRouter.get("/:id", getDoctor);
