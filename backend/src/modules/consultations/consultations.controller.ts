import type { RequestHandler } from "express";
import { ConsultationsService } from "./consultations.service.js";
import { consultationSchema } from "./consultations.schema.js";

export const createConsultation: RequestHandler = async (request, response, next) => {
  try {
    // La validación por ficha ocurre antes de iniciar la transacción clínica.
    response.status(201).json(await new ConsultationsService(request.app.locals.prisma).register(request.auth!.userId, consultationSchema.parse(request.body)));
  } catch (error) { next(error); }
};

export const getConsultation: RequestHandler = async (request, response, next) => {
  try { response.json(await new ConsultationsService(request.app.locals.prisma).getById(request.auth!.userId, String(request.params.id))); } catch (error) { next(error); }
};

export const getAppointmentConsultation: RequestHandler = async (request, response, next) => {
  try { response.json(await new ConsultationsService(request.app.locals.prisma).getByAppointment(request.auth!.userId, String(request.params.citaId))); } catch (error) { next(error); }
};
