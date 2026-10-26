import { z } from "zod";
export const preconsultationSchema = z.object({
    // La cita identifica al paciente y al médico que podrán consultar la preconsulta.
    citaId: z.string().uuid(),
    motivoConsulta: z.string().min(1),
    antecedentesIniciales: z.any().optional(),
});
//# sourceMappingURL=preconsultations.schema.js.map