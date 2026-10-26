import { AdminService } from "./admin.service.js";
import { adminAppointmentSchema } from "./admin.schema.js";
export const getMetrics = async (request, response, next) => {
    try {
        response.json(await new AdminService(request.app.locals.prisma).metrics());
    }
    catch (error) {
        next(error);
    }
};
export const listAppointments = async (request, response, next) => {
    try {
        response.json(await new AdminService(request.app.locals.prisma).listAppointments());
    }
    catch (error) {
        next(error);
    }
};
export const cancelAppointment = async (request, response, next) => {
    try {
        response.json(await new AdminService(request.app.locals.prisma).cancelAppointment(request.auth.userId, String(request.params.id)));
    }
    catch (error) {
        next(error);
    }
};
export const rescheduleAppointment = async (request, response, next) => {
    try {
        const input = adminAppointmentSchema.parse(request.body);
        response.json(await new AdminService(request.app.locals.prisma).rescheduleAppointment(request.auth.userId, String(request.params.id), input.nuevaDisponibilidadId));
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=admin.controller.js.map