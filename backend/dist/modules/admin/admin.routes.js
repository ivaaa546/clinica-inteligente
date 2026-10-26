import { RolUsuario } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRoles } from "../../middleware/role.middleware.js";
import { cancelAppointment, getMetrics, listAppointments, rescheduleAppointment } from "./admin.controller.js";
export const adminRouter = Router();
const adminOnly = [requireAuth(prisma), requireRoles(RolUsuario.ADMINISTRADOR)];
adminRouter.get("/metrics", ...adminOnly, getMetrics);
// Esta vista solo contiene agenda y estados; la auditoria no tiene endpoint publico.
adminRouter.get("/appointments", ...adminOnly, listAppointments);
adminRouter.patch("/appointments/:id/cancel", ...adminOnly, cancelAppointment);
adminRouter.patch("/appointments/:id/reschedule", ...adminOnly, rescheduleAppointment);
//# sourceMappingURL=admin.routes.js.map