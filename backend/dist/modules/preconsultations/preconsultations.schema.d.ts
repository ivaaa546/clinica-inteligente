import { z } from "zod";
export declare const preconsultationSchema: z.ZodObject<{
    citaId: z.ZodString;
    motivoConsulta: z.ZodString;
    antecedentesIniciales: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    citaId: string;
    motivoConsulta: string;
    antecedentesIniciales?: any;
}, {
    citaId: string;
    motivoConsulta: string;
    antecedentesIniciales?: any;
}>;
