import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { createSpecialty, deactivateSpecialty, listSpecialties, updateSpecialty } from "./specialties.controller.js";
export const specialtiesRouter = Router();
specialtiesRouter.get("/", listSpecialties);
specialtiesRouter.post("/", requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR), createSpecialty);
specialtiesRouter.patch("/:id", requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR), updateSpecialty);
specialtiesRouter.patch("/:id/deactivate", requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR), deactivateSpecialty);
//# sourceMappingURL=specialties.routes.js.map