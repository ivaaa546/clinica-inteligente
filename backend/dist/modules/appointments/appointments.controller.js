import { RolUsuario } from "@prisma/client";
import { AppointmentsService } from "./appointments.service.js";
import { requestAppointmentSchema, rescheduleAppointmentSchema } from "./appointments.schema.js";
const state = (value) => (typeof value === "string" ? value : undefined);
export const requestAppointment = async (request, response, next) => {
    try {
        const input = requestAppointmentSchema.parse(request.body);
        response.status(201).json(await new AppointmentsService(request.app.locals.prisma).request(request.auth.userId, input.medicoId, input.disponibilidadId));
    }
    catch (error) {
        next(error);
    }
};
export const listOwnAppointments = async (request, response, next) => {
    try {
        const service = new AppointmentsService(request.app.locals.prisma);
        const result = request.auth.role === RolUsuario.PACIENTE ? await service.listForPatient(request.auth.userId, state(request.query.estado)) : await service.listForDoctor(request.auth.userId, state(request.query.estado));
        response.json(result);
    }
    catch (error) {
        next(error);
    }
};
export const getAppointment = async (request, response, next) => {
    try {
        response.json(await new AppointmentsService(request.app.locals.prisma).getForActor(request.auth, String(request.params.id)));
    }
    catch (error) {
        next(error);
    }
};
export const acceptAppointment = async (request, response, next) => {
    try {
        response.json(await new AppointmentsService(request.app.locals.prisma).accept(request.auth.userId, String(request.params.id)));
    }
    catch (error) {
        next(error);
    }
};
export const rejectAppointment = async (request, response, next) => {
    try {
        response.json(await new AppointmentsService(request.app.locals.prisma).reject(request.auth.userId, String(request.params.id)));
    }
    catch (error) {
        next(error);
    }
};
export const cancelAppointment = async (request, response, next) => {
    try {
        response.json(await new AppointmentsService(request.app.locals.prisma).cancel(request.auth, String(request.params.id)));
    }
    catch (error) {
        next(error);
    }
};
export const rescheduleAppointment = async (request, response, next) => {
    try {
        const input = rescheduleAppointmentSchema.parse(request.body);
        response.json(await new AppointmentsService(request.app.locals.prisma).reschedule(request.auth, String(request.params.id), input.nuevaDisponibilidadId));
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=appointments.controller.js.map