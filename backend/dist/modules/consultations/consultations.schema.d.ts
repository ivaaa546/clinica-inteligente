import { z } from "zod";
export declare const consultationSchema: z.ZodEffects<z.ZodObject<{
    citaId: z.ZodString;
    tipoFicha: z.ZodNativeEnum<{
        ADULTO: "ADULTO";
        PRENATAL: "PRENATAL";
        NEONATO: "NEONATO";
    }>;
    motivoConsulta: z.ZodString;
    historiaActual: z.ZodOptional<z.ZodString>;
    diagnostico: z.ZodString;
    observaciones: z.ZodOptional<z.ZodString>;
    signosVitales: z.ZodObject<{
        pesoLb: z.ZodNumber;
        tallaCm: z.ZodNumber;
        temperatura: z.ZodNumber;
        presionArterial: z.ZodString;
        frecCardiaca: z.ZodNumber;
        frecRespiratoria: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        pesoLb: number;
        tallaCm: number;
        temperatura: number;
        presionArterial: string;
        frecCardiaca: number;
        frecRespiratoria: number;
    }, {
        pesoLb: number;
        tallaCm: number;
        temperatura: number;
        presionArterial: string;
        frecCardiaca: number;
        frecRespiratoria: number;
    }>;
    evaluacionClinica: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    signosVitales: {
        pesoLb: number;
        tallaCm: number;
        temperatura: number;
        presionArterial: string;
        frecCardiaca: number;
        frecRespiratoria: number;
    };
    citaId: string;
    motivoConsulta: string;
    tipoFicha: "ADULTO" | "PRENATAL" | "NEONATO";
    diagnostico: string;
    historiaActual?: string | undefined;
    evaluacionClinica?: any;
    observaciones?: string | undefined;
}, {
    signosVitales: {
        pesoLb: number;
        tallaCm: number;
        temperatura: number;
        presionArterial: string;
        frecCardiaca: number;
        frecRespiratoria: number;
    };
    citaId: string;
    motivoConsulta: string;
    tipoFicha: "ADULTO" | "PRENATAL" | "NEONATO";
    diagnostico: string;
    historiaActual?: string | undefined;
    evaluacionClinica?: any;
    observaciones?: string | undefined;
}>, {
    signosVitales: {
        pesoLb: number;
        tallaCm: number;
        temperatura: number;
        presionArterial: string;
        frecCardiaca: number;
        frecRespiratoria: number;
    };
    citaId: string;
    motivoConsulta: string;
    tipoFicha: "ADULTO" | "PRENATAL" | "NEONATO";
    diagnostico: string;
    historiaActual?: string | undefined;
    evaluacionClinica?: any;
    observaciones?: string | undefined;
}, {
    signosVitales: {
        pesoLb: number;
        tallaCm: number;
        temperatura: number;
        presionArterial: string;
        frecCardiaca: number;
        frecRespiratoria: number;
    };
    citaId: string;
    motivoConsulta: string;
    tipoFicha: "ADULTO" | "PRENATAL" | "NEONATO";
    diagnostico: string;
    historiaActual?: string | undefined;
    evaluacionClinica?: any;
    observaciones?: string | undefined;
}>;
