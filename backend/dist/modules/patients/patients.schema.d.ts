import { z } from "zod";
export declare const patientProfileSchema: z.ZodObject<{
    direccion: z.ZodOptional<z.ZodString>;
    ocupacion: z.ZodOptional<z.ZodString>;
    nombreResponsable: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    direccion?: string | undefined;
    ocupacion?: string | undefined;
    nombreResponsable?: string | undefined;
}, {
    direccion?: string | undefined;
    ocupacion?: string | undefined;
    nombreResponsable?: string | undefined;
}>;
export declare const backgroundSchema: z.ZodObject<{
    antecedentesGenerales: z.ZodObject<{
        medicos: z.ZodOptional<z.ZodAny>;
        quirurgicos: z.ZodOptional<z.ZodString>;
        familiares: z.ZodOptional<z.ZodAny>;
        habitos: z.ZodOptional<z.ZodAny>;
        alergias: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        alergias: string;
        medicos?: any;
        quirurgicos?: string | undefined;
        familiares?: any;
        habitos?: any;
    }, {
        alergias: string;
        medicos?: any;
        quirurgicos?: string | undefined;
        familiares?: any;
        habitos?: any;
    }>;
    antecedentesGineco: z.ZodOptional<z.ZodObject<{
        fur: z.ZodOptional<z.ZodDate>;
        gestas: z.ZodOptional<z.ZodNumber>;
        partos: z.ZodOptional<z.ZodNumber>;
        cesareas: z.ZodOptional<z.ZodNumber>;
        abortos: z.ZodOptional<z.ZodNumber>;
        hijosVivos: z.ZodOptional<z.ZodNumber>;
        planificacion: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fur?: Date | undefined;
        gestas?: number | undefined;
        partos?: number | undefined;
        cesareas?: number | undefined;
        abortos?: number | undefined;
        hijosVivos?: number | undefined;
        planificacion?: string | undefined;
    }, {
        fur?: Date | undefined;
        gestas?: number | undefined;
        partos?: number | undefined;
        cesareas?: number | undefined;
        abortos?: number | undefined;
        hijosVivos?: number | undefined;
        planificacion?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    antecedentesGenerales: {
        alergias: string;
        medicos?: any;
        quirurgicos?: string | undefined;
        familiares?: any;
        habitos?: any;
    };
    antecedentesGineco?: {
        fur?: Date | undefined;
        gestas?: number | undefined;
        partos?: number | undefined;
        cesareas?: number | undefined;
        abortos?: number | undefined;
        hijosVivos?: number | undefined;
        planificacion?: string | undefined;
    } | undefined;
}, {
    antecedentesGenerales: {
        alergias: string;
        medicos?: any;
        quirurgicos?: string | undefined;
        familiares?: any;
        habitos?: any;
    };
    antecedentesGineco?: {
        fur?: Date | undefined;
        gestas?: number | undefined;
        partos?: number | undefined;
        cesareas?: number | undefined;
        abortos?: number | undefined;
        hijosVivos?: number | undefined;
        planificacion?: string | undefined;
    } | undefined;
}>;
