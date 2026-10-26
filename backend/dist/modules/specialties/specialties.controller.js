import { z } from "zod";
import { SpecialtiesService } from "./specialties.service.js";
const specialtySchema = z.object({ nombre: z.string().min(1) });
export const listSpecialties = async (_request, response, next) => {
    try {
        response.json(await new SpecialtiesService(response.req.app.locals.prisma).listPublic());
    }
    catch (error) {
        next(error);
    }
};
export const createSpecialty = async (request, response, next) => {
    try {
        response.status(201).json(await new SpecialtiesService(request.app.locals.prisma).create(request.auth.userId, specialtySchema.parse(request.body).nombre));
    }
    catch (error) {
        next(error);
    }
};
export const updateSpecialty = async (request, response, next) => {
    try {
        response.json(await new SpecialtiesService(request.app.locals.prisma).updateName(request.auth.userId, String(request.params.id), specialtySchema.parse(request.body).nombre));
    }
    catch (error) {
        next(error);
    }
};
export const deactivateSpecialty = async (request, response, next) => {
    try {
        response.json(await new SpecialtiesService(request.app.locals.prisma).deactivate(request.auth.userId, String(request.params.id)));
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=specialties.controller.js.map