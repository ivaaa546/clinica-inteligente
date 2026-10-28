import { EstadoCita, RolUsuario } from "@prisma/client";
import type { RequestHandler } from "express";
import { AppointmentsService } from "./appointments.service.js";
import { requestAppointmentSchema, rescheduleAppointmentSchema } from "./appointments.schema.js";

const state = (value: unknown) => (typeof value === "string" ? value as EstadoCita : undefined);

export const requestAppointment: RequestHandler = async (request, response, next) => {
  try { const input = requestAppointmentSchema.parse(request.body); response.status(201).json(await new AppointmentsService(request.app.locals.prisma).request(request.auth!.userId, input.medicoId, input.disponibilidadId, input.modalidad)); } catch (error) { next(error); }
};
export const listOwnAppointments: RequestHandler = async (request, response, next) => {
  try { const service = new AppointmentsService(request.app.locals.prisma); const result = request.auth!.role === RolUsuario.PACIENTE ? await service.listForPatient(request.auth!.userId, state(request.query.estado)) : await service.listForDoctor(request.auth!.userId, state(request.query.estado)); response.json(result); } catch (error) { next(error); }
};
export const getAppointment: RequestHandler = async (request, response, next) => {
  try { response.json(await new AppointmentsService(request.app.locals.prisma).getForActor(request.auth!, String(request.params.id))); } catch (error) { next(error); }
};
export const acceptAppointment: RequestHandler = async (request, response, next) => {
  try { response.json(await new AppointmentsService(request.app.locals.prisma).accept(request.auth!.userId, String(request.params.id))); } catch (error) { next(error); }
};
export const rejectAppointment: RequestHandler = async (request, response, next) => {
  try { response.json(await new AppointmentsService(request.app.locals.prisma).reject(request.auth!.userId, String(request.params.id))); } catch (error) { next(error); }
};
export const cancelAppointment: RequestHandler = async (request, response, next) => {
  try { response.json(await new AppointmentsService(request.app.locals.prisma).cancel(request.auth!, String(request.params.id))); } catch (error) { next(error); }
};
export const rescheduleAppointment: RequestHandler = async (request, response, next) => {
  try { const input = rescheduleAppointmentSchema.parse(request.body); response.json(await new AppointmentsService(request.app.locals.prisma).reschedule(request.auth!, String(request.params.id), input.nuevaDisponibilidadId, input.modalidad)); } catch (error) { next(error); }
};
