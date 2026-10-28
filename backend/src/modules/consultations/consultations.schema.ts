import { EstadoSignoVital, TipoFichaClinica } from "@prisma/client";
import { z } from "zod";

const numberVital = z.union([z.number(), z.object({ estado: z.nativeEnum(EstadoSignoVital).optional(), valor: z.number().nullable().optional() })]);
const pressureVital = z.union([z.string().regex(/^\d{2,3}\/\d{2,3}$/), z.object({ estado: z.nativeEnum(EstadoSignoVital).optional(), valor: z.string().regex(/^\d{2,3}\/\d{2,3}$/).nullable().optional() })]);
const signs = z.object({ pesoLb: numberVital.optional(), tallaCm: numberVital.optional(), temperatura: numberVital.optional(), presionArterial: pressureVital.optional(), frecCardiaca: numberVital.optional(), frecRespiratoria: numberVital.optional() }).optional();
const evaluation = z.union([
  z.object({ tipoFicha: z.literal(TipoFichaClinica.ADULTO), evaluacionClinica: z.object({ problemas_activos: z.array(z.string()), signos_peligro: z.array(z.string()) }) }),
  z.object({ tipoFicha: z.literal(TipoFichaClinica.PRENATAL), evaluacionClinica: z.object({ semanas_gestacion: z.number(), posicion_fetal: z.string(), presentacion: z.string(), signos_peligro: z.array(z.string()) }) }),
  z.object({ tipoFicha: z.literal(TipoFichaClinica.NEONATO), evaluacionClinica: z.object({ peso_nacer_g: z.number(), apgar_1min: z.number(), apgar_5min: z.number(), edad_gestacional_semanas: z.number(), signos_peligro: z.array(z.string()) }) }),
]);
export const consultationSchema = z.object({ citaId: z.string().uuid(), tipoFicha: z.nativeEnum(TipoFichaClinica), motivoConsulta: z.string().min(1), historiaActual: z.string().optional(), diagnostico: z.string().min(1), observaciones: z.string().optional(), signosVitales: signs, evaluacionClinica: z.any().optional() }).superRefine((value, context) => { if (value.evaluacionClinica !== undefined && !evaluation.safeParse({ tipoFicha: value.tipoFicha, evaluacionClinica: value.evaluacionClinica }).success) context.addIssue({ code: z.ZodIssueCode.custom, message: "Evaluacion clinica invalida para la ficha seleccionada", path: ["evaluacionClinica"] }); });
