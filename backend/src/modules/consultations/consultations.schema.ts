import { EstadoSignoVital, TipoFichaClinica } from "@prisma/client";
import { z } from "zod";

const rangedNumberVital = (min: number, max: number, message: string, integer = false) => {
  const base = integer ? z.number().int().min(min, message).max(max, message) : z.number().min(min, message).max(max, message);
  return z.union([
    base,
    z.object({ estado: z.nativeEnum(EstadoSignoVital).optional(), valor: base.nullable().optional() }),
  ]);
};
const pressureValue = z.string().regex(/^\d{2,3}\/\d{2,3}$/, "La presion debe usar el formato sistolica/diastolica, por ejemplo 135/90");
const pressureVital = z.union([
  pressureValue,
  z.object({ estado: z.nativeEnum(EstadoSignoVital).optional(), valor: pressureValue.nullable().optional() }),
]);
const signs = z.object({
  pesoLb: rangedNumberVital(0.1, 999.99, "El peso debe estar entre 0.1 y 999.99 lb").optional(),
  tallaCm: rangedNumberVital(1, 300, "La talla debe estar entre 1 y 300 cm").optional(),
  temperatura: rangedNumberVital(20, 50, "La temperatura debe estar entre 20 y 50 grados Celsius").optional(),
  presionArterial: pressureVital.optional(),
  frecCardiaca: rangedNumberVital(1, 300, "La frecuencia cardiaca debe ser un entero entre 1 y 300", true).optional(),
  frecRespiratoria: rangedNumberVital(1, 150, "La frecuencia respiratoria debe ser un entero entre 1 y 150", true).optional(),
}).optional();
const prescription = z.object({ medicamento: z.string().min(1), dosis: z.string().min(1), via: z.string().min(1), frecuencia: z.string().min(1), duracion: z.string().min(1), indicaciones: z.string().min(1) });
const evaluation = z.union([
  z.object({ tipoFicha: z.literal(TipoFichaClinica.ADULTO), evaluacionClinica: z.object({ problemas_activos: z.array(z.string()), signos_peligro: z.array(z.string()) }) }),
  z.object({ tipoFicha: z.literal(TipoFichaClinica.PRENATAL), evaluacionClinica: z.object({ semanas_gestacion: z.number(), posicion_fetal: z.string(), presentacion: z.string(), signos_peligro: z.array(z.string()) }) }),
  z.object({ tipoFicha: z.literal(TipoFichaClinica.NEONATO), evaluacionClinica: z.object({ peso_nacer_g: z.number(), apgar_1min: z.number(), apgar_5min: z.number(), edad_gestacional_semanas: z.number(), signos_peligro: z.array(z.string()) }) }),
]);
export const consultationSchema = z.object({ citaId: z.string().uuid(), tipoFicha: z.nativeEnum(TipoFichaClinica), motivoConsulta: z.string().min(1), historiaActual: z.string().optional(), diagnostico: z.string().min(1), observaciones: z.string().optional(), signosVitales: signs, evaluacionClinica: z.any().optional(), recetas: z.array(prescription).default([]) }).superRefine((value, context) => { if (value.evaluacionClinica !== undefined && !evaluation.safeParse({ tipoFicha: value.tipoFicha, evaluacionClinica: value.evaluacionClinica }).success) context.addIssue({ code: z.ZodIssueCode.custom, message: "Evaluacion clinica invalida para la ficha seleccionada", path: ["evaluacionClinica"] }); });
