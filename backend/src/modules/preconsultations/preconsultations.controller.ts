import type { RequestHandler } from "express";
import { PreconsultationsService } from "./preconsultations.service.js";
import { preconsultationSchema } from "./preconsultations.schema.js";

export const createPreconsultation: RequestHandler = async (request, response, next) => {
  try {
    // El controller valida la entrada y delega la autorización al service.
    const input = preconsultationSchema.parse(request.body);
    response.status(201).json(await new PreconsultationsService(request.app.locals.prisma).create(request.auth!.userId, input.citaId, input));
  } catch (error) { next(error); }
};

export const updatePreconsultation: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new PreconsultationsService(request.app.locals.prisma).update(request.auth!.userId, String(request.params.id), preconsultationSchema.omit({ citaId: true }).parse(request.body)));
  } catch (error) { next(error); }
};

export const getPreconsultation: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new PreconsultationsService(request.app.locals.prisma).getForDoctor(request.auth!.userId, String(request.params.citaId)));
  } catch (error) { next(error); }
};
