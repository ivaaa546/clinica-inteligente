import { z } from "zod";
export declare const requestAppointmentSchema: z.ZodObject<{
    medicoId: z.ZodString;
    disponibilidadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    medicoId: string;
    disponibilidadId: string;
}, {
    medicoId: string;
    disponibilidadId: string;
}>;
export declare const rescheduleAppointmentSchema: z.ZodObject<{
    nuevaDisponibilidadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nuevaDisponibilidadId: string;
}, {
    nuevaDisponibilidadId: string;
}>;
