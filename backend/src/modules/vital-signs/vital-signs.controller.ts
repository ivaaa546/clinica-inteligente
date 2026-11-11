import type { RequestHandler } from "express";
import { deviceVitalSignsSchema } from "./vital-signs.schema.js";
import { VitalSignsService } from "./vital-signs.service.js";

const service = (request: Parameters<RequestHandler>[0]) => new VitalSignsService(request.app.locals.prisma);

export const getVitalSigns: RequestHandler = async (request, response, next) => {
  try { response.json(await service(request).get(String(request.params.citaId))); } catch (error) { next(error); }
};

export const putVitalSigns: RequestHandler = async (request, response, next) => {
  try { response.json(await service(request).put(String(request.params.citaId), deviceVitalSignsSchema.parse(request.body))); } catch (error) { next(error); }
};
