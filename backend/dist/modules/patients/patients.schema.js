import { z } from "zod";
export const patientProfileSchema = z.object({
    direccion: z.string().optional(),
    ocupacion: z.string().optional(),
    nombreResponsable: z.string().optional(),
});
export const backgroundSchema = z.object({
    antecedentesGenerales: z.object({
        medicos: z.any().optional(),
        quirurgicos: z.string().optional(),
        familiares: z.any().optional(),
        habitos: z.any().optional(),
        alergias: z.string().min(1),
    }),
    antecedentesGineco: z
        .object({
        fur: z.coerce.date().optional(),
        gestas: z.number().int().nonnegative().optional(),
        partos: z.number().int().nonnegative().optional(),
        cesareas: z.number().int().nonnegative().optional(),
        abortos: z.number().int().nonnegative().optional(),
        hijosVivos: z.number().int().nonnegative().optional(),
        planificacion: z.string().optional(),
    })
        .optional(),
});
//# sourceMappingURL=patients.schema.js.map