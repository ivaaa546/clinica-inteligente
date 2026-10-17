import type { RequestHandler } from "express";
import { backgroundSchema, patientProfileSchema } from "./patients.schema.js";
import { PatientsService } from "./patients.service.js";

export const getOwnProfile: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new PatientsService(request.app.locals.prisma).getOwnProfile(request.auth!.userId));
  } catch (error) {
    next(error);
  }
};

export const updateOwnProfile: RequestHandler = async (request, response, next) => {
  try {
    const input = patientProfileSchema.parse(request.body);
    response.json(await new PatientsService(request.app.locals.prisma).updateOwnProfile(request.auth!.userId, input));
  } catch (error) {
    next(error);
  }
};

export const getRecord: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new PatientsService(request.app.locals.prisma).getAuthorizedRecord(request.auth!.userId, String(request.params.id)));
  } catch (error) {
    next(error);
  }
};

export const getBackground: RequestHandler = async (request, response, next) => {
  try {
    response.json(await new PatientsService(request.app.locals.prisma).getBackground(request.auth!.userId, String(request.params.id)));
  } catch (error) {
    next(error);
  }
};

export const updateBackground: RequestHandler = async (request, response, next) => {
  try {
    const input = backgroundSchema.parse(request.body);
    const service = new PatientsService(request.app.locals.prisma);
    response.json(await service.updateBackground(request.auth!.userId, String(request.params.id), input.antecedentesGenerales, input.antecedentesGineco));
  } catch (error) {
    next(error);
  }
};
