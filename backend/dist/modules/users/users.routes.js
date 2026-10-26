import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { RolUsuario } from "@prisma/client";
import { createDoctor, deactivateUser, listUsers, updateUser } from "./users.controller.js";
export const usersRouter = Router();
const adminOnly = [requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR)];
usersRouter.post("/doctors", ...adminOnly, createDoctor);
usersRouter.patch("/:id", ...adminOnly, updateUser);
usersRouter.patch("/:id/deactivate", ...adminOnly, deactivateUser);
usersRouter.get("/", ...adminOnly, listUsers);
//# sourceMappingURL=users.routes.js.map