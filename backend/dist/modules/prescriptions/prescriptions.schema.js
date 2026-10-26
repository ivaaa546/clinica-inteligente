import { z } from "zod";
export const prescriptionSchema = z.object({
    // Todos los campos son obligatorios para que la receta sea completa.
    consultaId: z.string().uuid(),
    medicamento: z.string().min(1),
    dosis: z.string().min(1),
    via: z.string().min(1),
    frecuencia: z.string().min(1),
    duracion: z.string().min(1),
    indicaciones: z.string().min(1),
});
//# sourceMappingURL=prescriptions.schema.js.map