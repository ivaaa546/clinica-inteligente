import type { RequestHandler } from "express";
import { AvailabilityService } from "./availability.service.js";
import { availabilitySchema } from "./availability.schema.js";

export const listDoctorAvailability: RequestHandler = async (request, response, next) => {
  try { response.json(await new AvailabilityService(request.app.locals.prisma).listForDoctor(String(request.params.id))); } catch (error) { next(error); }
};

export const listOwnAvailability: RequestHandler = async (request, response, next) => {
  try { response.json(await new AvailabilityService(request.app.locals.prisma).listForDoctor(request.auth!.userId)); } catch (error) { next(error); }
};

export const publishAvailability: RequestHandler = async (request, response, next) => {
  try { response.status(201).json(await new AvailabilityService(request.app.locals.prisma).publish(request.auth!.userId, availabilitySchema.parse(request.body).inicio)); } catch (error) { next(error); }
};

export const removeAvailability: RequestHandler = async (request, response, next) => {
  try { response.json(await new AvailabilityService(request.app.locals.prisma).remove(request.auth!.userId, String(request.params.id))); } catch (error) { next(error); }
};
