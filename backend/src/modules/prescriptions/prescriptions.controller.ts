import type { RequestHandler } from "express";
import { PrescriptionsService } from "./prescriptions.service.js";
import { prescriptionSchema } from "./prescriptions.schema.js";

export const createPrescription: RequestHandler = async (request, response, next) => {
  try { response.status(201).json(await new PrescriptionsService(request.app.locals.prisma).create(request.auth!.userId, prescriptionSchema.parse(request.body))); } catch (error) { next(error); }
};

export const listConsultationPrescriptions: RequestHandler = async (request, response, next) => {
  try { response.json(await new PrescriptionsService(request.app.locals.prisma).listForDoctor(request.auth!.userId, String(request.params.id))); } catch (error) { next(error); }
};

export const listOwnPrescriptions: RequestHandler = async (request, response, next) => {
  try { response.json(await new PrescriptionsService(request.app.locals.prisma).listForPatient(request.auth!.userId)); } catch (error) { next(error); }
};
