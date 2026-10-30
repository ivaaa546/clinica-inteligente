import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { optionalAuth, requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import {
  activateSpecialty,
  createSpecialty,
  deactivateSpecialty,
  deleteSpecialty,
  listSpecialties,
  updateSpecialty,
} from "./specialties.controller.js";

export const specialtiesRouter = Router();
specialtiesRouter.get("/", optionalAuth(prisma), listSpecialties);
specialtiesRouter.post("/", requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR), createSpecialty);
specialtiesRouter.patch("/:id", requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR), updateSpecialty);
specialtiesRouter.patch("/:id/deactivate", requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR), deactivateSpecialty);
specialtiesRouter.patch("/:id/activate", requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR), activateSpecialty);
specialtiesRouter.delete("/:id", requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR), deleteSpecialty);
