import { ModalidadAtencion } from "@prisma/client";
import { z } from "zod";

export const requestAppointmentSchema = z.object({
  medicoId: z.string().uuid(),
  disponibilidadId: z.string().uuid(),
  modalidad: z.nativeEnum(ModalidadAtencion),
});
export const rescheduleAppointmentSchema = z.object({
  nuevaDisponibilidadId: z.string().uuid(),
  modalidad: z.nativeEnum(ModalidadAtencion),
});
