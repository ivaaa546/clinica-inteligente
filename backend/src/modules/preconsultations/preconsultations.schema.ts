import { z } from "zod";

export const vitalSignsSchema = z.object({
  tallaCm: z.number().positive().optional(),
}).strict();

export const preconsultationSchema = z.object({
  // La cita identifica al paciente y al médico que podrán consultar la preconsulta.
  citaId: z.string().uuid(),
  motivoConsulta: z.string().min(1),
  antecedentesIniciales: z.any().optional(),
  // En esta fase solo la talla puede ser autorreportada; los demás campos se obtendrán de dispositivos.
  signosVitales: vitalSignsSchema.optional(),
});
