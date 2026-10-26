import { UsersService } from "./users.service.js";
import { createDoctorSchema, updateUserSchema } from "./users.schema.js";
export const createDoctor = async (request, response, next) => {
    try {
        const input = createDoctorSchema.parse(request.body);
        const user = await new UsersService(request.app.locals.prisma).createDoctor(request.auth.userId, input);
        response.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
};
export const updateUser = async (request, response, next) => {
    try {
        const input = updateUserSchema.parse(request.body);
        const user = await new UsersService(request.app.locals.prisma).updateNonClinical(request.auth.userId, String(request.params.id), input);
        response.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
export const deactivateUser = async (request, response, next) => {
    try {
        const user = await new UsersService(request.app.locals.prisma).deactivate(request.auth.userId, String(request.params.id));
        response.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
export const listUsers = async (request, response, next) => {
    try {
        const users = await new UsersService(request.app.locals.prisma).list();
        response.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=users.controller.js.map