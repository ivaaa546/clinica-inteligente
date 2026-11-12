import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { RolUsuario } from "@prisma/client";
import {
  activateUser,
  createDoctor,
  deactivateUser,
  getOwnUser,
  getUser,
  listUsers,
  updateOwnUser,
  updateUser,
} from "./users.controller.js";

export const usersRouter = Router();
const adminOnly = [requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR)];

usersRouter.get("/", ...adminOnly, listUsers);
usersRouter.post("/doctors", ...adminOnly, createDoctor);
usersRouter.get("/me", requireAuth(prisma), getOwnUser);
usersRouter.patch("/me", requireAuth(prisma), updateOwnUser);
usersRouter.get("/:id", ...adminOnly, getUser);
usersRouter.patch("/:id", ...adminOnly, updateUser);
usersRouter.patch("/:id/deactivate", ...adminOnly, deactivateUser);
usersRouter.patch("/:id/activate", ...adminOnly, activateUser);
