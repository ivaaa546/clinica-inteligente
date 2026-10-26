import { z } from "zod";
export declare const prescriptionSchema: z.ZodObject<{
    consultaId: z.ZodString;
    medicamento: z.ZodString;
    dosis: z.ZodString;
    via: z.ZodString;
    frecuencia: z.ZodString;
    duracion: z.ZodString;
    indicaciones: z.ZodString;
}, "strip", z.ZodTypeAny, {
    consultaId: string;
    medicamento: string;
    dosis: string;
    via: string;
    frecuencia: string;
    duracion: string;
    indicaciones: string;
}, {
    consultaId: string;
    medicamento: string;
    dosis: string;
    via: string;
    frecuencia: string;
    duracion: string;
    indicaciones: string;
}>;
