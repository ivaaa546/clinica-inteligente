import type { RequestHandler } from "express";
import { AdminService } from "./admin.service.js";
import { adminAppointmentSchema } from "./admin.schema.js";

export const getMetrics: RequestHandler = async (request, response, next) => {
  try { response.json(await new AdminService(request.app.locals.prisma).metrics()); } catch (error) { next(error); }
};

export const listAppointments: RequestHandler = async (request, response, next) => {
  try { response.json(await new AdminService(request.app.locals.prisma).listAppointments()); } catch (error) { next(error); }
};

export const cancelAppointment: RequestHandler = async (request, response, next) => {
  try { response.json(await new AdminService(request.app.locals.prisma).cancelAppointment(request.auth!.userId, String(request.params.id))); } catch (error) { next(error); }
};

export const rescheduleAppointment: RequestHandler = async (request, response, next) => {
  try { const input = adminAppointmentSchema.parse(request.body); response.json(await new AdminService(request.app.locals.prisma).rescheduleAppointment(request.auth!.userId, String(request.params.id), input.nuevaDisponibilidadId)); } catch (error) { next(error); }
};
