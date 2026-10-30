import { z } from "zod";

export const vitalSignsSchema = z.object({
  pesoLb: z.number().positive().optional(),
  tallaCm: z.number().positive().optional(),
  temperatura: z.number().positive().optional(),
  presionArterial: z.string().regex(/^\d{2,3}\/\d{2,3}$/).optional(),
  frecCardiaca: z.number().int().positive().optional(),
  frecRespiratoria: z.number().int().positive().optional(),
}).strict();

export const preconsultationSchema = z.object({
  // La cita identifica al paciente y al médico que podrán consultar la preconsulta.
  citaId: z.string().uuid(),
  motivoConsulta: z.string().min(1),
  antecedentesIniciales: z.any().optional(),
  // Son datos autorreportados y completamente opcionales antes de la consulta.
  signosVitales: vitalSignsSchema.optional(),
});
