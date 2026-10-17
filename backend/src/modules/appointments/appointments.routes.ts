import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { acceptAppointment, cancelAppointment, getAppointment, listOwnAppointments, rejectAppointment, requestAppointment, rescheduleAppointment } from "./appointments.controller.js";

export const appointmentsRouter = Router();
appointmentsRouter.post("/", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE), requestAppointment);
appointmentsRouter.get("/me", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE, RolUsuario.MEDICO), listOwnAppointments);
appointmentsRouter.get("/:id", requireAuth(prisma), getAppointment);
appointmentsRouter.patch("/:id/accept", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), acceptAppointment);
appointmentsRouter.patch("/:id/reject", requireAuth(prisma), requireRoles(RolUsuario.MEDICO), rejectAppointment);
appointmentsRouter.patch("/:id/cancel", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE, RolUsuario.MEDICO, RolUsuario.ADMINISTRADOR), cancelAppointment);
appointmentsRouter.patch("/:id/reschedule", requireAuth(prisma), requireRoles(RolUsuario.PACIENTE, RolUsuario.MEDICO, RolUsuario.ADMINISTRADOR), rescheduleAppointment);
