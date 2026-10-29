import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { RolUsuario } from "@prisma/client";
import {
  activateUser,
  createDoctor,
  deactivateUser,
  getUser,
  listUsers,
  updateUser,
} from "./users.controller.js";

export const usersRouter = Router();
const adminOnly = [requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR)];

usersRouter.get("/", ...adminOnly, listUsers);
usersRouter.post("/doctors", ...adminOnly, createDoctor);
usersRouter.get("/:id", ...adminOnly, getUser);
usersRouter.patch("/:id", ...adminOnly, updateUser);
usersRouter.patch("/:id/deactivate", ...adminOnly, deactivateUser);
usersRouter.patch("/:id/activate", ...adminOnly, activateUser);
