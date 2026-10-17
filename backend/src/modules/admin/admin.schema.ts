import { z } from "zod";

export const adminAppointmentSchema = z.object({ nuevaDisponibilidadId: z.string().uuid() });
