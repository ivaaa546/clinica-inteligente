import { DoctorsService } from "./doctors.service.js";
import { z } from "zod";
const updateDoctorSchema = z.object({
    numeroProfesional: z.string().min(1).optional(),
    especialidadId: z.string().uuid().optional(),
});
export const listDoctors = async (request, response, next) => {
    try {
        response.json(await new DoctorsService(request.app.locals.prisma).search(typeof request.query.especialidadId === "string" ? request.query.especialidadId : undefined));
    }
    catch (error) {
        next(error);
    }
};
export const getDoctor = async (request, response, next) => {
    try {
        response.json(await new DoctorsService(request.app.locals.prisma).getPublicProfile(String(request.params.id)));
    }
    catch (error) {
        next(error);
    }
};
export const getOwnDoctor = async (request, response, next) => {
    try {
        response.json(await new DoctorsService(request.app.locals.prisma).getOwnProfile(request.auth.userId));
    }
    catch (error) {
        next(error);
    }
};
export const updateOwnDoctor = async (request, response, next) => {
    try {
        const input = updateDoctorSchema.parse(request.body);
        response.json(await new DoctorsService(request.app.locals.prisma).updateOwnProfile(request.auth.userId, input));
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=doctors.controller.js.map