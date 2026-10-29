import { ModalidadAtencion } from "@prisma/client";
import { z } from "zod";
import { vitalSignsSchema } from "../preconsultations/preconsultations.schema.js";

export const requestAppointmentSchema = z.object({
  medicoId: z.string().uuid(),
  disponibilidadId: z.string().uuid(),
  modalidad: z.nativeEnum(ModalidadAtencion),
  preconsulta: z.object({
    motivoConsulta: z.string().trim().min(1),
    antecedentesIniciales: z.string().trim().min(1),
    signosVitales: vitalSignsSchema.optional(),
  }),
});
export const rescheduleAppointmentSchema = z.object({
  nuevaDisponibilidadId: z.string().uuid(),
  modalidad: z.nativeEnum(ModalidadAtencion),
});
