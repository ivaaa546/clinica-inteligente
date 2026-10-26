import { z } from "zod";
export const requestAppointmentSchema = z.object({ medicoId: z.string().uuid(), disponibilidadId: z.string().uuid() });
export const rescheduleAppointmentSchema = z.object({ nuevaDisponibilidadId: z.string().uuid() });
//# sourceMappingURL=appointments.schema.js.map