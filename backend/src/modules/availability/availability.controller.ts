import type { RequestHandler } from "express";
import { AvailabilityService } from "./availability.service.js";
import { availabilitySchema, updateAvailabilitySchema } from "./availability.schema.js";

export const listDoctorAvailability: RequestHandler = async (request, response, next) => {
  try { response.json(await new AvailabilityService(request.app.locals.prisma).listForDoctor(String(request.params.id))); } catch (error) { next(error); }
};

export const listOwnAvailability: RequestHandler = async (request, response, next) => {
  try { response.json(await new AvailabilityService(request.app.locals.prisma).listForOwnDoctor(request.auth!.userId)); } catch (error) { next(error); }
};

export const publishAvailability: RequestHandler = async (request, response, next) => {
  try {
    const input = availabilitySchema.parse(request.body);
    response.status(201).json(await new AvailabilityService(request.app.locals.prisma).publish(request.auth!.userId, input.inicio, input.modalidades));
  } catch (error) { next(error); }
};

export const updateAvailability: RequestHandler = async (request, response, next) => {
  try {
    const input = updateAvailabilitySchema.parse(request.body);
    response.json(await new AvailabilityService(request.app.locals.prisma).updateModalities(request.auth!.userId, String(request.params.id), input.modalidades));
  } catch (error) { next(error); }
};

export const removeAvailability: RequestHandler = async (request, response, next) => {
  try { response.json(await new AvailabilityService(request.app.locals.prisma).remove(request.auth!.userId, String(request.params.id))); } catch (error) { next(error); }
};
